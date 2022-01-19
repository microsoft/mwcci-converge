// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using System.Collections.Generic;

namespace Converge.Models
{
    public class YelpLocation
    {
        public string Address1 { get; set; }

        public string Address2 { get; set; }

        public string Address3 { get; set; }

        public string City { get; set; }

        public string ZipCode { get; set; }

        public string CountryOrRegion { get; set; }

        public string State { get; set; }

        public List<string> DisplayAddress { get; set; }
        
        public string CrossStreets { get; set; }
    }
}
