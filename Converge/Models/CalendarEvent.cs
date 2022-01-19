// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Microsoft.Graph;
using System.Collections.Generic;
using System.Linq;

namespace Converge.Models
{
    public class CalendarEvent
    {
        public CalendarEvent(Event e)
        {
            if (e.Subject.ToLower() == "focus time")
            {
                IsFocusTime = true;
            }
            IsAllDay = e.IsAllDay;
            Start = e.Start;
            End = e.End;
            Attendees = e.Attendees;
            Location = e.Locations.ToList().Find(l => l.LocationType == LocationType.ConferenceRoom);
            Id= e.Id;
        }

        public bool? IsAllDay { get; set; }

        public bool IsFocusTime { get; set; }

        public DateTimeTimeZone Start { get; set; }

        public DateTimeTimeZone End { get; set; }

        public IEnumerable<Attendee> Attendees { get; set; }

        public Location Location { get; set; }

        public string Id { get; set; }

        public bool IsWorkspaceBooking { get; set; }

        public string BuildingName { get; set; }
    }
}
