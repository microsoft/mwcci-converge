// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Converge.Models;
using Converge.Services;
using Newtonsoft.Json;
using System;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Converge.DataTransformers
{
    public class YelpApiBusinessTransformer : BaseDataTransformer
    {
        public static async Task<VenuesToCollaborate> Transform(SearchBingMapsService searchBingMapsService, string businessesJson)
        {
            var deserializedObject = JsonConvert.DeserializeObject<dynamic>(businessesJson);
            return await YelpApiBusinessTransformer.Transform(searchBingMapsService, deserializedObject);
        }

        public static async Task<VenuesToCollaborate> Transform(SearchBingMapsService searchBingMapsService, dynamic deserializedObject)
        {
            var coordinates = GetProperty(deserializedObject, "coordinates");
            var latitude = (coordinates == null || GetProperty(coordinates, "latitude") == null) ? null : GetProperty(coordinates, "latitude");
            var longitude = (coordinates == null || GetProperty(coordinates, "longitude") == null) ? null : GetProperty(coordinates, "longitude");
            var location = GetProperty(deserializedObject, "location");
            string postalCode = (location == null || GetProperty(location, "zip_code") == null) ? null : GetProperty(location, "zip_code");
            var computedGeoCoords = ((latitude == null || longitude == null) && postalCode != null) ?
                                        await searchBingMapsService.GetGeoCoordsForZipcode(postalCode) : null;

            IEnumerable<dynamic> transactionsCollection = GetProperty(deserializedObject, "transactions");
            List<string> transactions = new List<string>();
            transactionsCollection.ToList().ForEach(y => transactions.Add(Convert.ToString(y)));

            IEnumerable<dynamic> categoriesCollection = GetProperty(deserializedObject, "categories");
            List<string> categories = new List<string>();
            categoriesCollection.Select(x => x["title"]).ToList().ForEach(y => categories.Add(Convert.ToString(y)));

            var venueToCollaborate = new VenuesToCollaborate()
            {
                VenueId = GetProperty(deserializedObject, "id"),
                VenueName = GetProperty(deserializedObject, "name"),
                Latitude = latitude ?? Convert.ToString(computedGeoCoords?.Latitude),
                Longitude = longitude ?? Convert.ToString(computedGeoCoords?.Longitude),
                VenueAddress = (location == null || GetProperty(location, "display_address") == null) ? string.Empty : GetProperty(location, "display_address", ", "),
                PhoneNumber = GetProperty(deserializedObject, "display_phone"),
                UrlReference = GetProperty(deserializedObject, "url"),
                ImageUrl = GetProperty(deserializedObject, "image_url"),
                DistanceInMetres = GetProperty(deserializedObject, "distance"),
                Rating = GetProperty(deserializedObject, "rating"),
                ReviewCount = GetProperty(deserializedObject, "review_count"),
                Price = GetProperty(deserializedObject, "price"),
                Transactions = transactions,
                Categories = categories,
                IsClosed = GetProperty(deserializedObject, "is_closed"),
                City = GetProperty(location, "city"),
                CountryOrRegion = GetProperty(location, "country"),
                PostalCode = GetProperty(location, "zip_code"),
                State = GetProperty(location, "state"),
                Street = $"{GetProperty(location, "address1")}, {$"{GetProperty(location, "address2")}," ?? ""} {$"{GetProperty(location, "Address3")}," ?? ""}"
            };

            return venueToCollaborate;
        }

        public static VenueDetails Transform(string businessJson)
        {
            var deserializedObject = JsonConvert.DeserializeObject<dynamic>(businessJson);
            var coordinates = GetProperty(deserializedObject, "coordinates");
            var latitude = (coordinates == null || GetProperty(coordinates, "latitude") == null) ? null : GetProperty(coordinates, "latitude");
            var longitude = (coordinates == null || GetProperty(coordinates, "longitude") == null) ? null : GetProperty(coordinates, "longitude");
            var location = GetProperty(deserializedObject, "location");
            string postalCode = (location == null || GetProperty(location, "zip_code") == null) ? null : GetProperty(location, "zip_code");

            IEnumerable<dynamic> transactionsCollection = GetProperty(deserializedObject, "transactions");
            List<string> transactions = new List<string>();
            if (transactionsCollection != null)
            {
                transactionsCollection.ToList().ForEach(y => transactions.Add(Convert.ToString(y)));
            }

            IEnumerable<dynamic> categoriesCollection = GetProperty(deserializedObject, "categories");
            List<string> categories = new List<string>();
            if (categoriesCollection != null)
            {
                categoriesCollection.Select(x => x["title"]).ToList().ForEach(y => categories.Add(Convert.ToString(y)));
            }

            IEnumerable<dynamic> photosCollection = GetProperty(deserializedObject, "photos");
            List<string> photos = new List<string>();
            if (photosCollection != null)
            {
                photosCollection.ToList().ForEach(p => photos.Add(Convert.ToString(p)));
            }

            var venue = new VenueDetails()
            {
                VenueId = GetProperty(deserializedObject, "id"),
                VenueName = GetProperty(deserializedObject, "name"),
                Latitude = latitude,
                Longitude = longitude,
                PhoneNumber = GetProperty(deserializedObject, "display_phone"),
                UrlReference = GetProperty(deserializedObject, "url"),
                ImageUrl = GetProperty(deserializedObject, "image_url"),
                Rating = GetProperty(deserializedObject, "rating"),
                ReviewCount = GetProperty(deserializedObject, "review_count"),
                Price = GetProperty(deserializedObject, "price"),
                Transactions = transactions,
                Categories = categories,
                IsClosed = GetProperty(deserializedObject, "is_closed") ?? false,
                Photos = photos,
                Alias = GetProperty(deserializedObject, "alias"),
                IsClaimed = GetProperty(deserializedObject, "is_claimed") ?? false,
            };

            if (location != null)
            {
                IEnumerable<dynamic> displayAddressCollection = GetProperty(deserializedObject, "display_address");
                List<string> displayAddress = new List<string>();
                if (displayAddressCollection != null)
                {
                    displayAddressCollection.ToList().ForEach(p => displayAddress.Add(Convert.ToString(p)));
                }
                venue.Location = new YelpLocation
                {
                    Address1 = GetProperty(location, "address1"),
                    Address2 = GetProperty(location, "address2"),
                    Address3 = GetProperty(location, "address3"),
                    City = GetProperty(location, "city"),
                    ZipCode = GetProperty(location, "zip_code"),
                    CountryOrRegion= GetProperty(location, "country"),
                    State = GetProperty(location, "state"),
                    DisplayAddress = displayAddress,
                    CrossStreets = GetProperty(location, "cross_streets")
                };
            }

            var hours = GetProperty(deserializedObject, "hours");
            if (hours != null)
            {
                var openJson = JsonConvert.SerializeObject(hours[0]);
                YelpOperationHoursByDayCollection openHoursCollection = JsonConvert.DeserializeObject<YelpOperationHoursByDayCollection>(openJson);
                venue.OperatingHours = new OperationHoursForWeek().Set(openHoursCollection);
            }

            return venue;
        }
    }
}
