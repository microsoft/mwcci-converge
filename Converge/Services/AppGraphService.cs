// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Converge.Helpers;
using Converge.Models;
using Converge.Models.Enums;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Graph;
using Microsoft.Identity.Client;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;

namespace Converge.Services
{
    /// <summary>
    /// Note: Do not add functionality to this service without getting approval for the use of application level permissions.
    /// Instead, use the UserGraphService.
    /// </summary>
    public class AppGraphService
    {
        private readonly ILogger logger;
        private readonly IConfiguration configuration;
        private readonly IConfidentialClientApplication app;
        static readonly List<string> scopesToAccessApplicationGraphApi = new List<string> { "https://graph.microsoft.com/.default" };

        public string ConvergeExtensionId => Constant.ConvergeExtensionId + configuration["AppEnvironment"]?? string.Empty;

        public string ConvergeDisplayName => Constant.Converge + configuration["AppEnvironment"] ?? string.Empty;

        /// <summary>
        /// The empty constructor exists for testing purposes.
        /// </summary>
        public AppGraphService() { }

        public AppGraphService(ILogger<PlacesService> logger, IConfiguration configuration)
        {
            this.logger = logger ?? throw new ArgumentNullException(nameof(logger));
            this.configuration = configuration;

            app = ConfidentialClientApplicationBuilder.Create(configuration["AzureAd:ClientId"])
                .WithClientSecret(configuration["AzureAd:ClientSecret"])
                .WithAuthority(new Uri(configuration["AzureAd:Instance"] + configuration["AzureAd:TenantId"]))
                .Build();
        }

        private GraphServiceClient appGraphServiceClient
        {
            get
            {
                var authResult = app.AcquireTokenForClient(scopesToAccessApplicationGraphApi).ExecuteAsync().GetAwaiter().GetResult();
                return new GraphServiceClient(new DelegateAuthenticationProvider((requestMessage) =>
                {
                    requestMessage
                        .Headers
                        .Authorization = new AuthenticationHeaderValue("bearer", authResult.AccessToken);

                    return Task.FromResult(0);
                }));
            }
        }

        public string ConvergeCalendarEpId
        {
            get { return $"Boolean {{{configuration["AzureAd:TenantId"]}}} Name IsConvergeCalendar{configuration["AppEnvironment"] ?? string.Empty}"; }
        }

        public string ConvergeCalendarEventId
        {
            get { return $"Boolean {{{configuration["AzureAd:TenantId"]}}} Name IsConvergePrediction"; }
        }

        public string ConvergePredictionSetByUser
        {
            get { return $"Boolean {{{configuration["AzureAd:TenantId"]}}} Name IsConvergePredictionSetByUser"; }
        }

        public async IAsyncEnumerable<ConvergeSettings> GetUserExtensionsAsync(List<string> usersUpnList)
        {
            foreach (var userId in usersUpnList)
            {
                ConvergeSettings convergeSettings = null;

                try
                {
                    var extension = await appGraphServiceClient.Users[userId].Extensions[ConvergeExtensionId].Request().GetAsync();
                    var json = JsonConvert.SerializeObject(extension.AdditionalData);

                    convergeSettings = JsonConvert.DeserializeObject<ConvergeSettings>(json);
                }
                catch
                {
                    //do nothing, as we want the loop to continue.
                }

                yield return convergeSettings;
            }
        }

        public async Task DeleteExtensions(string userId)
        {
            await appGraphServiceClient.Users[userId].Extensions[ConvergeExtensionId].Request().DeleteAsync();
        }

        public virtual async Task<List<Event>> GetAllEvents(string upn, string startDateTime, string endDateTime, string filter = "")
        {
            var queryOptions = new List<QueryOption> {
                new QueryOption("startDateTime", startDateTime),
                new QueryOption("endDateTime", endDateTime)
            };

            var events = await appGraphServiceClient.Users[upn]
                .CalendarView
                .Request(queryOptions)
                .Filter(filter)
                .GetAsync();

            List<Event> calendarViewEvents = new List<Event>();
            var pageIterator = PageIterator<Event>
                .CreatePageIterator(
                    appGraphServiceClient,
                    events,
                    (e) =>
                    {
                        calendarViewEvents.Add(e);
                        return true;
                    }
                );

            await pageIterator.IterateAsync();
            return calendarViewEvents;
        }

        /// <summary>
        /// Creates a new list item in SharePoint.
        /// </summary>
        /// <param name="siteId">The ID of the site that owns this item.</param>
        /// <param name="listId">The ID or name of the list that owns this item.</param>
        /// <param name="listItem">The list item to create.</param>
        /// <returns></returns>
        public async Task<ListItem> CreateListItem(string siteId, string listId, ListItem listItem)
        {
            return await appGraphServiceClient.Sites[siteId].Lists[listId].Items.Request().AddAsync(listItem);
        }

        /// <summary>
        /// Updates the fields of an existing list item in SharePoint.
        /// </summary>
        /// <param name="siteId">The ID of the site that owns this item.</param>
        /// <param name="listId">The ID or name of the list that owns this item.</param>
        /// <param name="listItemId">The ID of the item to update.</param>
        /// <param name="fields">The fields that need to be updated.</param>
        /// <returns></returns>
        public async Task UpdateListItemFields(string siteId, string listId, string listItemId, FieldValueSet fields)
        {
            await appGraphServiceClient.Sites[siteId].Lists[listId].Items[listItemId].Fields.Request().UpdateAsync(fields);
        }

        /// <summary>
        /// Returns all the conference rooms in a given room list.
        /// </summary>
        /// <param name="roomListEmailAddress">The email address of the room list (building) that owns these conference rooms.</param>
        /// <returns>A list of conference rooms.</returns>
        public virtual async Task<List<GraphPlace>> GetAllConferenceRooms(string roomListEmailAddress)
        {
            List<GraphPlace> result = new List<GraphPlace>();
            var roomsUrl = appGraphServiceClient.Places.AppendSegmentToRequestUrl($"{roomListEmailAddress}/microsoft.graph.roomlist/rooms");
            var rooms = await new GraphServicePlacesCollectionRequestBuilder(roomsUrl, appGraphServiceClient)
                .Request()
                .GetAsync();

            var pageIterator = PageIterator<Place>
                .CreatePageIterator(
                    appGraphServiceClient,
                    rooms,
                    (ws) =>
                    {
                        result.Add(new GraphPlace(ws, PlaceType.Room, roomListEmailAddress));
                        return true;
                    }
                );

            await pageIterator.IterateAsync();
            return result;
        }

        /// <summary>
        /// Returns all the workspaces in a given room list.
        /// </summary>
        /// <param name="roomListEmailAddress">The email address of the room list (building) that owns these workspaces.</param>
        /// <returns>A list of workspaces.</returns>
        public virtual async Task<List<GraphPlace>> GetAllWorkspaces(string roomListEmailAddress)
        {
            List<GraphPlace> result = new List<GraphPlace>();
            var workspaces = await new GraphServicePlacesCollectionRequestBuilder($"https://graph.microsoft.com/beta/places/{roomListEmailAddress}/microsoft.graph.roomlist/spaces", appGraphServiceClient)
                .Request()
                .GetAsync();

            var pageIterator = PageIterator<Place>
                .CreatePageIterator(
                    appGraphServiceClient,
                    workspaces,
                    (ws) =>
                    {
                        result.Add(new GraphPlace(ws, PlaceType.Space, roomListEmailAddress));
                        return true;
                    }
                );

            await pageIterator.IterateAsync();
            return result;
        }

        public async Task<ScheduleInformation> GetSchedule(string upn, string start, string end)
        {
            var request = await appGraphServiceClient.Users[upn].Calendar.GetSchedule(
                new List<string> { upn },
                new DateTimeTimeZone
                {
                    DateTime = end,
                    TimeZone = "UTC"
                },
                new DateTimeTimeZone
                {
                    DateTime = start,
                    TimeZone = "UTC"
                }
            )
                .Request()
                .PostAsync();
            List<ScheduleInformation> schedules = request.CurrentPage as List<ScheduleInformation>;
            return schedules[0];
        }

        public async Task<List<ListItem>> GetPhotoItems(string siteId, string listId, string roomLookupId)
        {
            var request = await appGraphServiceClient.Sites[siteId].Lists[listId].Items
                .Request()  
                .Expand("fields")
                .Filter($"fields/RoomLookupId eq '{roomLookupId}'")
                .GetAsync();
            List<ListItem> listItems = request.CurrentPage as List<ListItem>;
            return listItems;
        }

        public async Task<string> GetPhotoUrl(string siteId, string listId, string itemId)
        {
            var request = await appGraphServiceClient.Sites[siteId].Lists[listId].Items[itemId].DriveItem.Thumbnails.Request().GetAsync();
            List<ThumbnailSet> thumbnails = request.CurrentPage as List<ThumbnailSet>;
            string url = string.Empty;
            foreach (ThumbnailSet thumbnail in thumbnails)
            {
                url = thumbnail.Large.Url;
            }
            return url;
        }

        public async Task<List<User>> GetConvergeUsers()
        {
            IGraphServiceUsersCollectionPage graphUsers = await appGraphServiceClient.Users
                .Request()
                .Expand("extensions")
                .Select("extensions")
                .Top(999)
                .GetAsync();

            List<User> convergeUsers = new List<User>();
            var pageIterator = PageIterator<User>
                .CreatePageIterator(
                    appGraphServiceClient,
                    graphUsers,
                    (u) =>
                    {
                        if (u.Extensions != null)
                        {
                            ConvergeSettings convergeSettings = null;
                            var targetExtension = u.Extensions.FirstOrDefault(y => y.Id.SameAs(ConvergeExtensionId));
                            if (targetExtension != null)
                            {
                                var json = JsonConvert.SerializeObject(targetExtension.AdditionalData);
                                convergeSettings = JsonConvert.DeserializeObject<ConvergeSettings>(json);
                            }

                            if (convergeSettings != null && convergeSettings.IsConvergeUser == true)
                            {
                                convergeUsers.Add(u);
                            }
                        }
                        return true;
                    });

            await pageIterator.IterateAsync();
            return convergeUsers;
        }

        public async Task<bool> IsConvergeInstalled(string upn)
        {
            var request = await appGraphServiceClient.Users[upn].Teamwork.InstalledApps.Request().Expand("teamsAppDefinition").GetAsync();
            var installedApps = request.CurrentPage as List<UserScopeTeamsAppInstallation>;
            foreach (UserScopeTeamsAppInstallation app in installedApps)
            {
                if (app.TeamsAppDefinition.DisplayName.SameAs(ConvergeDisplayName))
                {
                    return true;
                }
            }
            return false;
        }

        public async Task UpdateEvent(string upn, Event prediction)
        {
            await appGraphServiceClient.Users[upn].Events[prediction.Id].Request().UpdateAsync(prediction);
        }

        public async Task DeleteEvent(string upn, string id)
        {
            await appGraphServiceClient.Users[upn].Events[id].Request().DeleteAsync();
        }

        public virtual async Task<Calendar> GetConvergeCalendar(string upn)
        {
            var calendarRequest = await appGraphServiceClient.Users[upn].Calendars.Request().Expand($"singleValueExtendedProperties($filter=id eq '{ConvergeCalendarEpId}')").GetAsync();
            List<Calendar> calendars = calendarRequest.CurrentPage as List<Calendar>;
            return calendars.Find(c => c.SingleValueExtendedProperties == null ? false : c.SingleValueExtendedProperties.Any(ep => ep.Id == ConvergeCalendarEpId));
        }

        public async Task DeleteConvergeCalendar(string upn)
        {
            var calendar = await GetConvergeCalendar(upn);
            if (calendar != null)
            {
                await appGraphServiceClient.Users[upn].Calendars[calendar.Id].Request().DeleteAsync();
            }
        }

        public async Task CreateConvergePrediction(string id, string calendarId, Event newEvent, bool isPredictionUserSet = false)
        {
            newEvent.SingleValueExtendedProperties = new EventSingleValueExtendedPropertiesCollectionPage
            {
                new SingleValueLegacyExtendedProperty
                {
                    Id = ConvergeCalendarEventId,
                    Value = "true",
                },
                new SingleValueLegacyExtendedProperty
                {
                    Id = ConvergePredictionSetByUser,
                    Value = isPredictionUserSet ? "true" : "false",
                }
            };
            await appGraphServiceClient.Users[id].Calendars[calendarId].Events.Request().AddAsync(newEvent);
        }

        public async Task<Event> GetConvergePrediction(string id, string calendarId, int year, int month, int day)
        {
            DateTime startDateTime = new DateTime(year, month, day);
            string start = startDateTime.ToString("O");
            string end = startDateTime.AddDays(1).ToString("O");

            var eventRequest = await appGraphServiceClient.Users[id].Calendars[calendarId].Events.Request()
                                        .Filter($"end/dateTime le '{end}' and start/dateTime ge '{start}'")
                                        .Expand($"singleValueExtendedProperties($filter=id eq '{ConvergeCalendarEventId}' or id eq '{ConvergePredictionSetByUser}')")
                                        .GetAsync();

            List<Event> events = eventRequest.CurrentPage as List<Event>;
            return events?.Find(e => e.SingleValueExtendedProperties?.Any(svep => svep.Id == ConvergeCalendarEventId) ?? false);
        }

        public async Task<string> GetUserLocation(string id, string calendarId, int year, int month, int day)
        {
            var convergePredictionEvent = await GetConvergePrediction(id, calendarId, year, month, day);
            if (convergePredictionEvent == null)
            {
                DateTime startDateTime = new DateTime(year, month, day);
                string start = startDateTime.ToString("O");
                string end = startDateTime.AddDays(1).ToString("O");

                var queryOptions = new List<QueryOption>()
                {
                    new QueryOption("startDateTime", start),
                    new QueryOption("endDateTime", end)
                };

                var calendar = await appGraphServiceClient.Users[id].CalendarView.Request(queryOptions).GetAsync();
                var eventsOutOfOffice = calendar.CurrentPage.Where(x => x.ShowAs == FreeBusyStatus.Oof);
                if (eventsOutOfOffice != null && eventsOutOfOffice.Count() > 0)
                {
                    return "Out of Office";
                }
            }

            return convergePredictionEvent?.Location?.DisplayName ?? "Remote";
        }

        public async Task<WorkingHours> GetWorkingHours(string upn)
        {
            string mailboxSettingsUrl = appGraphServiceClient.Users[upn].AppendSegmentToRequestUrl("mailboxSettings/workingHours");
            var workingHoursRequest = await new UserSettingsRequestBuilder(mailboxSettingsUrl, appGraphServiceClient).Request().GetAsync();
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

        public async Task<List> GetList(string siteId, string listId)
        {
            try
            {
                return await appGraphServiceClient.Sites[siteId].Lists[listId].Request().Expand("columns").GetAsync();
            }
            catch (ServiceException)
            {
                return null;
            }
        }

        public async Task<List<ListItem>> GetListItems(string siteId, string listId)
        {
            try
            {
                var listItemRequest = await appGraphServiceClient.Sites[siteId].Lists[listId].Items.Request().Expand("fields").GetAsync();
                var listItems = listItemRequest.CurrentPage as List<ListItem>;
                return listItems;
            }
            catch (ServiceException)
            {
                return null;
            }
        }

        public virtual async Task<List<Place>> GetRoomLists()
        {
            var placesUrl = appGraphServiceClient.Places.AppendSegmentToRequestUrl("microsoft.graph.roomList");
            var places = await new GraphServicePlacesCollectionRequestBuilder(placesUrl, appGraphServiceClient)
                .Request()
                .GetAsync();

            List<Place> placeList = places.CurrentPage as List<Place>;
            return placeList;
        }

        public async Task<GraphRoomsListResponse> GetRoomListsConstrained(CampusSortRequest buildingSortRequest)
        {
            var queryOptions = new List<QueryOption>
            {
                new QueryOption("$count", "true")
            };

            var placesUrl = appGraphServiceClient.Places.AppendSegmentToRequestUrl("microsoft.graph.roomList");
            var placesCollRequest = new GraphServicePlacesCollectionRequestBuilder(placesUrl, appGraphServiceClient)
                                                                        .Request(queryOptions)
                                                                        .Header("ConsistencyLevel", "Eventual")
                                                                        .Filter($"emailAddress ne ''");
            if (buildingSortRequest.SortByType == CampusSortByType.DisplayName)
            {
                placesCollRequest = placesCollRequest.OrderBy("displayName")
                                                        .Top(buildingSortRequest.TopCount.Value);
            }
            var placesCollPage = await placesCollRequest.GetAsync();

            List<Place> placeList = placesCollPage.CurrentPage as List<Place>;
            QueryOption skipToken = placesCollPage.NextPageRequest?
                                    .QueryOptions.FirstOrDefault(x => x.Name.SameAs("$skiptoken"));

            return new GraphRoomsListResponse(placeList, skipToken);
        }

        public async Task<List<Place>> GetRoomListsByDisplayName(List<string> roomListsDisplayNames)
        {
            StringBuilder predicateBuilder = new StringBuilder();
            for (int index = 0; index < roomListsDisplayNames.Count; ++index)
            {
                predicateBuilder.Append($"displayName eq '{roomListsDisplayNames[index]}'");
                if (index + 1 < roomListsDisplayNames.Count)
                {
                    predicateBuilder.Append(" or ");
                }
            }

            var placesUrl = appGraphServiceClient.Places.AppendSegmentToRequestUrl("microsoft.graph.roomList");
            var placesCollPage = await new GraphServicePlacesCollectionRequestBuilder(placesUrl, appGraphServiceClient)
                                                                        .Request()
                                                                        .Filter(predicateBuilder.ToString())
                                                                        .OrderBy("displayName")
                                                                        .GetAsync();

            List<Place> placesList = placesCollPage.CurrentPage as List<Place>;
            return placesList;
        }

        public async Task<Place> GetRoomListById(string roomListIdentity)
        {
            List<Place> places = await GetRoomListsCollectionByIds(new List<string> { roomListIdentity });
            return (places == null || places.Count == 0) ? null : places[0];
        }

        public async Task<List<Place>> GetRoomListsCollectionByIds(List<string> roomListsIdentities)
        {
            var placesUrl = appGraphServiceClient.Places.AppendSegmentToRequestUrl("microsoft.graph.roomList");

            StringBuilder predicateBuilder = new StringBuilder();
            for (int index = 0; index < roomListsIdentities.Count; ++index)
            {
                predicateBuilder.Append($"emailAddress eq '{roomListsIdentities[index]}'");
                if (index + 1 < roomListsIdentities.Count)
                {
                    predicateBuilder.Append(" or ");
                }
            }

            var places = await new GraphServicePlacesCollectionRequestBuilder(placesUrl, appGraphServiceClient)
                                                                    .Request()
                                                                    .Filter(predicateBuilder.ToString())
                                                                    .GetAsync();

            return (places == null || places.Count == 0) ? null : places.CurrentPage as List<Place>;
        }

        public async Task<GraphListItemsResponse> GetListItemsBySortRequest(CampusSortRequest buildingSortRequest, PlaceType? placeType)
        {
            string siteId = configuration["SharePointSiteId"];
            string listId = configuration["SharePointListId"];
            List placesList = await GetList(siteId, listId);
            if (placesList == null)
            {
                this.logger.LogError($"Places list is empty for SharePoint-Site-id and SharePoint-List-id.");
                return null;
            }

            GPSCoordinates[] gpsCoordinatesRange = null;
            if (buildingSortRequest.SortByType == CampusSortByType.Distance 
                && buildingSortRequest.DistanceFromSource > 0.0 && buildingSortRequest.SourceGpsCoordinates != null)
            {
                gpsCoordinatesRange = buildingSortRequest.GetCoordinatesRange();
            }

            StringBuilder predicateBuilder = new StringBuilder($"(fields/EmailAddress ne '')");
            predicateBuilder.Append($" and (fields/IsAvailable eq 1)");
            predicateBuilder.Append($" and (fields/BookingType ne '{BookingType.Reserved}')");
            if (placeType.HasValue)
            {
                predicateBuilder.Append($" and (fields/PlaceType eq '{Enum.GetName(typeof(PlaceType), placeType.Value)}')");
            }

            if (gpsCoordinatesRange != null && gpsCoordinatesRange.Length == 2)
            {
                predicateBuilder.Append($" and (fields/Latitude ge {gpsCoordinatesRange[0].Latitude} and fields/Longitude ge {gpsCoordinatesRange[0].Longitude}");
                predicateBuilder.Append($" and fields/Latitude le {gpsCoordinatesRange[1].Latitude} and fields/Longitude le {gpsCoordinatesRange[1].Longitude})");
            }

            IListItemsCollectionRequest listItemsCollRequest = BuildListItemsCollectionRequest(siteId, placesList.Id, predicateBuilder.ToString(), skipToken: buildingSortRequest.SkipToken);
            if (buildingSortRequest.SortByType == CampusSortByType.DisplayName)
            {
                listItemsCollRequest = listItemsCollRequest.OrderBy("fields/Locality");
            }

            try
            {
                var listItemsRequest = await listItemsCollRequest.GetAsync();

                var listItems = listItemsRequest.CurrentPage as List<ListItem>;
                var skipToken = listItemsRequest.NextPageRequest?.QueryOptions.FirstOrDefault(x => x.Name.SameAs("$skiptoken"));

                return new GraphListItemsResponse(listItems, skipToken);
            }
            catch
            {
                return null;
            }
        }

        public async Task<GraphListItemsResponse> GetListItemsByRoomListIds(
            List<string> roomListsIdentifiers, 
            PlaceType? placeType = null, 
            int? topCount = null,
            QueryOption skipToken = null,
            ListItemFilterOptions listItemFilterOptions = null
        )
        {
            string siteId = configuration["SharePointSiteId"];
            string listId = configuration["SharePointListId"];
            List placesList = await GetList(siteId, listId);
            if (placesList == null)
            {
                this.logger.LogError($"Places list is empty for SharePoint-Site-id and SharePoint-List-id.");
                return null;
            }

            StringBuilder predicateBuilder = new StringBuilder($"(fields/EmailAddress ne '')");
            predicateBuilder.Append($" and (fields/IsAvailable eq 1)");
            if (roomListsIdentifiers != null && roomListsIdentifiers.Count > 0)
            {
                predicateBuilder.Append(" and (");
                for (int index = 0; index < roomListsIdentifiers.Count; ++index)
                {
                    predicateBuilder.Append($"fields/Locality eq '{roomListsIdentifiers[index]}'");
                    if (index + 1 < roomListsIdentifiers.Count)
                    {
                        predicateBuilder.Append(" or ");
                    }
                }
                predicateBuilder.Append(")");
            }
            predicateBuilder.Append($" and (fields/BookingType ne '{BookingType.Reserved}')");
            if (placeType.HasValue)
            {
                predicateBuilder.Append($" and (fields/PlaceType eq '{Enum.GetName(typeof(PlaceType), placeType.Value)}')");
            }

            if (listItemFilterOptions != null)
            {
                if (listItemFilterOptions.IsWheelChairAccessible)
                {
                    predicateBuilder.Append(" and (fields/IsWheelChairAccessible eq 1)");
                }

                if (listItemFilterOptions.HasVideo)
                {
                    predicateBuilder.Append(" and (fields/VideoDeviceName ne null)");
                }

                if (listItemFilterOptions.HasAudio)
                {
                    predicateBuilder.Append(" and (fields/AudioDeviceName ne null)");
                }

                if (listItemFilterOptions.HasDisplay)
                {
                    predicateBuilder.Append(" and (fields/DisplayDeviceName ne null)");
                }

                if (!string.IsNullOrEmpty(listItemFilterOptions?.DisplayNameSearchString))
                {
                    predicateBuilder.Append($" and startsWith(fields/Name,'{listItemFilterOptions.DisplayNameSearchString}')");
                }
            }

            IListItemsCollectionRequest listItemsCollRequest = BuildListItemsCollectionRequest(siteId, placesList.Id, predicateBuilder.ToString(), topCount, skipToken);
            listItemsCollRequest.OrderBy("fields/Capacity desc");
            try
            {
                var listItemsRequest = await listItemsCollRequest.GetAsync();

                var listItems = listItemsRequest.CurrentPage as List<ListItem>;
                skipToken = listItemsRequest.NextPageRequest?.QueryOptions.FirstOrDefault(x => x.Name.SameAs("$skiptoken"));

                return new GraphListItemsResponse(listItems, skipToken);
            }
            catch (Exception e)
            {
                this.logger.LogError("Error retrieving list items: ", e);
                return null;
            }
        }

        private IListItemsCollectionRequest BuildListItemsCollectionRequest(string siteId, string placesListId, string predicate, int? topCount = null, QueryOption skipToken = null)
        {
            IListItemsCollectionRequest listItemsCollRequest;
            var listItemsCollRequestBuilder = appGraphServiceClient.Sites[siteId].Lists[placesListId].Items;
            if (skipToken == null)
            {
                listItemsCollRequest = listItemsCollRequestBuilder.Request();
            }
            else
            {
                listItemsCollRequest = listItemsCollRequestBuilder.Request(new List<QueryOption> { skipToken });
            }
            listItemsCollRequest = listItemsCollRequest.Expand("fields").Filter(predicate);
            if (topCount.HasValue)
            {
                listItemsCollRequest = listItemsCollRequest.Top(topCount.Value);
            }

            return listItemsCollRequest;
        }

        public async Task<GraphListItemsResponse> GetListItemsByPlaceUpns(List<string> placesUpnsList, PlaceType? placeType, int? topCount = null, QueryOption skipToken = null)
        {
            string siteId = configuration["SharePointSiteId"];
            string listId = configuration["SharePointListId"];
            List placesList = await GetList(siteId, listId);
            if (placesList == null)
            {
                this.logger.LogError($"Places list is empty for SharePoint-Site-id and SharePoint-List-id.");
                return null;
            }

            StringBuilder predicateBuilder = new StringBuilder($"(fields/IsAvailable eq 1)");
            if (placesUpnsList != null && placesUpnsList.Count > 0)
            {
                predicateBuilder.Append(" and (");
                for (int index = 0; index < placesUpnsList.Count; ++index)
                {
                    predicateBuilder.Append($"fields/EmailAddress eq '{placesUpnsList[index]}'");
                    if (index + 1 < placesUpnsList.Count)
                    {
                        predicateBuilder.Append(" or ");
                    }
                }
                predicateBuilder.Append(")");
            }
            if (placeType.HasValue)
            {
                predicateBuilder.Append($" and (fields/PlaceType eq '{Enum.GetName(typeof(PlaceType), placeType.Value)}')");
            }

            IListItemsCollectionRequest listItemsCollRequest = BuildListItemsCollectionRequest(siteId, placesList.Id, predicateBuilder.ToString(), topCount, skipToken);
            try
            {
                var listItemsRequest = await listItemsCollRequest.GetAsync();

                var listItems = listItemsRequest.CurrentPage as List<ListItem>;
                skipToken = listItemsRequest.NextPageRequest?.QueryOptions.FirstOrDefault(x => x.Name.SameAs("$skiptoken"));

                return new GraphListItemsResponse(listItems, skipToken);
            }
            catch (Exception e)
            {
                this.logger.LogError("Error retrieving list items: ", e);
                return null;
            }
        }

        public async Task<GraphListItemsResponse> GetListItemsByPlaceType(PlaceType? placeType, int? topCount = null, QueryOption skipToken = null)
        {
            string siteId = configuration["SharePointSiteId"];
            string listId = configuration["SharePointListId"];
            List placesList = await GetList(siteId, listId);
            if (placesList == null)
            {
                this.logger.LogError($"Places list is empty for SharePoint-Site-id and SharePoint-List-id.");
                return null;
            }

            StringBuilder predicateBuilder = new StringBuilder($"(fields/IsAvailable eq 1)");
            predicateBuilder.Append($" and (fields/BookingType ne '{BookingType.Reserved}')");
            if (placeType.HasValue)
            {
                predicateBuilder.Append($" and (fields/PlaceType eq '{Enum.GetName(typeof(PlaceType), placeType.Value)}')");
            }

            IListItemsCollectionRequest listItemsCollRequest = BuildListItemsCollectionRequest(siteId, placesList.Id, predicateBuilder.ToString(), topCount, skipToken);
            try
            {
                var listItemsRequest = await listItemsCollRequest.GetAsync();

                var listItems = listItemsRequest.CurrentPage as List<ListItem>;
                skipToken = listItemsRequest.NextPageRequest?.QueryOptions.FirstOrDefault(x => x.Name.SameAs("$skiptoken"));

                return new GraphListItemsResponse(listItems, skipToken);
            }
            catch
            {
                return null;
            }
        }

        public async Task<GraphRoomsListResponse> SearchRoomLists(string searchString, int? topCount = null, QueryOption skipToken = null)
        {
            topCount ??= 10;
            var placesUrl = appGraphServiceClient.Places.AppendSegmentToRequestUrl("microsoft.graph.roomList");

            //Extending on the search by transforming the search-string to all-lower-case, ALL-UPPER-CASE and also to Proper/Pascal-case.
            //Eg. "San FRANcisco" transformed to "san francisco", "SAN FRANCISCO" and "San Francisco", besides search for the actual string.
            string allLowerCase = searchString.ToLower();
            string allUpperCase = searchString.ToUpper();
            string properCase = searchString;
            string[] multiWords = searchString.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            foreach(var word in multiWords)
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
            var placesCollRequestBuilder = new GraphServicePlacesCollectionRequestBuilder(placesUrl, appGraphServiceClient);
            IGraphServicePlacesCollectionRequest placesCollRequest;
            if (skipToken == null)
            {
                placesCollRequest = placesCollRequestBuilder.Request();
            }
            else
            {
                placesCollRequest = placesCollRequestBuilder.Request(new List<QueryOption> { skipToken });
            }
            placesCollRequest = placesCollRequest.Header("ConsistencyLevel", "Eventual")
                                                    .Filter(predicateBuilder.ToString())
                                                    .OrderBy("displayName")
                                                    .Top(topCount.Value);
            var placesCollPage = await placesCollRequest.GetAsync();

            List<Place> placeList = placesCollPage.CurrentPage as List<Place>;
            placeList = placeList.Where(r => r.AdditionalData != null && r.AdditionalData["emailAddress"] != null).ToList();
            skipToken = placesCollPage.NextPageRequest?.QueryOptions.FirstOrDefault(x => x.Name.SameAs("$skiptoken"));

            return new GraphRoomsListResponse(placeList, skipToken);
        }
    }
}
