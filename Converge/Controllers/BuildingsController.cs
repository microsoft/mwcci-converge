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
    [Route("api/buildings")]
    [ApiController]
    public class BuildingsController : Controller
    {
        /// <summary>
        /// Send logs to telemetry service
        /// </summary>
        private readonly ILogger<BuildingsController> logger;
        private readonly BuildingsService buildingsService;

        public BuildingsController(
            ILogger<BuildingsController> logger,
            BuildingsService buildingsService)
        {
            this.logger = logger ?? throw new ArgumentNullException(nameof(logger));
            this.buildingsService = buildingsService;
        }

        /// <summary>
        /// Returns all the Buildings alone (not Places) registered in the System, supporting Pagination, 
        /// defaulted to first 100 buildings if there is no value on how many records to skip.
        /// </summary>
        /// <param name="topCount">Number of records after the skipCount used to skip the number of records.</param>
        /// <param name="skipTokenString">Skip-token option as string to get next set of records.</param>
        /// <returns>BuildingsResponse: Containing the list of Buildings records and the count of those.</returns>
        [HttpGet]
        [Route("sortByName")]
        public async Task<ActionResult<BasicBuildingsResponse>> GetBuildings(int? topCount = null, string skipTokenString = null)
        {
            try
            {
                buildingsService.SetPrincipalUserIdentity(User.Identity);
                var result = await buildingsService.GetBuildings(topCount, skipTokenString);
                return Ok(result);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error occurred while getting the Buildings list.");
                throw;
            }
        }

        /// <summary>
        /// Returns the Buildings alone (not Places) registered in the System, 
        /// to support fetching by distance from the source geo-coordinates provided.
        /// </summary>
        /// <param name="sourceGeoCoordinates">Comma-separated Latitude and Longitude representing Geo-coordinates</param>
        /// <param name="distanceFromSource">Distance in miles from the location mentioned by SourceGeoCoordinates parameter</param>
        /// <returns>BuildingsResponse: Containing the list of Buildings records and the count of those.</returns>
        [HttpGet]
        [Route("sortByDistance")]
        public async Task<ActionResult<BasicBuildingsResponse>> GetBuildings(string sourceGeoCoordinates, double? distanceFromSource)
        {
            try
            {
                buildingsService.SetPrincipalUserIdentity(User.Identity);
                var result = await buildingsService.GetBuildings(sourceGeoCoordinates, distanceFromSource);
                return Ok(result);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error occurred while getting the Buildings list.");
                throw;
            }
        }

        /// <summary>
        /// Returns all the Conference-rooms belonging to the Building referenced using its UPN, supporting Pagination, 
        /// defaulted to first 100 Conference rooms if there is no value on how many records to skip.
        /// </summary>
        /// <param name="buildingUpn">UPN of Building.</param>
        /// <param name="topCount">Number of records after the skipCount used to skip the number of records.</param>
        /// <param name="skipTokenString">Skip-token option as string to get next set of records.</param>
        /// <param name="hasVideo">Whether to return places with a video display device.</param>
        /// <param name="hasAudio">Whether to return places with an audio device.</param>
        /// <param name="hasDisplay">Whether to return places with a display device.</param>
        /// <param name="isWheelchairAccessible">Whether to return places that are wheelchair accessible.</param>
        /// <returns>ExchangePlacesResponse: Containing the Conference-rooms list and reference to Link-to-next-page.</returns>
        [HttpGet]
        [Route("{buildingUpn}/rooms")]
        public async Task<ActionResult<GraphExchangePlacesResponse>> GetBuildingConferenceRooms(
            string buildingUpn, 
            int? topCount = null, 
            string skipTokenString = null,
            bool hasVideo = false,
            bool hasAudio = false,
            bool hasDisplay = false,
            bool isWheelchairAccessible = false
        )
        {
            try
            {
                ListItemFilterOptions listItemFilterOptions = new ListItemFilterOptions
                {
                    HasAudio = hasAudio,
                    HasVideo = hasVideo,
                    HasDisplay = hasDisplay,
                    IsWheelChairAccessible = isWheelchairAccessible,
                };
                var result = await buildingsService.GetPlacesOfBuilding(buildingUpn, PlaceType.Room, topCount, skipTokenString, listItemFilterOptions);
                return Ok(result);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, $"Error occurred while getting Conference-Rooms of the Building for upn: {buildingUpn}.");
                throw;
            }
        }

        /// <summary>
        /// Returns all the Workspaces belonging to the Building referenced using its UPN, supporting Pagination, 
        /// defaulted to first 100 Workspaces if there is no value on how many records to skip.
        /// </summary>
        /// <param name="buildingUpn">UPN of Building.</param>
        /// <param name="topCount">Number of records after the skipCount used to skip the number of records.</param>
        /// <param name="skipTokenString">Skip-token option as string to get next set of records.</param>
        /// <param name="hasVideo">Whether to return places with a video display device.</param>
        /// <param name="hasAudio">Whether to return places with an audio device.</param>
        /// <param name="hasDisplay">Whether to return places with a display device.</param>
        /// <param name="isWheelchairAccessible">Whether to return places that are wheelchair accessible.</param>
        /// <param name="displayNameSearchString">Search string to search places by display name</param>
        /// <returns>ExchangePlacesResponse: Containing the Workspaces list and reference to Link-to-next-page.</returns>
        [HttpGet]
        [Route("{buildingUpn}/spaces")]
        public async Task<ActionResult<GraphExchangePlacesResponse>> GetBuildingWorkspaces(
            string buildingUpn,
            int? topCount = null,
            string skipTokenString = null,
            bool hasVideo = false,
            bool hasAudio = false,
            bool hasDisplay = false,
            bool isWheelchairAccessible = false,
            string displayNameSearchString = null
        )
        {
            try
            {
                ListItemFilterOptions listItemFilterOptions = new ListItemFilterOptions
                {
                    HasAudio = hasAudio,
                    HasVideo = hasVideo,
                    HasDisplay = hasDisplay,
                    IsWheelChairAccessible = isWheelchairAccessible,
                    DisplayNameSearchString = displayNameSearchString,
                };
                var result = await buildingsService.GetPlacesOfBuilding(buildingUpn, PlaceType.Space, topCount, skipTokenString, listItemFilterOptions);
                return Ok(result);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, $"Error occurred while getting Workspaces of the Building for upn: {buildingUpn}.");
                throw;
            }
        }

        /// <summary>
        /// Returns the Conference-room record for the given identity (upn).
        /// </summary>
        /// <param name="roomUpn">UPN of Conference-room.</param>
        /// <returns>ExchangePlace: Conference-room specifics.</returns>
        [HttpGet]
        [Route("rooms/{roomUpn}")]
        public async Task<ActionResult<ExchangePlace>> GetConferenceRoom(string roomUpn)
        {
            try
            {
                var result = await buildingsService.GetPlaceByUpn(roomUpn, PlaceType.Room);
                return Ok(result);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, $"Error occurred while getting Conference-Room-details for upn: {roomUpn}.");
                throw;
            }
        }

        /// <summary>
        /// Returns the Workspace record for the given identity (upn).
        /// </summary>
        /// <param name="spaceUpn">UPN of Workspace.</param>
        /// <returns>ExchangePlace: Workspace specifics.</returns>
        [HttpGet]
        [Route("spaces/{spaceUpn}")]
        public async Task<ActionResult<ExchangePlace>> GetWorkspace(string spaceUpn)
        {
            try
            {
                var result = await buildingsService.GetPlaceByUpn(spaceUpn, PlaceType.Space);
                return Ok(result);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, $"Error occurred while getting Workspace-details for upn: {spaceUpn}.");
                throw;
            }
        }

        /// <summary>
        /// Returns in percentage (%) the Reserved and Availability of all the Workspaces for the given Building UPN.
        /// </summary>
        /// <param name="buildingUpn">UPN of Building.</param>
        /// <param name="start">From Date/time.</param>
        /// <param name="end">To Date/time.</param>
        /// <returns>ConvergeSchedule: Holds Reserved/Availability as Percentages (%) for the Workspaces.</returns>
        [HttpGet]
        [Route("{buildingUpn}/schedule")]
        public async Task<ActionResult<ConvergeSchedule>> GetWorkspacesSchedule(string buildingUpn, string start, string end)
        {
            try
            {
                return await buildingsService.GetWorkspacesScheduleForBuilding(buildingUpn, start, end);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, $"Error occurred while getting Schedule for buildingUpn:{buildingUpn} with start:{start} and end:{end}.");
                throw;
            }
        }

        [HttpGet]
        [Route("searchForBuildings/{searchString}")]
        public async Task<ActionResult<BuildingSearchInfo>> SearchForBuildings(string searchString, int? topCount = null, string skipToken = null)
        {
            try
            {
                return await buildingsService.SearchForBuildings(searchString, topCount, skipToken);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, $"Error occurred while searching Buildings for: {searchString}.");
                throw;
            }
        }
    }
}
