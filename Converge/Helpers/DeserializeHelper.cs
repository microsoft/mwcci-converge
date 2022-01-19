// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Converge.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Graph;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Converge.Helpers
{
    public class DeserializeHelper
    {
        public static ExchangePlace DeserializeExchangePlace(IDictionary<string, object> serializedPlace, ILogger logger)
        {
            ExchangePlace exchangePlace = new ExchangePlace
            {
                Identity = GetProperty("EmailAddress", serializedPlace),
                DisplayName = GetProperty("Name", serializedPlace),
                Street = GetProperty("Street", serializedPlace),
                City = GetProperty("City", serializedPlace),
                State = GetProperty("State", serializedPlace),
                PostalCode = GetProperty("PostalCode", serializedPlace),
                CountryOrRegion = GetProperty("CountryOrRegion", serializedPlace),
                IsManaged = GetProperty("IsManaged", serializedPlace) == "True",
                Phone = GetProperty("Phone", serializedPlace),
                Building = GetProperty("Building", serializedPlace),
                Label = GetProperty("Label", serializedPlace),
                AudioDeviceName = GetProperty("AudioDeviceName", serializedPlace),
                VideoDeviceName = GetProperty("VideoDeviceName", serializedPlace),
                DisplayDeviceName = GetProperty("DisplayDeviceName", serializedPlace),
                IsWheelChairAccessible = GetProperty("IsWheelChairAccessible", serializedPlace) == "True",
                Floor = GetProperty("Floor", serializedPlace),
                FloorLabel = GetProperty("FloorLabel", serializedPlace),
                Locality = GetProperty("Locality", serializedPlace),
                IsActive = GetProperty("IsAvailable", serializedPlace) == "True"
            };
            string capacity = GetProperty("Capacity", serializedPlace);
            if (capacity != null)
            {
                if (Int32.TryParse(capacity, out int c))
                {
                    exchangePlace.Capacity = c;
                }
            }
            string tags = GetProperty("Tags", serializedPlace);
            if (tags != null)
            {
                exchangePlace.Tags = tags.Split(",").ToList();
            }

            string latitude = GetProperty("Latitude", serializedPlace);
            string longitude = GetProperty("Longitude", serializedPlace);
            if (!string.IsNullOrEmpty(latitude) && !string.IsNullOrEmpty(longitude))
            {
                exchangePlace.GeoCoordinates = $"{latitude},{longitude}";
            } else
            {
                Dictionary<string, object> coordinates = GetCoordinates(serializedPlace, logger);
                if (coordinates != null)
                {
                    latitude = GetProperty("latitude", coordinates);
                    longitude = GetProperty("longitude", coordinates);
                    exchangePlace.GeoCoordinates = $"{latitude},{longitude}";
                }
            }

            string type = GetProperty("PlaceType", serializedPlace);
            exchangePlace.Type = type == "Space" ? PlaceType.Space : PlaceType.Room;
            string bType = GetProperty("BookingType", serializedPlace);
            BookingType bookingType = BookingType.Unknown;
            switch (bType)
            {
                case "Reserved":
                    bookingType = BookingType.Reserved;
                    break;
                case "Standard":
                    bookingType = BookingType.Standard;
                    break;
            }
            exchangePlace.BookingType = bookingType;

            return exchangePlace;
        }

        public static string GetProperty(string propertyName, IDictionary<string, object> dict)
        {
            dict.TryGetValue(propertyName, out object propertyValue);
            if (propertyValue != null)
            {
                return propertyValue.ToString();
            }
            return null;
        }

        private static Dictionary<string, object> GetCoordinates(IDictionary<string, object> dict, ILogger logger)
        {
            string propertyValue = GetProperty("Coordinates", dict);
            if (string.IsNullOrEmpty(propertyValue))
            {
                logger.LogInformation("Property value is null.");
                return null;
            }
            Dictionary<string, object> locationValues = JsonConvert.DeserializeObject<Dictionary<string, object>>(propertyValue);
            if (locationValues == null)
            {
                logger.LogInformation("Location values is null.");
                return null;
            }
            string coordinateValues = GetProperty("coordinates", locationValues);
            if (string.IsNullOrEmpty(coordinateValues))
            {
                logger.LogInformation("Coordinate values is null.");
                return null;
            }

            return JsonConvert.DeserializeObject<Dictionary<string, object>>(coordinateValues);
        }

        public static QueryOption QueryOption(string skipTokenString)
        {
            QueryOption skipToken = null;
            if (!string.IsNullOrWhiteSpace(skipTokenString))
            {
                skipToken = JsonConvert.DeserializeObject<QueryOption>(skipTokenString);
            }

            return skipToken;
        }
    }
}
