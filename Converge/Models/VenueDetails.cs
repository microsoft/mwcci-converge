// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using System.Collections.Generic;

namespace Converge.Models
{
    public class VenueDetails : BaseVenue 
    {
        public string Alias { get; set; }

        public bool IsClaimed { get; set; }

        public bool IsClosed { get; set; }

        public YelpLocation Location { get; set; }

        public List<string> Photos { get; set; }

        public OperationHoursForWeek OperatingHours { get; set; }
    }
}
