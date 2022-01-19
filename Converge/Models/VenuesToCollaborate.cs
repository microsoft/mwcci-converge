// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

namespace Converge.Models
{
    public class VenuesToCollaborate : BaseVenue
    {
        public string VenueAddress { get; set; }

        public float? DistanceInMetres { get; set; }

        public bool? IsClosed { get; set; }

        public string City { get; set; }

        public string CountryOrRegion { get; set; }

        public string PostalCode { get; set; }

        public string State { get; set; }
        
        public string Street { get; set; }
    }
}
