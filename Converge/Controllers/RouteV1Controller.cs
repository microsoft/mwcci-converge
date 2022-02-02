// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Converge.Models;
using Converge.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace Converge.Controllers
{
    [Authorize]
    [Route("api/v1.0/route")]
    [ApiController]
    public class RouteV1Controller : Controller
    {
        private readonly RouteService routeService;

        public RouteV1Controller(RouteService routeService)
        {
            this.routeService = routeService;
        }

        /// <summary>
        /// Gets the travel times on various modes
        /// between two different places
        /// </summary>
        /// <param name="start">start denotes "the place from"</param>
        /// <param name="end">end denotes "the place to"</param>
        /// <returns></returns>
        [HttpGet]
        [Route("travelTime")]
        public async Task<ActionResult<RouteResponse>> GetTravelTimes(string start, string end)
        {
            double transit = await routeService.GetTransitTime(start, end);
            double drive = await routeService.GetDriveTime(start, end);
            return new RouteResponse
            {
                TransitTravelTimeInSeconds = transit,
                DriveTravelTimeInSeconds = drive,
            };
        }
    }
}
