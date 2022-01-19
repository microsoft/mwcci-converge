// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Newtonsoft.Json;

namespace Converge.Models
{
    public class UserCoordinates
    {
        public string UserPrincipalName { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }

        [JsonConstructor]
        public UserCoordinates(string userPrincipalName, double latitude, double longitude)
        {
            UserPrincipalName = userPrincipalName;
            Latitude = latitude;
            Longitude = longitude;
        }

        public UserCoordinates(string userPrincipalName, GPSCoordinates gpsCoordinates) 
                            : this(userPrincipalName, gpsCoordinates.Latitude, gpsCoordinates.Longitude)
        {
        }
    }
}
