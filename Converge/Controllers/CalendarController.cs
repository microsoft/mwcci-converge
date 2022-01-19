// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Converge.Helpers;
using Converge.Models;
using Converge.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Graph;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Converge.Controllers
{
    [Authorize]
    [Route("api/calendar")]
    [ApiController]
    public class CalendarController : Controller
    {
        /// <summary>
        /// Send logs to telemetry service
        /// </summary>
        private readonly ILogger<CalendarController> logger;
        private readonly UserGraphService userGraphService;
        private readonly BuildingsService buildingsService;

        public CalendarController(ILogger<CalendarController> logger, 
                                    UserGraphService graphService, 
                                    BuildingsService buildingsSvc)
        {
            this.logger = logger ?? throw new ArgumentNullException(nameof(logger));
            this.userGraphService = graphService;
            this.buildingsService = buildingsSvc;
        }

        /// <summary>
        /// Gets the working hours of the current user
        /// </summary>
        /// <returns>User working hours in UTC</returns>
        [HttpGet]
        [Route("mailboxSettings/workingHours")]
        public async Task<ActionResult<WorkingStartEnd>> GetWorkingHours()
        {
            try 
            {
                WorkingHours workingHours = await userGraphService.GetMyWorkingHours();
                return new WorkingStartEnd(workingHours);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, $"Error occurred while getting Working-hours by the user '{User.Identity.Name}'.");
                throw;
            }
        }

        /// <summary>
        /// Get all upcoming reservations within set duration
        /// </summary>
        /// <param name="startDateTime">Duration start time</param>
        /// <param name="endDateTime">Duration end time</param>
        /// <param name="top">retrieves only the specified top number of results</param>
        /// <param name="skip">skips the specified no of results before retrieving the top results</param>
        /// <returns>List of all reservations as calendar events</returns>
        [HttpGet]
        [Route("upcomingReservations")]
        public async Task<UpcomingReservationsResponse> GetUpcomingReservations(string startDateTime, string endDateTime, int top = 100, int skip = 0)
        {
            try
            {
                string filter = "IsOrganizer eq true";
                IUserCalendarViewCollectionPage calendarPage = await userGraphService.GetMyEvents(startDateTime, endDateTime, filter, top, skip);
                List<Event> events = calendarPage.CurrentPage as List<Event>;
                var targetEvents = events.Where(e => e.Location != null && !string.IsNullOrWhiteSpace(e.Location.LocationUri));
                List<CalendarEvent> calendarEventsList = targetEvents.Where(e => e.Locations.Any(l => l.LocationType == LocationType.ConferenceRoom))
                                                                    .Select(e => new CalendarEvent(e)).ToList();
                List<string> placeUpnsList = new List<string>();
                calendarEventsList.Select(p => p.Location).ToList().ForEach(x => placeUpnsList.Add(x.LocationUri));

                GraphExchangePlacesResponse exchangePlacesResponse = await buildingsService.GetPlacesByUpnsList(placeUpnsList);
                Parallel.ForEach(calendarEventsList, calendarEvent =>
                {
                    var targetPlace = exchangePlacesResponse.ExchangePlacesList?.FirstOrDefault(pl => pl.Identity.SameAs(calendarEvent.Location.LocationUri));
                    if (targetPlace != null)
                    {
                        calendarEvent.IsWorkspaceBooking = targetPlace.Type == PlaceType.Space;
                        calendarEvent.BuildingName = targetPlace.Building;
                    }
                });

                return new UpcomingReservationsResponse { Reservations = calendarEventsList, LoadMore = calendarPage.NextPageRequest != null };
            }
            catch (Exception ex)
            {
                logger.LogError(ex, $"Error occurred while getting Upcoming-reservations by the user '{User.Identity.Name}' for start-date:{startDateTime} and end-date:{endDateTime}.");
                throw;
            }
        }

        /// <summary>
        /// Creates Calendar Event
        /// </summary>
        /// <param name="calendarEvent">Calendar Event specifications</param>
        /// <returns></returns>
        [HttpPost]
        [Route("event")]
        public async Task<ActionResult<CalendarEvent>> CreateEvent([FromBody] CalendarEventRequest calendarEvent)
        {
            try
            {
                userGraphService.SetPrincipalUserIdentity(User.Identity);
                Event e =  await userGraphService.CreateEvent(calendarEvent);
                CalendarEvent returnEvent = new CalendarEvent(e);
                if (calendarEvent.Location?.LocationEmailAddress != null)
                {
                    GraphExchangePlacesResponse exchangePlacesResponse = await buildingsService.GetPlacesByUpnsList(new List<string> { calendarEvent.Location.LocationEmailAddress });
                    var targetPlace = exchangePlacesResponse.ExchangePlacesList?.FirstOrDefault();
                    if (targetPlace != null)
                    {
                        returnEvent.IsWorkspaceBooking = targetPlace.Type == PlaceType.Space;
                        returnEvent.BuildingName = targetPlace.Building;
                    }
                }

                return returnEvent;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, $"Error occurred while creating an event for request: {JsonConvert.SerializeObject(calendarEvent)}.");
                throw;
            }
        }

        /// <summary>
        /// Cancels or deletes the calendar event
        /// </summary>
        /// <param name="eventId">Id of the calendar event to cancel/delete in string</param>
        /// <param name="messageComment">Comment for event cancellation message to inform participants</param>
        /// <returns></returns>
        [HttpGet]
        [Route("events/{eventId}/deleteEvent")]
        public async Task<ActionResult> DeleteEvent(string eventId, string messageComment)
        {
            try
            {
                await userGraphService.DeleteEvent(eventId, messageComment);
                return NoContent();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, $"Error occurred while deleting an event with id: {eventId}.");
                throw;
            }
        }
    }
}
