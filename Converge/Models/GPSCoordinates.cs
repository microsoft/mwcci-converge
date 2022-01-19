// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using System.Text;

namespace Converge.Models
{
    public class GPSCoordinates
    {
        public double Latitude { get; set; }
        public double Longitude { get; set; }

        public GPSCoordinates(double latitude, double longitude)
        {
            Latitude = latitude;
            Longitude = longitude;
        }

        public static GPSCoordinates FromString(string commaSeparatedCoords)
        {
            var coords = string.IsNullOrWhiteSpace(commaSeparatedCoords) ? null : commaSeparatedCoords.Split(new char[] { ',' });

            GPSCoordinates gpsCoordinates = null;
            if (coords != null && coords.Length == 2 && double.TryParse(coords[0], out double latitude) 
                                                        && double.TryParse(coords[1], out double longitude))
            {
                gpsCoordinates = new GPSCoordinates(latitude, longitude);
            }

            return gpsCoordinates;
        }

        public override string ToString()
        {
            return new StringBuilder(Latitude + "," + Longitude).ToString();
        }
    }
}
