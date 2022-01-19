// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using System;

namespace Converge.Models
{
    public static class Constant
    {
        public static string Converge = "Converge";

        public static string ConvergeExtensionId = "Com.Microsoft.Converge";

        public static readonly string[] ScopesToAccessGraphApi = new string[] {
            "Calendars.ReadWrite",
            "MailboxSettings.ReadWrite",
            "People.Read",
            "Presence.Read.All",
            "User.Read.All",
            "User.ReadWrite",
            "Place.Read.All",
        };

        public static string TimeZonePST = "Pacific Standard Time";

        public static string TimeZoneCodeUTC = "UTC";
        public static string TimeZoneUTC = "Coordinated Universal Time";

        public static string CountryCodeUS = "US";
        public static string CountryUnitedStates = "United States";

        public static readonly string[] AcceptableVenueTypes = { "Food & Drink",
                                                                 "Parks & Recreation"
                                                               };
        public static readonly string[] YelpDefinedVenueTypes = { "restaurants",
                                                                  "active"
                                                                };
        public static readonly string[] BuildingsSortByTypes = { "DisplayName",
                                                                 "Distance"
                                                               };
        public static readonly string[] SortOrder = { "Asc", "Desc" };
        
        public static readonly string[] OtherLocationType = { "Remote", "Out of Office" };

        public static readonly int UserAvailabilityWindowInMinutes = 30;

        public static readonly double RadiusOfEarthInMiles = 3958.75;
    }
}
