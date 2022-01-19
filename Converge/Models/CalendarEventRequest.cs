// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Microsoft.Graph;
using System;
using System.Collections.Generic;

namespace Converge.Models
{
    public class CalendarEventRequest
    {
        public DateTime Start { get; set; }

        public DateTime End { get; set; }

        public IEnumerable<EventRecipient> Attendees { get; set; }

        public Location Location { get; set; }

        public string Title { get; set; }

        public string Body { get; set; }

        public bool? IsAllDay { get; set; }

        public FreeBusyStatus? ShowAs { get; set; }
    }
}
