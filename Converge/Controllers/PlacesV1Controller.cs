// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Converge.Models;
using Converge.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Converge.Controllers
{
    [Authorize]
    [Route("api/v1.0/places")]
    [ApiController]
    public class PlacesV1Controller : Controller
    {
        private readonly PlacesService placesService;

        public PlacesV1Controller(PlacesService placesService)
        {
            this.placesService = placesService;
        }

        /// <summary>
        /// Gets Max Reserved for the given collaboration workspace's
        /// upn between the selected start and end times.
        /// </summary>
        /// <param name="upn">collaboration workspace's upn</param>
        /// <param name="start">start time</param>
        /// <param name="end">end time</param>
        /// <returns>Max Reserved</returns>
        [HttpGet]
        [Route("{upn}/maxReserved")]
        public async Task<ActionResult<int>> GetMaxReserved(string upn, string start, string end)
        {
            return await placesService.GetMaxReserved(upn, start, end);
        }

        /// <summary>
        /// Gets the availability of the given conference room's upn
        /// </summary>
        /// <param name="upn">conference room's upn</param>
        /// <param name="start">start time</param>
        /// <param name="end">end time</param>
        /// <returns>if available true, else false</returns>
        [HttpGet]
        [Route("{upn}/availability")]
        public async Task<ActionResult<bool>> GetAvailability(string upn, string start, string end)
        {
            return await placesService.GetAvailability(upn, start, end);
        }

        /// <summary>
        /// Returns Availability in number for the Conference-room/Workspace referenced by UPN.
        /// </summary>
        /// <param name="upn">UPN of Conference-room/Workspace.</param>
        /// <param name="start">From Date/time.</param>
        /// <param name="end">To Date/time.</param>
        /// <returns>ExchangePlace: Holds Place details.</returns>
        [HttpGet]
        [Route("{upn}/details")]
        public async Task<ActionResult<ExchangePlace>> GetPlaceDetails(string upn, DateTime start, DateTime end)
        {
            return await placesService.GetPlace(upn, start, end);
        }

        /// <summary>
        /// Returns URL/Link with photo-type to the photos for the given Sharepoint-id.
        /// </summary>
        /// <param name="sharePointID">Sharepoint-id</param>
        /// <returns>List-of-ExchangePlacePhoto: List of URLs/Links with photo-type to the photos.</returns>
        [HttpGet]
        [Route("{sharePointID}/photos")]
        public async Task<ActionResult<List<ExchangePlacePhoto>>> GetPlacePhotos(string sharePointID)
        {
            return await placesService.GetPlacePhotos(sharePointID);
        }
    }
}
