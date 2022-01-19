// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Converge.Models;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Converge.DataTransformers
{
    public class BingMapsLocationByAddressTransformer : BaseDataTransformer
    {
        public static GPSCoordinates GetGeoCoordinates(string venuesJson)
        {
            var deserializedObject = JsonConvert.DeserializeObject<dynamic>(venuesJson);
            IEnumerable<dynamic> resourcesTag = deserializedObject["resourceSets"][0]["resources"];
            IEnumerable<dynamic> relevantResources = resourcesTag.Where(x => string.Compare(Convert.ToString(x["address"]["countryRegion"]), 
                                                                                            Constant.CountryUnitedStates, 
                                                                                            true) == 0);

            dynamic resource = relevantResources.FirstOrDefault();
            if (resource == null)
            {
                return null;
            }
            var point = GetProperty(resource, "point");
            var location = (point == null || GetProperty(point, "coordinates") == null) ? null : GetProperty(point, "coordinates");
            if (location == null)
            {
                return null;
            }
            
            return new GPSCoordinates(Convert.ToDouble(location[0]), Convert.ToDouble(location[1]));
        }
    }
}
