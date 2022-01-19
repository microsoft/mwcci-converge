// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using System.Collections.Generic;

namespace Converge.Models
{
    public class UpcomingReservationsResponse
    {
        /// <summary>
        /// The upcoming reservations. These are defined as calendar events that are organized by the logged in user
        /// and held in a conference room.
        /// </summary>
        public List<CalendarEvent> Reservations { get; set; }

        /// <summary>
        /// Gets or sets whether there are more reservations to load.
        /// </summary>
        public bool LoadMore { get; set; }
    }
}
