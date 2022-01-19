// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Converge.Helpers;
using Converge.Models.Enums;
using Microsoft.Graph;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Converge.Models
{
    public class CampusSortRequest
    {
        public CampusSortByType SortByType { get; set; }
        public GPSCoordinates SourceGpsCoordinates { get; set; }
        public double? DistanceFromSource { get; set; }
        public int? TopCount { get; set; }
        public string SkipTokenString { get; set; }
        public QueryOption SkipToken
        {
            get
            {
                return DeserializeHelper.QueryOption(SkipTokenString);
            }
        }

        public CampusSortRequest(CampusSortByType sortByType, int topCount, string skipTokenString)
        {
            SortByType = sortByType;
            TopCount = topCount;
            SkipTokenString = skipTokenString;
        }

        public CampusSortRequest(CampusSortByType sortByType, GPSCoordinates sourceGpsCoordinates, double? distanceFromSource)
        {
            SortByType = sortByType;
            SourceGpsCoordinates = sourceGpsCoordinates;
            DistanceFromSource = !distanceFromSource.HasValue ? 0.0 : distanceFromSource;
        }

        private double RadiansToDegrees(double rad)
        {
            return (rad * 180) / Math.PI;
        }

        private double DegreesToRadians(double deg)
        {
            return (deg * Math.PI) / 180;
        }

        private double FindLatitudeMaxRange()
        {
            return RadiansToDegrees(2 * Math.Asin(Math.Sin(DistanceFromSource.Value / 7380))) 
                    + SourceGpsCoordinates.Latitude;
        }

        private double FindLongitudeMaxRange()
        {
            return RadiansToDegrees(2 * Math.Asin(Math.Sqrt(Math.Pow(Math.Sin(DistanceFromSource.Value / 7380), 2) / Math.Pow(Math.Cos(DegreesToRadians(SourceGpsCoordinates.Latitude)), 2)))) 
                    + SourceGpsCoordinates.Longitude;
        }

        public GPSCoordinates[] GetCoordinatesRange()
        {
            var gpsCoordsRange = new GPSCoordinates[2];

            var latitudeMaxRange = FindLatitudeMaxRange();
            var longitudeMaxRange = FindLongitudeMaxRange();

            var latitudeDifference = Math.Abs(latitudeMaxRange - SourceGpsCoordinates.Latitude);
            var longitudeDifference = Math.Abs(longitudeMaxRange - SourceGpsCoordinates.Longitude);

            var latitude = SourceGpsCoordinates.Latitude - latitudeDifference;
            var longitude = SourceGpsCoordinates.Longitude - longitudeDifference;
            gpsCoordsRange[0] = new GPSCoordinates(latitude, longitude);

            latitude = SourceGpsCoordinates.Latitude + latitudeDifference;
            longitude = SourceGpsCoordinates.Longitude + longitudeDifference;
            gpsCoordsRange[1] = new GPSCoordinates(latitude, longitude);

            return gpsCoordsRange;
        }

        public List<Building> SortByName(List<Building> buildingsList)
        {
            return buildingsList.OrderBy(x => x.DisplayName).ToList();
        }

        public List<Building> SortBuildingsByDistance(List<Building> buildingsList)
        {
            foreach (var building in buildingsList)
            {
                building.DistanceFromOrigin = (building.GpsCoordinates == null) ? 
                                                double.MaxValue : CalculateDistance(SourceGpsCoordinates, building.GpsCoordinates);
            }

            return buildingsList.OrderBy(x => x.DistanceFromOrigin).ToList();
        }

        public List<ExchangePlace> SortPlacesByDistance(List<ExchangePlace> placesList)
        {
            foreach (var place in placesList)
            {
                place.DistanceFromOrigin = (place.GpsCoordinates == null) ?
                                                double.MaxValue : CalculateDistance(SourceGpsCoordinates, place.GpsCoordinates);
            }

            return placesList.OrderBy(x => x.DistanceFromOrigin).ToList();
        }

        private double CalculateDistance(GPSCoordinates sourceCoords, GPSCoordinates destinationCoords)
        {
            //
            //Using Haversine formula - 
            //Refer - https://www.generacodice.com/en/articolo/26682/Calcular-a-dist%C3%A2ncia-entre-dois-pontos-de-latitude-e-longitude-%28F%C3%B3rmula-Haversine%29
            //
            double latitudeDifference = DegreesToRadians(destinationCoords.Latitude - sourceCoords.Latitude);
            double longitudeDifference = DegreesToRadians(destinationCoords.Longitude - sourceCoords.Longitude);

            double calculation = Math.Sin(latitudeDifference / 2) * Math.Sin(latitudeDifference / 2)
                                    + Math.Cos(DegreesToRadians(sourceCoords.Latitude))
                                        * Math.Cos(DegreesToRadians(destinationCoords.Latitude))
                                        * Math.Sin(longitudeDifference / 2)
                                        * Math.Sin(longitudeDifference / 2);
            double angle = 2 * Math.Asin(Math.Min(1, Math.Sqrt(calculation)));

            return Constant.RadiusOfEarthInMiles * angle;
        }
    }
}
