// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Converge.Models;
using Converge.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Converge.Controllers
{
    [Authorize]
    [Route("api/places")]
    [ApiController]
    public class PlacesController : Controller
    {
        private readonly ILogger<PlacesController> logger;
        private readonly PlacesService placesService;

        public PlacesController(ILogger<PlacesController> logger, PlacesService placesService)
        {
            this.logger = logger ?? throw new ArgumentNullException(nameof(logger));
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
            try
            {
                return await placesService.GetMaxReserved(upn, start, end);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, $"Error occurred while getting Max-Reserved for upn:{upn} with start:{start} and end:{end}.");
                throw;
            }
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
            try
            {
                return await placesService.GetAvailability(upn, start, end);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, $"Error occurred while getting Availability for upn:{upn} with start:{start} and end:{end}.");
                throw;
            }
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
            try
            {
                return await placesService.GetPlace(upn, start, end);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, $"Error occurred while getting Place-details for placeUpn:{upn} with start:{start} and end:{end}.");
                throw;
            }
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
            try
            {
                return await placesService.GetPlacePhotos(sharePointID);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, $"Error occurred while getting place photos for sharepoint-id:{sharePointID}.");
                throw;
            }
        }
    }
}
