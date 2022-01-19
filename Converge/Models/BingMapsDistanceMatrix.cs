// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

namespace Converge.Models
{
    public class BingMapsDistanceMatrix
    {
        public BingMapsDistanceMatrix(string originGeoCoords, string destinationGeoCoords)
        {
            OriginGeoCoordinates = originGeoCoords;
            DestinationGeoCoordinates = destinationGeoCoords;
        }

        public string OriginGeoCoordinates { get; private set; }
        public string DestinationGeoCoordinates { get; private set; }
        
        public float TravelDistance { get; set; }
        public float TravelDuration { get; set; }
        public float TotalWalkDuration { get; set; }
    }
}
