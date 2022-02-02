// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Converge.Models;
using Converge.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Converge.Controllers
{
    [Authorize]
    [Route("api/v1.0/search")]
    [ApiController]
    public class SearchV1Controller : Controller
    {
        private readonly SearchService searchService;

        public SearchV1Controller(SearchService searchSvc)
        {
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

            List<VenuesToCollaborate> venuesToCollaborateList = await searchService.GetVenuesToCollaborate(request);
            return new VenuesToCollaborateResponse()
            {
                VenuesToCollaborateList = venuesToCollaborateList
            };
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
            return await searchService.GetVenueDetails(venueId);
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
            return await searchService.GetVenueReviews(venueId);
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

            return await searchService.GetCampusesListToCollaborate(request);
        }
    }
}
