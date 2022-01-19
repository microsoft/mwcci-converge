// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using System.Collections.Generic;

namespace Converge.Models
{
    public class BaseVenue
    {
        public string VenueId { get; set; }

        public string VenueName { get; set; }

        public double? Latitude { get; set; }

        public double? Longitude { get; set; }

        public string PhoneNumber { get; set; }

        public string UrlReference { get; set; }

        public string ImageUrl { get; set; }

        public float? Rating { get; set; }

        public int? ReviewCount { get; set; }

        public string Price { get; set; }
        
        public List<string> Categories { get; set; }

        public List<string> Transactions { get; set; }
    }
}
