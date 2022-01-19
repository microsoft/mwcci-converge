// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Converge.Models;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace Converge.DataTransformers
{
    public class BingMapsDistanceMatrixTransformer : BaseDataTransformer
    {
        public static List<BingMapsDistanceMatrix> Transform(string distanceJsonString)
        {
            var deserializedObject = JsonConvert.DeserializeObject<dynamic>(distanceJsonString);
            dynamic resourceTag = deserializedObject["resourceSets"][0]["resources"][0];

            int index = 0;
            var distanceMatrixList = new List<BingMapsDistanceMatrix>();
            foreach (dynamic origin in resourceTag["origins"])
            {
                foreach (dynamic destination in resourceTag["destinations"])
                {
                    var originGeoCoords = new StringBuilder().Append(Convert.ToString(origin["latitude"]))
                                                    .Append(",").Append(Convert.ToString(origin["longitude"]));
                    var destinationGeoCoords = new StringBuilder().Append(Convert.ToString(destination["latitude"]))
                                                    .Append(",").Append(Convert.ToString(destination["longitude"]));
                    var resultsTag = resourceTag["results"][index++];

                    var distanceMatrix = new BingMapsDistanceMatrix(originGeoCoords.ToString(), destinationGeoCoords.ToString())
                    {
                        TravelDistance = GetProperty(resultsTag, "travelDistance"),
                        TravelDuration = GetProperty(resultsTag, "travelDuration"),
                        TotalWalkDuration = GetProperty(resultsTag, "totalWalkDuration")
                    };

                    distanceMatrixList.Add(distanceMatrix);
                }
            }

            return distanceMatrixList;
        }
    }
}