// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using AutoWrapper.Filters;
using Converge.Models;
using Converge.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Graph;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Converge.Controllers
{
    [Authorize]
    [Route("api/users")]
    [ApiController]
    public class UsersController : Controller
    {
        private readonly ILogger<UsersController> logger;
        private readonly AppGraphService appGraphService;
        private readonly UserGraphService userGraphService;

        public UsersController(ILogger<UsersController> logger, AppGraphService appGraphService, UserGraphService userGraphService)
        {
            this.logger = logger ?? throw new ArgumentNullException(nameof(logger));
            this.appGraphService = appGraphService;
            this.userGraphService = userGraphService;
        }

        /// <summary>
        /// Gets the User identified by the provided upn
        /// </summary>
        /// <param name="upn">upn</param>
        /// <returns></returns>
        [HttpGet]
        [Route("{upn}")]
        public async Task<ActionResult<SerializedUser>> GetUser(string upn)
        {
            try
            {
                var user = await userGraphService.GetUserByUpn(upn);
                if (user == null)
                {
                    return NotFound();
                }
                return new SerializedUser(user);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, $"Error while getting the user for upn: {upn}.");
                throw;
            }
        }

        /// <summary>
        /// Gets the 
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpGet]
        [Route("{id}/presence")]
        public async Task<ActionResult<ApiPresence>> GetUserPresence(string id)
        {
            try
            {
                return await userGraphService.GetPresence(id);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, $"Error while getting User-presence for id: {id}.");
                throw;
            }
        }

        /// <summary>
        /// Gets the profile photo of the user 
        /// identified by the provided id 
        /// </summary>
        /// <param name="id">id</param>
        /// <returns></returns>
        [HttpGet]
        [Route("{id}/photo")]
        [AutoWrapIgnore]
        public async Task<ActionResult<System.IO.Stream>> GetPersonPhoto(string id)
        {
            try
            {
                return await userGraphService.GetUserPhoto(id);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, $"Error while getting User-photo for id: {id}.");
                throw;
            }
        }

        /// <summary>
        /// Gets the user profile of the user 
        /// identified by the provided id  
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpGet]
        [Route("{id}/userProfile")]
        public async Task<UserProfile> GetUserProfile(string id)
        {
            try
            {
                return await userGraphService.GetUserProfile(id);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, $"Error while getting User-profile for id: {id}.");
                throw;
            }
        }

        /// <summary>
        /// Gets specific User Location for the given date
        /// </summary>
        /// <param name="id">User id</param>
        /// <param name="year">year</param>
        /// <param name="month">month</param>
        /// <param name="day">day</param>
        /// <returns></returns>
        [HttpGet]
        [Route("{id}/location")]
        public async Task<string> GetUserLocation(string id, int year, int month, int day)
        {
            try
            {
                Calendar calendar = await appGraphService.GetConvergeCalendar(id);
                if (calendar == null)
                {
                    return "Unknown";
                }
                return await appGraphService.GetUserLocation(id, calendar.Id, year, month, day);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, $"Error while getting User-location for id: '{id}' for date {year}-{month}-{day}.");
                throw;
            }
        }

        /// <summary>
        /// Gets the co-ordinates of multiple users
        /// </summary>
        /// <param name="request"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("coordinates")]
        public async Task<UserCoordinatesResponse> GetUsersCoordinates([FromBody] MultiUserAvailableTimesRequest request)
        {
            try
            {
                userGraphService.SetPrincipalUserIdentity(User.Identity);

                List<UserCoordinates> userCoordinatesList = await userGraphService.GetUsersCoordinates(request);
                return new UserCoordinatesResponse
                {
                    UserCoordinatesList = userCoordinatesList,
                };
            }
            catch (Exception ex)
            {
                logger.LogError(ex, $"Error while getting User-coordinates for request: {JsonConvert.SerializeObject(request)}.");
                throw;
            }
        }

        /// <summary>
        /// Search Users that match the provided search string
        /// </summary>
        /// <param name="searchString"></param>
        /// <returns>List of users <see cref="User"/> whose DisplayName/UserPrincipalName starts with input string></returns>
        [HttpGet]
        [Route("search/{searchString}")]
        public async Task<ActionResult<List<User>>> SearchUsers(string searchString)
        {
            try
            {
                var userSearchResponse = await userGraphService.SearchUsers(searchString, null, User);
                return userSearchResponse.Users;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, $"Error while searching Users for '{searchString}'.");
                throw;
            }
        }

        /// <summary>
        /// Search Users that match the provided search string and
        /// filter results based on the provided query options
        /// </summary>
        /// <param name="searchString">search string</param>
        /// <param name="queryOptions">query options</param>
        /// <returns>List of users <see cref="User"/> whose DisplayName/UserPrincipalName starts with input string></returns>
        [HttpGet]
        [Route("searchAndPage")]
        public async Task<ActionResult<UserSearchPaginatedResponse>> SearchUsersByPage(string searchString, string queryOptions)
        {
            try
            {
                return await userGraphService.SearchUsers(searchString, queryOptions, User);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, $"Error while searching Users for '{searchString}' and queryOptions: {queryOptions}.");
                throw;
            }
        }

        /// <summary>
        /// Gets availability information for multiple users
        /// </summary>
        /// <param name="request"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("multi/availableTimes")]
        public async Task<MultiUserAvailableTimesResponse> GetMultiUserAvailabilityTimes([FromBody] MultiUserAvailableTimesRequest request)
        {
            try
            {
                return await userGraphService.GetMultiUserAvailabilityTimes(request);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, $"Error while getting multi-user available-times for request: {JsonConvert.SerializeObject(request)}.");
                throw;
            }
        }
    }
}
