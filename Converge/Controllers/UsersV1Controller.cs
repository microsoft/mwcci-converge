// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using AutoWrapper.Filters;
using Converge.Models;
using Converge.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Graph;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Converge.Controllers
{
    [Authorize]
    [Route("api/v1.0/users")]
    [ApiController]
    public class UsersV1Controller : Controller
    {
        private readonly AppGraphService appGraphService;
        private readonly UserGraphService userGraphService;

        public UsersV1Controller(AppGraphService appGraphService, UserGraphService userGraphService)
        {
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
            var user = await userGraphService.GetUserByUpn(upn);
            if (user == null)
            {
                return NotFound();
            }
            return new SerializedUser(user);
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
            return await userGraphService.GetPresence(id);
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
            return await userGraphService.GetUserPhoto(id);
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
            return await userGraphService.GetUserProfile(id);
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
            Calendar calendar = await appGraphService.GetConvergeCalendar(id);
            if (calendar == null)
            {
                return "Unknown";
            }
            return await appGraphService.GetUserLocation(id, calendar.Id, year, month, day);
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
            userGraphService.SetPrincipalUserIdentity(User.Identity);

            List<UserCoordinates> userCoordinatesList = await userGraphService.GetUsersCoordinates(request);
            return new UserCoordinatesResponse
            {
                UserCoordinatesList = userCoordinatesList,
            };
        }

        /// <summary>
        /// Search Users that match the provided search string
        /// </summary>
        /// <param name="searchString">The string to user for user search</param>
        /// <param name="queryOptions">query options</param>
        /// <returns>List of users <see cref="User"/> whose DisplayName/UserPrincipalName starts with input string></returns>
        [HttpGet]
        [Route("search")]
        public async Task<ActionResult<UserSearchPaginatedResponse>> SearchUsers(string searchString, string queryOptions)
        {
            return await userGraphService.SearchUsers(searchString, queryOptions, User);
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
            return await userGraphService.GetMultiUserAvailabilityTimes(request);
        }
    }
}
