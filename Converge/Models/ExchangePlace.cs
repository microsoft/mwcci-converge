// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Microsoft.Graph;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;

namespace Converge.Models
{
    public class ExchangePlace
    {
        public ExchangePlace() { }
        public string Identity { get; set; }
        public string DisplayName { get; set; }
        public PlaceType? Type { get; set; }
        public string Street { get; set; }
        public string City { get; set; }
        public string State { get; set; }
        public string PostalCode { get; set; }
        public string CountryOrRegion { get; set; }
        public bool? IsManaged { get; set; }
        public BookingType? BookingType { get; set; }
        public string Phone { get; set; }
        public int Capacity { get; set; }
        public string Building { get; set; }
        public string Label { get; set; }
        public string AudioDeviceName { get; set; }
        public string VideoDeviceName { get; set; }
        public string DisplayDeviceName { get; set; }
        public bool? IsWheelChairAccessible { get; set; }
        public string Floor { get; set; }
        public string FloorLabel { get; set; }
        public List<string> Tags { get; set; }
        public string Locality { get; set; }
        public int AvailableSlots { get; set; }
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

        /// <summary>
        /// The ID of this place in SharePoint.
        /// </summary>
        public string SharePointID { get; set; }

        public bool IsActive { get; set; } = true;

        private float rankByDistance;

        [JsonIgnore]
        public float RankByDistance
        {
            get
            {
                return rankByDistance + (string.IsNullOrEmpty(Floor) ? 0 : float.Parse(Floor) / 10);
            }
            set
            {
                rankByDistance = value;
            }
        }

        [JsonIgnore]
        public double DistanceFromOrigin { get; set; }
    }

    public enum PlaceType
    {
        Space,
        Room
    }
}
