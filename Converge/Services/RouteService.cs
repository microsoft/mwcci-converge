// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using BingMapsRESTToolkit;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Converge.Services
{
    public class RouteService
    {
        private readonly IConfiguration configuration;

        public RouteService(IConfiguration configuration)
        {
            this.configuration = configuration;
        }

        public async Task<double> GetTransitTime(string start, string end)
        {
            return await GetTime(TravelModeType.Transit, start, end);
        }

        public async Task<double> GetDriveTime(string start, string end)
        {
            return await GetTime(TravelModeType.Driving, start, end);
        }

        private async Task<double> GetTime(TravelModeType travelModeType, string start, string end)
        {
            var request = new RouteRequest()
            {
                RouteOptions = new RouteOptions()
                {
                    TravelMode = travelModeType,
                    DistanceUnits = DistanceUnitType.Miles,
                    RouteAttributes = new List<RouteAttributeType>()
                    {
                        RouteAttributeType.RoutePath,
                        RouteAttributeType.TransitStops
                    },
                    Optimize = RouteOptimizationType.TimeAvoidClosure,
                    DateTime = DateTime.UtcNow,
                    TimeType = RouteTimeType.Departure
                },
                Waypoints = new List<SimpleWaypoint>()
                {
                    new SimpleWaypoint(){
                        Address = start
                    },
                    new SimpleWaypoint(){
                        Address = end
                    }
                },
                BingMapsKey = configuration["BingMapsAPIKey"]
            };

            Response response = await request.Execute();
            return (response.ResourceSets[0].Resources[0] as Route).TravelDuration;
        }
    }
}
