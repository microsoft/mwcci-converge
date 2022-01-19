// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Converge.Models
{
    public class Building
    {
        public string DisplayName { get; set; }
        public string Identity { get; set; }
        public string Address { get; set; }
        public int Capacity { get; set; }
        public List<ExchangePlace> Places { get; set; }
        public string GeoCoordinates { get; set; }

        private GPSCoordinates gpsCoordinates;
        public GPSCoordinates GpsCoordinates
        {
            get
            {
                if (gpsCoordinates == null)
                {
                    var coords = string.IsNullOrWhiteSpace(GeoCoordinates) ? null : GeoCoordinates.Split(new char[] { ',' });
                    gpsCoordinates = (coords?.Length != 2) ? null : new GPSCoordinates(Convert.ToDouble(coords[0]), Convert.ToDouble(coords[1]));
                }

                return gpsCoordinates;
            }
            set
            {
                gpsCoordinates = value;
            }
        }

        [JsonIgnore]
        public string Street { get; set; }
        [JsonIgnore]
        public string City { get; set; }
        [JsonIgnore]
        public string State { get; set; }
        [JsonIgnore]
        public string PostalCode { get; set; }
        [JsonIgnore]
        public string CountryOrRegion { get; set; }
        [JsonIgnore]
        public double DistanceFromOrigin{ get; set; }

        public Building()
        {
        }

        public Building(Building building)
        {
            DisplayName = building.DisplayName;
            Identity = building.Identity;
            Capacity = building.Capacity;
            Address = building.Address;
            Street = building.Street;
            City = building.City;
            State = building.State;
            PostalCode = building.PostalCode;
            CountryOrRegion = building.CountryOrRegion;
            GeoCoordinates = building.GeoCoordinates;
            DistanceFromOrigin = building.DistanceFromOrigin;
            GpsCoordinates = building.GpsCoordinates;
        }

        public static Building Instantiate(ExchangePlace exchangePlaceModel)
        {
            return new Building()
            {
                DisplayName = exchangePlaceModel.Building,
                Identity = exchangePlaceModel.Locality,
                Address = $"{exchangePlaceModel.Street}, {exchangePlaceModel.City} {exchangePlaceModel.State}, {exchangePlaceModel.PostalCode}, {exchangePlaceModel.CountryOrRegion}",
                Street = exchangePlaceModel.Street,
                City = exchangePlaceModel.City,
                State = exchangePlaceModel.State,
                PostalCode = exchangePlaceModel.PostalCode,
                CountryOrRegion = exchangePlaceModel.CountryOrRegion,
                GeoCoordinates = exchangePlaceModel.GeoCoordinates,
            };
        }
    }
}
