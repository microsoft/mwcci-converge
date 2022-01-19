// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Converge.Models;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Converge.Helpers
{
    public static class LocationHelper
    {
        public static GPSCoordinates GetCentralGeoCoordinates(List<GPSCoordinates> geoCoordinates)
        {
            List<GPSCoordinates> gpsDistinctCoords = new List<GPSCoordinates>(geoCoordinates);
            //Collect the distinct objects.
            for (int index = 0; index < gpsDistinctCoords.Count; ++index)
            {
                if (gpsDistinctCoords.Count(x => x.Latitude == gpsDistinctCoords[index].Latitude && x.Longitude == gpsDistinctCoords[index].Longitude) > 1)
                {
                    gpsDistinctCoords.RemoveAt(index);
                    --index;
                }
            }

            if (gpsDistinctCoords.Count == 1)
            {
                return new GPSCoordinates(gpsDistinctCoords[0].Latitude, gpsDistinctCoords[0].Longitude);
            }

            double x = 0, y = 0, z = 0;
            foreach (var geoCoords in gpsDistinctCoords)
            {
                var latitude = geoCoords.Latitude * Math.PI / 180;
                var longitude = geoCoords.Longitude * Math.PI / 180;

                x += Math.Cos(latitude) * Math.Cos(longitude);
                y += Math.Cos(latitude) * Math.Sin(longitude);
                z += Math.Sin(latitude);
            }

            x /= gpsDistinctCoords.Count;
            y /= gpsDistinctCoords.Count;
            z /= gpsDistinctCoords.Count;

            var centralSquareRoot = Math.Sqrt(x * x + y * y);
            var centralLatitude = Math.Atan2(z, centralSquareRoot);
            var centralLongitude = Math.Atan2(y, x);

            return new GPSCoordinates(centralLatitude * 180 / Math.PI, centralLongitude * 180 / Math.PI);
        }
    }
}
