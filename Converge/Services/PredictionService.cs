// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Converge.Helpers;
using Converge.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Graph;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Converge.Services
{
    public class PredictionService
    {
        private readonly IConfiguration configuration;
        private readonly AppGraphService appGraphService;
        private readonly BuildingsMonoService buildingsMonoService;
        private readonly TelemetryService telemetryService;

        public PredictionService(IConfiguration configuration,
                                    TelemetryService telemetryService,
                                    AppGraphService appGraphService, 
                                    BuildingsMonoService buildingsMonoSvc)
        {
            this.configuration = configuration;
            this.telemetryService = telemetryService;
            this.appGraphService = appGraphService;
            this.buildingsMonoService = buildingsMonoSvc;
        }

        public int MaxPredictionWindow => int.Parse(configuration["MaxPredictionWindow"]);

        public async Task PerformPrediction(string userId, WorkingHours workingHours, Dictionary<string, ExchangePlace> placesDictionary, PredictionMetrics predictionMetrics)
        {
            // This needs to be "now" in the user's timezone
            DateTime today = TimeZoneInfo.ConvertTimeBySystemTimeZoneId(DateTime.UtcNow, workingHours.TimeZone.Name);
            today = today.Initialize(new TimeOfDay(0, 0, 0));

            List<Event> eventsList = await GetAllEventsList(userId, today, today.AddDays(MaxPredictionWindow));
            if (eventsList == null || eventsList.Count == 0 || eventsList.All(e => e.Locations == null && e.Location == null))
            {
                return;
            }
            
            await CollectPlacesFromEvents(eventsList, placesDictionary);

            List<DateTimeLimit> predictionWindowList = new List<DateTimeLimit>();
            for (int i = 0; i < MaxPredictionWindow; i++)
            {
                DateTime startDateTime = DateTime.Today.ToUniversalTime().AddDays(i);
                DateTime endDateTime = DateTime.Today.ToUniversalTime().AddDays(i + 1);

                if (workingHours.DaysOfWeek != null && workingHours.DaysOfWeek.Count() > 0)
                {
                    var weekDay = Enum.Parse<Microsoft.Graph.DayOfWeek>(startDateTime.DayOfWeek.ToString(), true);
                    if (!workingHours.DaysOfWeek.Contains(weekDay))
                    {
                        continue;
                    }
                }
                DateTimeLimit predictionWindow = new DateTimeLimit(startDateTime, endDateTime, workingHours.TimeZone.Name);
                predictionWindowList.Add(predictionWindow);
            }

            object locker = new object();
            Parallel.For(0, predictionWindowList.Count, async i =>
            {
                try
                {
                    var start = predictionWindowList[i].Start;
                    var end = predictionWindowList[i].End;
                    Location predictedLocation = GetPredictedLocation(start, end, eventsList, placesDictionary, out DateTimeOffset? lastWorkspaceBookingModified);
                    await CreateOrUpdatePrediction(userId, predictedLocation, TimeZoneInfo.ConvertTimeBySystemTimeZoneId(start, workingHours.TimeZone.Name), false, lastWorkspaceBookingModified);
                }
                catch (Exception e)
                {
                    lock (locker)
                    {
                        string previousMessage = predictionMetrics.ExceptionUser.ContainsKey(userId) ? predictionMetrics.ExceptionUser[userId] : string.Empty;
                        predictionMetrics.ExceptionUser[userId] = new StringBuilder(previousMessage + e.Message + ". ").ToString();
                        predictionMetrics.ExceptionsList.Add(e);
                    }
                }
            });

            return;
        }

        public async Task<List<Event>> GetAllEventsList(string id, DateTime start, DateTime end)
        {
            return await appGraphService.GetAllEvents(
                                                id,
                                                new DateTime(start.Year, start.Month, start.Day).ToString("o"),
                                                new DateTime(end.Year, end.Month, end.Day).ToString("o"),
                                                "isCancelled eq false");
        }

        public async Task CollectPlacesFromEvents(List<Event> eventsList, Dictionary<string, ExchangePlace> placesDictionary)
        {
            List<string> placeUpnsList = new List<string>();
            eventsList.Where(e => e.Location != null).Select(x => x.Location)
                        .Where(y => !string.IsNullOrWhiteSpace(y.UniqueId) && !string.IsNullOrWhiteSpace(y.LocationUri))
                        .ToList()
                        .ForEach(x =>
                        {
                            if (!x.LocationUri.OneAmong(placeUpnsList))
                            {
                                placeUpnsList.Add(x.LocationUri);
                            }
                        });
            if (placeUpnsList.Count == 0)
            {
                return;
            }

            //Remove if pre-exists in the dictionary.
            placeUpnsList.RemoveAll(x => placesDictionary.ContainsKey(x));
            if (placeUpnsList.Count != 0)
            {
                //Get Places by Places-Upns-list
                GraphExchangePlacesResponse exchangePlacesResponse = await buildingsMonoService.GetPlacesByUpnsList(placeUpnsList);
                if (exchangePlacesResponse != null)
                {
                    foreach (var place in exchangePlacesResponse?.ExchangePlacesList)
                    {
                        placesDictionary[place.Identity] = place;
                    }
                }
            }
        }

        public Location GetPredictedLocation(DateTime start, DateTime end, List<Event> eventsList, Dictionary<string, ExchangePlace> placesDictionary, out DateTimeOffset? lastWorkspaceBookingModified)
        {
            Location topLocation = null;
            lastWorkspaceBookingModified = null;

            List<Event> filteredEventsList = eventsList.Where(e => IsEventOnDay(start, end, e)).ToList();

            //When Events are not right, we return back null.
            if (filteredEventsList == null || filteredEventsList.Count == 0)
            {
                return topLocation;
            }

            // Make a prediction about where they are
            IDictionary<string, int> locationCount = new Dictionary<string, int>();
            IDictionary<string, Location> locations = new Dictionary<string, Location>();

            foreach (Event e in filteredEventsList)
            {
                var eventLocations = e.Locations.Where(x => placesDictionary.ContainsKey(x.LocationUri));
                foreach (Location location in eventLocations)
                {
                    ExchangePlace place = placesDictionary[location.LocationUri];
                    if (place == null)
                    {
                        continue;
                    }
                    Location normalizedLocation = NormalizeLocation(place);
                    if (place.Type == PlaceType.Space)
                    {
                        topLocation = normalizedLocation;
                        lastWorkspaceBookingModified = e.LastModifiedDateTime;
                        break;
                    }
                    if (locationCount.ContainsKey(normalizedLocation.DisplayName))
                    {
                        locationCount[normalizedLocation.DisplayName] += 1;
                    }
                    else
                    {
                        locationCount[normalizedLocation.DisplayName] = 1;
                    }
                    locations[normalizedLocation.DisplayName] = normalizedLocation;
                }
            }

            if (topLocation != null)
            {
                return topLocation;
            }

            int count = 0;
            foreach (KeyValuePair<string, int> location in locationCount)
            {
                if (location.Value > count)
                {
                    topLocation = locations[location.Key];
                    count = location.Value;
                }
            }
            if (count < 2)
            {
                return null;
            }
            return topLocation;
        }

        /// <summary>
        /// Creates a new Converge prediction if none exists, or updates the existing prediction with a new location.
        /// </summary>
        /// <param name="id">The ID of the Converge calendar.</param>
        /// <param name="location">The location of the Converge prediction.</param>
        /// <param name="start">The date of the prediction.</param>
        /// <param name="isPredictionUserSet">Whether the update is coming directly from the user and not the background job.</param>
        /// <param name="lastWorkspaceBookingModified">The date of the last updated workspace booking on this day, if any.</param>
        /// <returns>A task.</returns>
        public async Task CreateOrUpdatePrediction(string id, Location location, DateTime start, bool isPredictionUserSet = false, DateTimeOffset? lastWorkspaceBookingModified = null)
        {
            Calendar convergeCalendar = await appGraphService.GetConvergeCalendar(id);
            if (convergeCalendar == null)
            {
                telemetryService.TrackEvent(TelemetryService.CONVERGE_CALEDNAR_REMOVED);
                return;
            }
            DateTime startDateTime = new DateTime(start.Year, start.Month, start.Day);
            DateTime endDateTime = startDateTime.AddHours(24);
            Event prediction = await appGraphService.GetConvergePrediction(id, convergeCalendar.Id, start.Year, start.Month, start.Day);
            if (prediction != null)
            {
                bool isSavedPredictionUserSet = prediction.SingleValueExtendedProperties?
                                                .Any(svep => svep.Id == appGraphService.ConvergePredictionSetByUser && svep.Value == "true" ) ?? false;
                bool isWorkspaceBookingMostRecent = false;
                if (lastWorkspaceBookingModified != null)
                {
                    isWorkspaceBookingMostRecent = lastWorkspaceBookingModified > prediction.LastModifiedDateTime;
                }

                if (!isSavedPredictionUserSet || isPredictionUserSet || isWorkspaceBookingMostRecent)
                {
                    if (location == null)
                    {
                        await appGraphService.DeleteEvent(id, prediction.Id);
                    }
                    else
                    {
                        prediction.Location = location;
                        prediction.Locations = new List<Location> { location };
                        prediction.SingleValueExtendedProperties = new EventSingleValueExtendedPropertiesCollectionPage
                        {
                            new SingleValueLegacyExtendedProperty
                            {
                                Id = appGraphService.ConvergePredictionSetByUser,
                                Value = isPredictionUserSet ? "true" : "false",
                            }
                        };
                        await appGraphService.UpdateEvent(id, prediction);
                    }
                }
            }
            else
            {
                if (location == null)
                {
                    return;
                }
                Event ev = new Event
                {
                    Subject = "Converge Prediction",
                    OriginalEndTimeZone = "UTC",
                    OriginalStartTimeZone = "UTC",
                    OriginalStart = startDateTime.ToUniversalTime(),
                    Start = new DateTimeTimeZone
                    {
                        DateTime = startDateTime.ToString("O"),
                        TimeZone = "UTC"
                    },
                    End = new DateTimeTimeZone
                    {
                        DateTime = endDateTime.ToString("O"),
                        TimeZone = "UTC"
                    },
                    ShowAs = FreeBusyStatus.Free,
                    Categories = new List<string> { appGraphService.ConvergeDisplayName },
                    IsReminderOn = false,
                    IsAllDay = true,
                    Location = location,
                    Locations = new List<Location> { location },
                };
                await appGraphService.CreateConvergePrediction(id, convergeCalendar.Id, ev, isPredictionUserSet);
            }
        }

        private Location NormalizeLocation(ExchangePlace place)
        {
            return new Location
            {
                DisplayName = place.Building?? place.DisplayName,
                Address = new PhysicalAddress
                {
                    Street = place.Street,
                    City = place.City,
                    PostalCode = place.PostalCode,
                    State = place.State,
                    CountryOrRegion = place.CountryOrRegion,
                },
                Coordinates = (place.GpsCoordinates == null) ? null : new OutlookGeoCoordinates()
                {
                    Latitude = place.GpsCoordinates.Latitude,
                    Longitude = place.GpsCoordinates.Longitude
                },
            };
        }

        public async Task<bool> UpdatePredictedLocationChosenByUser(DateTime startDate, string userId, UserPredictedLocation userPredictedLocation)
        {
            Location location = null;

            if (!string.IsNullOrWhiteSpace(userPredictedLocation.CampusUpn))
            {
                GraphExchangePlacesResponse exchangePlacesResponse = await buildingsMonoService.GetPlacesOfBuilding(userPredictedLocation.CampusUpn);
                var place = exchangePlacesResponse.ExchangePlacesList.FirstOrDefault();
                if (place != null)
                {
                    location = new Location()
                    {
                        LocationUri = userPredictedLocation.CampusUpn,
                        DisplayName = place.Building?? place.DisplayName,
                        Address = new PhysicalAddress
                        {
                            Street = place.Street,
                            City = place.City,
                            PostalCode = place.PostalCode,
                            State = place.State,
                            CountryOrRegion = place.CountryOrRegion,
                        },
                        Coordinates = (place.GpsCoordinates == null) ? null : new OutlookGeoCoordinates()
                        {
                            Latitude = place.GpsCoordinates.Latitude,
                            Longitude = place.GpsCoordinates.Longitude
                        }
                    };
                }
            }
            else if (!string.IsNullOrEmpty(userPredictedLocation.OtherLocationOption))
            {
                location = new Location()
                {
                    DisplayName = userPredictedLocation.OtherLocationOption
                };
            }

            if(location == null)
            {
                return false;
            }

            await CreateOrUpdatePrediction(userId, location, startDate, true);
            return true;
        }

        private bool IsEventOnDay(DateTime start, DateTime end, Event e)
        {
            // All day events are always from midnight to midnight, no matter what time zone they are retrieved in
            bool isAllDayOnDay = e.Start.CompareTo(new DateTime(start.Year, start.Month, start.Day)) == 0 && e.End.CompareTo(new DateTime(end.Year, end.Month, end.Day)) == 0 && (bool)e.IsAllDay;
            bool isOnDay = e.Start.CompareTo(start) >= 0 && e.End.CompareTo(end) <= 0;
            return isOnDay || isAllDayOnDay;
        }
    }
}