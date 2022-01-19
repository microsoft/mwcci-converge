// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Converge.Models;
using Converge.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;

namespace Converge.Controllers
{
    [Authorize]
    [Route("api/route")]
    [ApiController]
    public class RouteController : Controller
    {
        private readonly ILogger<RouteController> logger;
        private readonly RouteService routeService;

        public RouteController(ILogger<RouteController> logger, RouteService routeService)
        {
            this.logger = logger ?? throw new ArgumentNullException(nameof(logger));
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
            try
            {
                double transit = await routeService.GetTransitTime(start, end);
                double drive = await routeService.GetDriveTime(start, end);
                return new RouteResponse
                {
                    TransitTravelTimeInSeconds = transit,
                    DriveTravelTimeInSeconds = drive,
                };
            }
            catch (Exception ex)
            {
                logger.LogError(ex, $"Error occurred while getting Travel-times by the user '{User.Identity.Name}' with start:{start} and end:{end}.");
                throw;
            }
        }
    }
}
