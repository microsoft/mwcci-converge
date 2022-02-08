// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Converge.Helpers;
using Converge.Models;
using Converge.Models.Enums;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Graph;
using Microsoft.Identity.Web;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Security.Principal;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Converge.Services
{
    public class UserGraphService
    {
        private readonly GraphServiceClient graphServiceClient;
        private readonly IConfiguration configuration;
        private readonly ITokenAcquisition tokenAcquisition;
        private readonly IMemoryCache memoryCache;
        private readonly AppGraphService appGraphService;
        private readonly SearchBingMapsService searchBingMapsService;  
        private readonly TelemetryService telemetryService;

        public string ConvergeExtensionId => appGraphService.ConvergeExtensionId;

        public string ConvergeDisplayName => appGraphService.ConvergeDisplayName;

        public UserGraphService(ITokenAcquisition tokenAcquisition,
                                IConfiguration configuration,
                                IMemoryCache memoryCache,
                                TelemetryService telemetryService,
                                AppGraphService appGraphSvc,
                                SearchBingMapsService searchBingMapsSvc)
        {
            this.tokenAcquisition = tokenAcquisition;
            this.configuration = configuration;
            this.memoryCache = memoryCache;
            this.telemetryService = telemetryService;
            this.appGraphService = appGraphSvc;
            this.searchBingMapsService = searchBingMapsSvc;

            var token = this.tokenAcquisition.GetAccessTokenForUserAsync(Constant.ScopesToAccessGraphApi).GetAwaiter().GetResult();
            graphServiceClient = new GraphServiceClient(new DelegateAuthenticationProvider((requestMessage) =>
            {
                requestMessage
                    .Headers
                    .Authorization = new AuthenticationHeaderValue("bearer", token);

                return Task.FromResult(0);
            }));
        }

        private IIdentity principalUserIdentity = null;
        public void SetPrincipalUserIdentity(IIdentity userIdentity)
        {
            principalUserIdentity = userIdentity;
        }

        public async Task<IUserCalendarViewCollectionPage> GetMyEvents(string startDateTime, string endDateTime, string filterClause = "", int top = 100, int skip = 0)
        {
            var queryOptions = new List<QueryOption> {
                new QueryOption("startDateTime", startDateTime),
                new QueryOption("endDateTime", endDateTime)
            };
            return await graphServiceClient.Me.CalendarView
                .Request(queryOptions)
                .Filter(filterClause)
                .OrderBy("start/dateTime")
                .Top(top)
                .Skip(skip)
                .GetAsync();
        }

        public async Task<GraphRoomsListResponse> GetRoomListsByName(int? top = 10, int? skip = 0)
        {
            var placesUrl = graphServiceClient.Places.AppendSegmentToRequestUrl($"microsoft.graph.roomList");
            var placesCollPage = await new GraphServicePlacesCollectionRequestBuilder(placesUrl, graphServiceClient)
                .Request()
                .OrderBy("displayName")
                .Header("ConsistencyLevel", "Eventual")
                .Top(top ?? 10)
                .Skip(skip ?? 0)
                .GetAsync();

            List<Place> placeList = placesCollPage.CurrentPage as List<Place>;

            return new GraphRoomsListResponse(placeList);
        }

        public async Task<GraphRoomsListResponse> SearchRoomLists(string searchString, int? topCount = 10, int? skip = 0)
        {
            var placesUrl = graphServiceClient.Places.AppendSegmentToRequestUrl("microsoft.graph.roomList");

            //Extending on the search by transforming the search-string to all-lower-case, ALL-UPPER-CASE and also to Proper/Pascal-case.
            //Eg. "San FRANcisco" transformed to "san francisco", "SAN FRANCISCO" and "San Francisco", besides search for the actual string.
            string allLowerCase = searchString.ToLower();
            string allUpperCase = searchString.ToUpper();
            string properCase = searchString;
            string[] multiWords = searchString.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            foreach (var word in multiWords)
            {
                var pascalCase = new StringBuilder(word.Substring(0, 1).ToUpper() + word.Substring(1).ToLower());
                properCase = properCase.Replace(word, pascalCase.ToString(), StringComparison.InvariantCultureIgnoreCase);
            }

            //Search for actual-string, all-lower-case, ALL-UPPER-CASE and Proper/Pascal-case.
            StringBuilder predicateBuilder = new StringBuilder($"emailAddress ne ''");
            predicateBuilder.Append($" and (");
            predicateBuilder.Append($"contains(displayName, '{searchString}')");
            predicateBuilder.Append($" or contains(displayName, '{properCase}')");
            predicateBuilder.Append($" or contains(displayName, '{allLowerCase}')");
            predicateBuilder.Append($" or contains(displayName, '{allUpperCase}')");
            predicateBuilder.Append($" or contains(address/city, '{searchString}')");
            predicateBuilder.Append($" or contains(address/city, '{properCase}')");
            predicateBuilder.Append($" or contains(address/city, '{allLowerCase}')");
            predicateBuilder.Append($" or contains(address/city, '{allUpperCase}')");
            predicateBuilder.Append($")");


            //Now lets build the request.
            var placesCollRequestBuilder = new GraphServicePlacesCollectionRequestBuilder(placesUrl, graphServiceClient);
            var placesCollPage = await placesCollRequestBuilder.Request().Header("ConsistencyLevel", "Eventual")
                                                    .Filter(predicateBuilder.ToString())
                                                    .OrderBy("displayName")
                                                    .Top(topCount.Value)
                                                    .Skip(skip.Value)
                                                    .GetAsync();

            List<Place> placeList = placesCollPage.CurrentPage as List<Place>;
            placeList = placeList.Where(r => r.AdditionalData != null && r.AdditionalData["emailAddress"] != null).ToList();

            return new GraphRoomsListResponse(placeList);
        }

        public async Task<WorkingHours> GetMyWorkingHours()
        {
            string mailboxSettingsUrl = graphServiceClient.Me.AppendSegmentToRequestUrl("mailboxSettings/workingHours");
            var workingHoursRequest = await new UserSettingsRequestBuilder(mailboxSettingsUrl, graphServiceClient).Request().GetAsync();
            var jsonWorkingHours = JsonConvert.SerializeObject(workingHoursRequest.AdditionalData);
            WorkingHours workingHours = JsonConvert.DeserializeObject<WorkingHours>(jsonWorkingHours);
            if (workingHours.StartTime == null || workingHours.EndTime == null)
            {
                workingHours = new WorkingHours
                {
                    EndTime = new TimeOfDay(17, 0, 0),
                    StartTime = new TimeOfDay(8, 0, 0),
                    TimeZone = new TimeZoneBase { Name = Constant.TimeZonePST },
                };
            }
            return workingHours;
        }

        public async Task<UserSearchPaginatedResponse> SearchUsers(string searchString, string queryOptionsString, ClaimsPrincipal appUserIdentity)
        {
            IList<QueryOption> queryOptionsList = null;
            if (!string.IsNullOrWhiteSpace(queryOptionsString))
            {
                queryOptionsList = JsonConvert.DeserializeObject<IList<QueryOption>>(queryOptionsString);
            }

            //Search the constraint in the Graph-users collection.
            var response = await SearchGraphUsers(searchString, queryOptionsList, appUserIdentity);

            var tasksList = new List<Task>();
            List<string> invalidIdsList = new List<string>();

            object p = new object();
            foreach (var user in response.Users)
            {
                tasksList.Add(Task.Run(async () =>
                {
                    try
                    {
                        Purpose purpose = await GetUserPurpose(user.Id);
                        if (purpose?.Value == "room")
                        {
                            lock (p) { invalidIdsList.Add(user.Id); }
                        }
                    }
                    catch (ServiceException)
                    {
                        lock (p) { invalidIdsList.Add(user.Id); }
                    }
                }));
            }
            //Await parallel-tasks completion.
            await Task.WhenAll(tasksList);

            response.Users.RemoveAll(u => u.Id.OneAmong(invalidIdsList));
            return response;
        }

        private async Task<UserSearchPaginatedResponse> SearchGraphUsers(string searchString, IList<QueryOption> queryOptions, ClaimsPrincipal appUserIdentity)
        {
            List<User> usersList = null;
            IGraphServiceUsersCollectionPage graphUsers = null;

            if (queryOptions == null)
            {
                graphUsers = await SearchGraphUsers(searchString, appUserIdentity);
            }
            else
            {
                graphUsers = await new GraphServiceUsersCollectionRequestBuilder(graphServiceClient.Users.RequestUrl, graphServiceClient)
                                            .Request(queryOptions)
                                            .Header("ConsistencyLevel", "eventual")
                                            .GetAsync();
            }

            usersList = (graphUsers.CurrentPage as List<User>).Where(p => p != null).ToList();
            var nextUsersQueryOptions = graphUsers.NextPageRequest != null ? graphUsers.NextPageRequest.QueryOptions : null;

            return new UserSearchPaginatedResponse(usersList, nextUsersQueryOptions);
        }

        private async Task<IGraphServiceUsersCollectionPage> SearchGraphUsers(string searchString, ClaimsPrincipal appUserIdentity)
        {
            const int top = 10;

            string appUserPrincipalName = appUserIdentity.Claims.ToList().Find(claim => claim.Type == "preferred_username")?.Value;
            appUserPrincipalName ??= appUserIdentity.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn")?.Value;
            appUserPrincipalName ??= string.Empty;

            Regex tenantRegex = new Regex(@"@(.+)");
            MatchCollection matches = tenantRegex.Matches(appUserPrincipalName);
            string tenant = (matches.Count > 0) ? matches[^1].Value : string.Empty;

            //Get comma-separated list of user-titles to filter out.
            string configJobTitles = configuration["FilterUsersByTitle"];

            List<string> jobTitlesList = new List<string>();
            if (!string.IsNullOrWhiteSpace(configJobTitles))
            {
                var jobTitlesCollection = configJobTitles.Split(",", StringSplitOptions.RemoveEmptyEntries);
                jobTitlesList.AddRange(jobTitlesCollection);
            }
            StringBuilder jobTitlesFilter = new StringBuilder();
            foreach(var jobTitle in jobTitlesList)
            {
                jobTitlesFilter.Append($"jobTitle ne '{jobTitle.Trim()}' and ");
            }
            string usersUrl = graphServiceClient.Users.AppendSegmentToRequestUrl($"?$filter={jobTitlesFilter}(startswith(displayName,'{searchString}') or startswith(userPrincipalName,'{searchString}') or startswith(jobTitle, '{searchString}')) and endswith(userPrincipalName,'{tenant}')&$count=true&$orderby=displayName&$top={top}");

            var graphUsers = await new GraphServiceUsersCollectionRequestBuilder(usersUrl, graphServiceClient)
                                        .Request()
                                        .Header("ConsistencyLevel", "eventual")
                                        .GetAsync();
            return graphUsers;
        }

        public async Task<User> GetUserByUpn(string upn)
        {
            return await graphServiceClient.Users[upn].Request()
                .Select(u => new
                {
                    u.Id,
                    u.UserPrincipalName,
                    u.DisplayName,
                })
                .GetAsync();
        }

        public async Task<User> GetUser(string upn)
        {
            try
            {
                return await graphServiceClient.Users[upn].Request().GetAsync();
            }
            catch (ServiceException)
            {
                return null;
            }
        }

        /// <summary>
        /// Purpose refers to the kind of user it is. Like "room".
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public async Task<Purpose> GetUserPurpose(string id)
        {
            graphServiceClient.BaseUrl = "https://graph.microsoft.com/beta/";
            Purpose purpose;
            if (!memoryCache.TryGetValue(id, out purpose))
            {
                try
                {
                    string mailboxSettingsUrl = graphServiceClient.Users[id].AppendSegmentToRequestUrl("mailboxSettings/userPurpose");
                    var workingHoursRequest = await new UserSettingsRequestBuilder(mailboxSettingsUrl, graphServiceClient).Request().GetAsync();
                    var jsonWorkingHours = JsonConvert.SerializeObject(workingHoursRequest.AdditionalData);
                    purpose = JsonConvert.DeserializeObject<Purpose>(jsonWorkingHours);
                    memoryCache.Set(id, purpose, new MemoryCacheEntryOptions().SetSlidingExpiration(TimeSpan.FromDays(1)));
                }
                catch (ServiceException)
                {
                    // do not error if not found
                }
                finally
                {
                    graphServiceClient.BaseUrl = "https://graph.microsoft.com/v1.0/";
                }
            }
            return purpose;
        }

        public async Task<Stream> GetUserPhoto(string upn)
        {
            try
            {
                string photoUrl = graphServiceClient.Users[upn].Photo.AppendSegmentToRequestUrl("$value");
                return await new ProfilePhotoContentRequestBuilder(photoUrl, graphServiceClient).Request().GetAsync();
            }
            catch (ServiceException)
            {
                return null;
            }
        }

        public async Task<List<Person>> GetMyPeople()
        {
            var request = await graphServiceClient.Me.People.Request().GetAsync();
            List<Person> people = request.CurrentPage as List<Person>;
            return people;
        }

        public async Task<ApiPresence> GetPresence(string id)
        {
            var presence = await graphServiceClient.Users[id].Presence.Request().GetAsync();
            return new ApiPresence(presence.Activity, presence.Availability);
        }

        public async Task<UserProfile> GetUserProfile(string id)
        {
            // User-presence Request
            var presenceRequest = graphServiceClient.Users[id].Presence.Request();
            // User-photo Request
            string photoUrl = graphServiceClient.Users[id].Photo.AppendSegmentToRequestUrl("$value");
            var photoRequest = new ProfilePhotoContentRequestBuilder(photoUrl, graphServiceClient).Request();

            // Build the batch and add each request as a step.
            var batchRequestContent = new BatchRequestContent();
            var presenceRequestId = batchRequestContent.AddBatchRequestStep(presenceRequest);
            var photoRequestId = batchRequestContent.AddBatchRequestStep(photoRequest);

            var graphResponse = await graphServiceClient.Batch.Request().PostAsync(batchRequestContent);

            ApiPresence apiPresence = null;
            byte[] userPhoto = null;

            // De-serialize response for Presence.
            try
            {
                var presence = await graphResponse.GetResponseByIdAsync<Presence>(presenceRequestId);
                apiPresence = new ApiPresence(presence.Activity, presence.Availability);
            }
            catch (ServiceException exception)
            {
                telemetryService.TrackException(exception, $"Failed getting Api-presence for user {id}.");
            }

            // De-serialize response for Photo.
            try
            {
                var photo = await graphResponse.GetResponseByIdAsync(photoRequestId);
                userPhoto = await photo.Content.ReadAsByteArrayAsync();
            }
            catch (ServiceException exception)
            {
                telemetryService.TrackException(exception, $"Failed retriving photo for user {id}");
            }

            return new UserProfile(apiPresence, userPhoto);
        }

        public async Task<ConvergeSettings> GetConvergeSettings()
        {
            var extensionsRequest = await graphServiceClient.Me.Extensions.Request().GetAsync();
            List<Extension> extensions = extensionsRequest.CurrentPage as List<Extension>;
            foreach (Extension extension in extensions)
            {
                if (extension.Id.SameAs(ConvergeExtensionId))
                {
                    var json = JsonConvert.SerializeObject(extension.AdditionalData);
                    return JsonConvert.DeserializeObject<ConvergeSettings>(json);
                }
            }
            return null;
        }

        public async Task SaveConvergeSettings(ConvergeSettings convergeSettings, DataOperationType operationType)
        {
            if (convergeSettings.ConvergeInstalledDate == null)
            {
                convergeSettings.ConvergeInstalledDate = DateTime.UtcNow;
            }
            if (!string.IsNullOrWhiteSpace(convergeSettings.ZipCode))
            {
                try
                {
                    convergeSettings.GeoCoordinates = await searchBingMapsService.GetGeoCoordsForZipcode(convergeSettings.ZipCode);
                }
                catch (ApplicationException)
                {
                    throw;
                }
            }

            string json = JsonConvert.SerializeObject(convergeSettings);
            var extension = new OpenTypeExtension
            {
                ExtensionName = ConvergeExtensionId,
                AdditionalData = JsonConvert.DeserializeObject<Dictionary<string, object>>(json)
            };

            if (operationType == DataOperationType.IsAdd)
            {
                await graphServiceClient
                        .Me
                        .Extensions
                        .Request()
                        .AddAsync(extension);
            }
            else if (operationType == DataOperationType.IsUpdate)
            {
                await graphServiceClient
                        .Me
                        .Extensions[ConvergeExtensionId]
                        .Request()
                        .UpdateAsync(extension);
            }
        }

        public async Task<List<UserCoordinates>> GetUsersCoordinates(MultiUserAvailableTimesRequest request)
        {
            List<UserCoordinates> userCoordinatesList = new List<UserCoordinates>();

            int index = 0;
            var teamMembers = request.UsersUpnList.Distinct().ToList();
            await foreach (var userConvergeSettings in appGraphService.GetUserExtensionsAsync(teamMembers))
            {
                GPSCoordinates userCoordinates = null;

                Calendar calendar = await appGraphService.GetConvergeCalendar(request.UsersUpnList[index]);
                if (calendar != null)
                {
                    userCoordinates = await GetUserCoordinatesByPrediction(request.UsersUpnList[index], calendar.Id, request.Year, request.Month, request.Day);
                }

                if (userCoordinates == null)
                {
                    if (userConvergeSettings == null || userConvergeSettings.GeoCoordinates == null)
                    {
                        try
                        {
                            userCoordinates = !string.IsNullOrWhiteSpace(userConvergeSettings?.ZipCode) ?
                                                await searchBingMapsService.GetGeoCoordsForZipcode(userConvergeSettings.ZipCode) : null;
                        }
                        catch (ApplicationException)
                        {
                            //To supress the exception, catch and reset the Coords.
                            userCoordinates = null;
                        }
                    }
                    else
                    {
                        userCoordinates = userConvergeSettings.GeoCoordinates;
                    }
                }
                if (userCoordinates != null)
                {
                    userCoordinatesList.Add(new UserCoordinates(request.UsersUpnList[index], userCoordinates));
                }
                index++;
            }

            return userCoordinatesList;
        }

        public async Task<GPSCoordinates> GetCurrentUserCoordinates()
        {
            WorkingHours workingHours = await appGraphService.GetWorkingHours(principalUserIdentity.Name);
            DateTime today = TimeZoneInfo.ConvertTimeBySystemTimeZoneId(DateTime.UtcNow, workingHours.TimeZone.Name);

            var userRequest = new MultiUserAvailableTimesRequest(new List<string> { principalUserIdentity.Name }, today);
            var userCoordsList = await GetUsersCoordinates(userRequest);

            return new GPSCoordinates(userCoordsList[0].Latitude, userCoordsList[0].Longitude);
        }

        public async Task<Dictionary<string, GPSCoordinates>> GetGeoCoordsForAllMembers(List<string> teamMembers, DateTime sourceDate)
        {
            Dictionary<string, GPSCoordinates> gpsCoordsDictionary = new Dictionary<string, GPSCoordinates>();

            var multiUserRequest = new MultiUserAvailableTimesRequest(teamMembers.Distinct().ToList(), sourceDate);
            var userCoordinates = await GetUsersCoordinates(multiUserRequest);

            userCoordinates.ForEach(x =>
            {
                var gpsCoordinates = new GPSCoordinates(x.Latitude, x.Longitude);
                gpsCoordsDictionary.Add(x.UserPrincipalName, gpsCoordinates);
            });

            return gpsCoordsDictionary;
        }

        public async Task<User> GetMyManager()
        {
            try
            {
                return await graphServiceClient.Me.Manager.Request().GetAsync() as User;
            }
            catch (ServiceException)
            {
                return null;
            }
        }

        public async Task<List<User>> GetMyReports()
        {
            var reportsRequest = await graphServiceClient.Me.DirectReports.Request().GetAsync();
            return reportsRequest.CurrentPage as List<User>;
        }

        public async Task<List<DirectoryObject>> GetReports(string upn)
        {
            var result = await graphServiceClient.Users[upn].DirectReports.Request().GetAsync();
            List<DirectoryObject> directReports = result.CurrentPage as List<DirectoryObject>;
            return directReports;
        }

        public async Task<Calendar> GetMyConvergeCalendar()
        {
            string convergeCalendarEpId = appGraphService.ConvergeCalendarEpId;
            var calendarRequest = await graphServiceClient.Me.Calendars.Request().Expand($"singleValueExtendedProperties($filter=id eq '{convergeCalendarEpId}')").GetAsync();
            List<Calendar> calendars = calendarRequest.CurrentPage as List<Calendar>;
            return calendars.Find(c => c.SingleValueExtendedProperties == null ? false : c.SingleValueExtendedProperties.Any(ep => ep.Id == convergeCalendarEpId));
        }

        public async Task<Event> GetMyConvergePrediction(string calendarId, int year, int month, int day)
        {
            DateTime startDate = new DateTime(year, month, day);
            string start = startDate.ToString("O");
            string end = startDate.AddDays(1).ToString("O");
            var eventRequest = await graphServiceClient.Me.Calendars[calendarId].Events.Request().Filter($"end/dateTime le '{end}' and start/dateTime ge '{start}'").Expand($"singleValueExtendedProperties($filter=id eq '{appGraphService.ConvergeCalendarEventId}')").GetAsync();
            List<Event> events = eventRequest.CurrentPage as List<Event>;
            return events.Find(e => e.SingleValueExtendedProperties.Any(svep => svep.Id == appGraphService.ConvergeCalendarEventId));
        }

        public async Task CreateMyConvergeCalendar()
        {
            var singleValueExtendedProperties = new CalendarSingleValueExtendedPropertiesCollectionPage();
            singleValueExtendedProperties.Add(new SingleValueLegacyExtendedProperty
            {
                Id = appGraphService.ConvergeCalendarEpId,
                Value = "true",
            });
            var calendar = new Calendar
            {
                Name = ConvergeDisplayName,
                SingleValueExtendedProperties = singleValueExtendedProperties,
                HexColor = "#e3008c"
            };
            await graphServiceClient.Me.Calendars
                .Request()
                .AddAsync(calendar);
        }

        public async Task<List<OutlookCategory>> GetMyCalendarCategories()
        {
            var catRequest = await graphServiceClient.Me.Outlook.MasterCategories.Request().GetAsync();
            var categories = catRequest.CurrentPage as List<OutlookCategory>;
            return categories;
        }

        public async Task CreateMyCalendarCategory(OutlookCategory category)
        {
            await graphServiceClient.Me.Outlook.MasterCategories.Request().AddAsync(category);
        }

        public async Task<Event> CreateEvent(CalendarEventRequest calendarEventRequest)
        {
            WorkingHours workingHours = await GetMyWorkingHours();
            string timeZone = workingHours.TimeZone.Name;
            TimeZoneInfo timeZoneInfo;
            try
            {
                timeZoneInfo = TimeZoneInfo.FindSystemTimeZoneById(timeZone);
            }
            catch (TimeZoneNotFoundException)
            {
                timeZone = Constant.TimeZonePST;
                timeZoneInfo = TimeZoneInfo.FindSystemTimeZoneById(timeZone);
            }

            var eventRequest = new Event
            {
                Location = calendarEventRequest.Location,
                Attendees = calendarEventRequest.Attendees.Select(x => new Attendee()
                {
                    EmailAddress = new EmailAddress
                    {
                        Address = x.EmailAddress,
                        Name = x.Name,
                    },
                    Type = x.Type,
                }).ToList(),
                Start = new DateTimeTimeZone
                {
                    DateTime = TimeZoneInfo.ConvertTime(calendarEventRequest.Start, timeZoneInfo).ToString(),
                    TimeZone = timeZone,
                },
                End = new DateTimeTimeZone
                {
                    DateTime = TimeZoneInfo.ConvertTime(calendarEventRequest.End, timeZoneInfo).ToString(),
                    TimeZone = timeZone,
                },
                IsAllDay = calendarEventRequest.IsAllDay,
                Subject = calendarEventRequest.Title,
                ShowAs = calendarEventRequest.ShowAs ?? FreeBusyStatus.Busy,
                Body = new ItemBody
                {
                    ContentType = BodyType.Html,
                    Content = calendarEventRequest.Body
                },
                ResponseRequested = true
            };

            var eventResponse = await graphServiceClient.Me.Events.Request().AddAsync(eventRequest);

            //Log the created request and its details.
            HashSet<KeyValuePair<string, string>> eventHash = new HashSet<KeyValuePair<string, string>>();
            try
            {
                eventHash.Add(new KeyValuePair<string, string>(nameof(eventResponse.ICalUId), eventResponse.ICalUId));
                eventHash.Add(new KeyValuePair<string, string>(nameof(eventResponse.Subject), eventResponse.Subject));
                eventHash.Add(new KeyValuePair<string, string>(nameof(eventResponse.Organizer), eventResponse.Organizer.EmailAddress.ToString()));
                eventHash.Add(new KeyValuePair<string, string>(nameof(eventResponse.CreatedDateTime), eventResponse.CreatedDateTime.ToString()));
                eventHash.Add(new KeyValuePair<string, string>("EventCreationStatus", 
                                (eventResponse.ResponseStatus == null) ? "Failure" : "Success"));
            }
            catch(ArgumentException ex)
            {
                eventHash.RemoveWhere(x => x.Key.SameAs(nameof(eventRequest.Subject))
                                            || x.Key.SameAs(nameof(eventRequest.Organizer))
                                            || x.Key.SameAs(nameof(eventRequest.CreatedDateTime)) 
                                            || x.Key.SameAs("EventCreationStatus"));
                eventHash.Add(new KeyValuePair<string, string>(nameof(eventRequest.Subject), eventRequest.Subject));
                eventHash.Add(new KeyValuePair<string, string>(nameof(eventRequest.Organizer), principalUserIdentity.Name));
                eventHash.Add(new KeyValuePair<string, string>(nameof(eventRequest.CreatedDateTime), DateTime.UtcNow.ToString()));
                eventHash.Add(new KeyValuePair<string, string>("EventCreationStatus", "Failure & Exception"));
                eventHash.Add(new KeyValuePair<string, string>("Exception", ex.Message + ". " + ex.InnerException?.Message));
            }

            telemetryService.TrackEvent("New calendar event created. - ", 
                                            eventHash.ToDictionary(x => x.Key, y => y.Value));
            return eventResponse;
        }

        public async Task DeleteEvent(string eventId, string messageComment = null)
        {
           await graphServiceClient.Me.Events[eventId].Cancel(messageComment).Request().PostAsync();
        }

        public async Task<GPSCoordinates> GetUserCoordinatesByPrediction(string userId, string calendarId, int year, int month, int day)
        {
            var predictionEvent = await appGraphService.GetConvergePrediction(userId, calendarId, year, month, day);
            if (predictionEvent == null || predictionEvent.Location == null)
            {
                return null;
            }
            else if (predictionEvent.Location.Coordinates != null 
                        && predictionEvent.Location.Coordinates.Latitude.HasValue && predictionEvent.Location.Coordinates.Longitude.HasValue)
            {
                var coordinatesOfPrediction = predictionEvent.Location.Coordinates;
                return new GPSCoordinates(coordinatesOfPrediction.Latitude.Value, coordinatesOfPrediction.Longitude.Value);
            }
            else if (predictionEvent.Location.Address != null)
            {
                var address = predictionEvent.Location.Address;
                try
                {
                    return await searchBingMapsService.GetGeoCoordsForAnAddress(address.Street, address.City, address.State, address.PostalCode);
                }
                catch (ApplicationException)
                {
                    return null;
                }
            }

            return null;
        }

        public async Task<MultiUserAvailableTimesResponse> GetMultiUserAvailabilityTimes(MultiUserAvailableTimesRequest request)
        {
            WorkingHours currentUserWorkingHours = await GetMyWorkingHours();
            MultiUserAvailableTimesResponse response = new MultiUserAvailableTimesResponse();

            // Pinpoints to exact date selected by the user
            DateTime targetDay = new DateTime(request.Year, request.Month, request.Day);

            // For availability times between a time range. and primarily for
            // representing the input in current user time zone
            DateTime? targetScheduleFrom = request.ScheduleFrom;
            DateTime? targetScheduleTo = request.ScheduleTo;

            var startDateTime = new DateTimeTimeZone
            {
                DateTime = (targetScheduleFrom ?? targetDay).ToString("O"),
                TimeZone = Constant.TimeZoneCodeUTC
            };
            var endDateTime = new DateTimeTimeZone
            {
                DateTime = (targetScheduleTo ?? targetDay.AddDays(1)).ToString("O"),
                TimeZone = Constant.TimeZoneCodeUTC
            };
            var dateTimeAtNow = DateTime.UtcNow;
            
            // The availability view is retrieved for each and every user between the UTC timerange.
            // irrespective of Timezone preference.
            var userCalendar = await graphServiceClient.Me.Calendar.GetSchedule(request.UsersUpnList, endDateTime, startDateTime)
                                                                    .Request()
                                                                    .Header("Prefer", $"outlook.timezone=\"{currentUserWorkingHours.TimeZone.Name}\"")
                                                                    .PostAsync();

            for (int index = 0; index < request.UsersUpnList.Count; ++index)
            {
                List<TimeLimit> totalTimeSlotsList = new List<TimeLimit>();
                var targetUserSchedule = userCalendar.CurrentPage[index];                
                if (targetUserSchedule != null && targetUserSchedule.AvailabilityView != null && targetUserSchedule.WorkingHours != null)
                {
                    WorkingHours workingHoursInTimezoneOfTarget = PreserveUserWorkingHoursInOriginalTimezoneAndTransformSchedule(currentUserWorkingHours,
                        targetDay,
                        targetScheduleFrom,
                        ref targetUserSchedule);

                    var allTimeSlots = CalculateAllTimeSlotsForSchedule(targetUserSchedule,
                        workingHoursInTimezoneOfTarget,
                        targetScheduleFrom ?? targetDay,
                        targetScheduleTo ?? targetDay.AddDays(1),
                        targetDay);


                    DateTime startDate = new DateTime(dateTimeAtNow.Year,
                        dateTimeAtNow.Month,
                        dateTimeAtNow.Day,
                        dateTimeAtNow.Minute <= 30 ? dateTimeAtNow.Hour : dateTimeAtNow.Hour + 1,
                        dateTimeAtNow.Minute <= 30 ? 30 : 0,
                        0);

                    totalTimeSlotsList = allTimeSlots.Where(t => DateTime.Compare(t.SlotStart, startDate) >= 0 && t.AvailabilityCode == '0')
                        .Select(slot => slot.SlotAsTimeLimit)
                        .ToList();
                }
                var userAvailableTimes = new UserAvailableTimes(targetUserSchedule.ScheduleId, totalTimeSlotsList);
                response.MultiUserAvailabilityTimes.Add(userAvailableTimes);
            }
            return response;
        }

        private WorkingHours PreserveUserWorkingHoursInOriginalTimezoneAndTransformSchedule(WorkingHours currentUserWorkingHours, DateTime targetDay, DateTime? targetScheduleFrom, ref ScheduleInformation targetUserSchedule)
        {
            // Preservation object for working hours before transformed to UTC.
            // Original Working Hours if available > Default Hours in UTC (for cases workingHours is not null but the start/end times are null)
            WorkingHours workingHoursInTimezoneOfTarget = new WorkingHours()
            {
                StartTime = targetUserSchedule.WorkingHours.StartTime ?? new TimeOfDay(8, 0, 0),
                EndTime = targetUserSchedule.WorkingHours.EndTime ?? new TimeOfDay(17, 0, 0),
                DaysOfWeek = targetUserSchedule.WorkingHours.DaysOfWeek ?? new List<Microsoft.Graph.DayOfWeek>()
                    {
                        Microsoft.Graph.DayOfWeek.Monday,
                        Microsoft.Graph.DayOfWeek.Tuesday,
                        Microsoft.Graph.DayOfWeek.Wednesday,
                        Microsoft.Graph.DayOfWeek.Thursday,
                        Microsoft.Graph.DayOfWeek.Friday
                    },
                TimeZone = targetUserSchedule.WorkingHours.TimeZone ?? new TimeZoneBase()
                {
                    Name = Constant.TimeZoneUTC
                },
            };
            Exception e;

            // Transforming Working Hours to UTC
            targetUserSchedule = targetUserSchedule.TransformAsUTC(targetScheduleFrom ?? targetDay, out e);
            if (e != null)
            {
                telemetryService.TrackException(e, $"Error while transforming user schedule to UTC for ScheduleId: {targetUserSchedule.ScheduleId}");
            }

            return workingHoursInTimezoneOfTarget;
        }

        private List<FullDateTimeSlot> CalculateAllTimeSlotsForSchedule(ScheduleInformation targetUserSchedule, WorkingHours targetWorkingHours, DateTime dayStartInUtc, DateTime dayEndInUtc, DateTime saidDate)
        {
            DateTime slotStart;
            int projectedEndHour, projectedEndMinute;

            if(targetUserSchedule.WorkingHours != null)
            {
                slotStart = new DateTime(
                saidDate.Year,
                saidDate.Month,
                saidDate.Day,
                targetUserSchedule.WorkingHours.StartTime.Hour,
                targetUserSchedule.WorkingHours.StartTime.Minute,
                targetUserSchedule.WorkingHours.StartTime.Second);
                projectedEndHour = targetUserSchedule.WorkingHours.EndTime.Hour;
                projectedEndMinute = targetUserSchedule.WorkingHours.EndTime.Minute;
            }
            else
            {
                slotStart = new DateTime(
                saidDate.Year,
                saidDate.Month,
                saidDate.Day,
                8,
                0,
                0);
                projectedEndHour = 17;
                projectedEndMinute = 0;
            }

            // ignore timeslots falling before current user day's time range in UTC
            // for the cases of users ahead of current user on timezone basis
            // as the availability view will not contain the availability code.
            while (DateTime.Compare(slotStart, dayStartInUtc) < 0)
            {
                slotStart = slotStart.AddMinutes(30);
            }

            // since the availability view is still in the target user's timezone
            int slotsToSchedule;
            if(targetWorkingHours != null)
            {
                // target working hours is preserved in the scheduled user's timezone
                var difference = (int) slotStart.Subtract(dayStartInUtc).TotalMinutes;
                slotsToSchedule = difference / 30;
                if (slotsToSchedule % 30 > 0)
                {
                    slotsToSchedule++;
                }
            }
            else
            {
                slotsToSchedule = 16; // 8 AM default * 2
            }

            DateTime slotEnd = slotStart.AddMinutes(30);

            List<FullDateTimeSlot> fullTimeSlotsUtc = new List<FullDateTimeSlot>();
            int i = slotsToSchedule;
            bool isOvernight = false;
            while (!(slotStart.Hour == projectedEndHour && 
                     slotStart.Minute == projectedEndMinute) &&
                     i < 48)
            {
                var slot = new FullDateTimeSlot();
                slot.SlotStart = slotStart;
                slot.SlotEnd = slotEnd;
                slot.SlotAsTimeLimit = new TimeLimit();
                slot.SlotAsTimeLimit.Start = new TimeOfDay(slotStart.Hour, slotStart.Minute, slotStart.Second);
                slot.SlotAsTimeLimit.End = new TimeOfDay(slotEnd.Hour, slotEnd.Minute, slotEnd.Second);
                if (slot.SlotStart.Hour == dayEndInUtc.Hour && slot.SlotStart.Minute == dayEndInUtc.Minute)
                {
                    isOvernight = true;
                }
                if (isOvernight)
                {
                    slot.SlotAsTimeLimit.IsOvernight = true;
                }
                slot.AvailabilityCode = targetUserSchedule.AvailabilityView[i++];
                fullTimeSlotsUtc.Add(slot);
                slotStart = slotEnd;
                slotEnd = slotEnd.AddMinutes(30);
            }

            return fullTimeSlotsUtc;
        }
    }
}
