// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Converge.Models;
using Converge.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Converge.Controllers
{
    [Authorize]
    [Route("api/search")]
    [ApiController]
    public class SearchController : Controller
    {
        private readonly ILogger<SearchController> logger;
        private readonly SearchService searchService;

        public SearchController(ILogger<SearchController> logger, SearchService searchSvc)
        {
            this.logger = logger ?? throw new ArgumentNullException(nameof(logger));
            searchService = searchSvc;
        }

        /// <summary>
        /// Gets available venues to collaborate 
        /// for a given set of users, time, type
        /// and near given/particular user
        /// </summary>
        /// <param name="request">embodies users, start/end times, venue type and near to which selected user data for fetching the suitable venues</param>
        /// <returns>VenuesToCollaborateResponse - A container of List of suitable VenuesToCollaborate</returns>
        [HttpPost]
        [Route("venuesToCollaborate")]
        public async Task<VenuesToCollaborateResponse> GetVenuesToCollaborate([FromBody] VenuesToCollaborateRequest request)
        {
            searchService.SetPrincipalUserIdentity(User.Identity);

            try
            {
                List<VenuesToCollaborate> venuesToCollaborateList = await searchService.GetVenuesToCollaborate(request);
                return new VenuesToCollaborateResponse()
                {
                    VenuesToCollaborateList = venuesToCollaborateList
                };
            }
            catch (Exception ex)
            {
                logger.LogError(ex, $"Error occurred while getting Venues list for request: {JsonConvert.SerializeObject(request)}.");
                throw;
            }
        }

        /// <summary>
        /// Gets the venue details
        /// for the given venueId
        /// </summary>
        /// <param name="venueId">venue Id</param>
        /// <returns>Venue Details</returns>
        [HttpGet]
        [Route("venues/{venueId}/details")]
        public async Task<VenueDetails> GetVenueDetails(string venueId)
        {
            try
            {
                return await searchService.GetVenueDetails(venueId);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, $"Error occurred while getting Venue details for venue-id: {venueId}.");
                throw;
            }
        }

        /// <summary>
        /// Gets the Reviews available
        /// for the venue Identified with
        /// the provided venueId
        /// </summary>
        /// <param name="venueId">venue Id</param>
        /// <returns></returns>
        [HttpGet]
        [Route("venues/{venueId}/reviews")]
        public async Task<ServiceJsonResponse> GetVenueReviews(string venueId)
        {
            try
            {
                return await searchService.GetVenueReviews(venueId);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, $"Error occurred while getting Venue reviews for venue-id: {venueId}.");
                throw;
            }
        }

        /// <summary>
        /// Gets the available campuses/workspaces for
        /// collaboration based on the provided request data
        /// </summary>
        /// <param name="request"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("campusesToCollaborate")]
        public async Task<CampusesToCollaborateResponse> GetCampusesToCollaborate([FromBody] CampusesToCollaborateRequest request)
        {
            searchService.SetPrincipalUserIdentity(User.Identity);

            try
            {
                return await searchService.GetCampusesListToCollaborate(request);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, $"Error occurred while getting Campuses for request: {JsonConvert.SerializeObject(request)}.");
                throw;
            }
        }
    }
}
