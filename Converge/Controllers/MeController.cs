// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Converge.Helpers;
using Converge.Models;
using Converge.Models.Enums;
using Converge.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Graph;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Converge.Controllers
{
    [Authorize]
    [Route("api/me")]
    [ApiController]
    public class MeController : Controller
    {
        /// <summary>
        /// Send logs to telemetry service
        /// </summary>
        private readonly ILogger<MeController> logger;
        private readonly UserGraphService userGraphService;
        private readonly PredictionService predictionService;
        private readonly IConfiguration configuration;
        private readonly TelemetryService telemetryService;
        private readonly BuildingsService buildingsService;
        private readonly PlacesService placesService;

        public MeController(ILogger<MeController> logger,
                            IConfiguration configuration,
                            UserGraphService userGraphService, 
                            PredictionService predictionService, 
                            TelemetryService telemetryService,
                            BuildingsService buildingsService,
                            PlacesService placesService)
        {
            this.logger = logger ?? throw new ArgumentNullException(nameof(logger));
            this.configuration = configuration;
            this.userGraphService = userGraphService;
            this.predictionService = predictionService;
            this.telemetryService = telemetryService;
            this.buildingsService = buildingsService;
            this.placesService = placesService;
        }

        /// <summary>
        /// Gets converge settings for the current user.
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [Route("convergeSettings")]
        public async Task<ActionResult<ConvergeSettings>> GetMyConvergeSettings()
        {
            return await userGraphService.GetConvergeSettings();
        }

        /// <summary>
        /// Creates/Updates Converge settings for the current user.
        /// </summary>
        /// <param name="convergeSettings">Settings info</param>
        /// <returns></returns>
        [HttpPost]
        [Route("convergeSettings")]
        public async Task<ActionResult> SetMyConvergeSettings(ConvergeSettings convergeSettings)
        {
            if (string.IsNullOrEmpty(convergeSettings.ZipCode))
            {
                this.telemetryService.TrackEvent(TelemetryService.USER_NO_ZIP_CODE);
            }
            ConvergeSettings settings = await userGraphService.GetConvergeSettings();
            if (settings == null)
            {
                await userGraphService.SaveConvergeSettings(convergeSettings, DataOperationType.IsAdd);
            }
            else
            {
                await userGraphService.SaveConvergeSettings(convergeSettings, DataOperationType.IsUpdate);
            }
            return Ok();
        }

        /// <summary>
        /// Gets current user's workgroup in the organization.
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [Route("workgroup")]
        public async Task<List<DirectoryObject>> GetMyWorkgroup()
        {
            var result = new List<Microsoft.Graph.DirectoryObject>();
            var manager = await userGraphService.GetMyManager();

            if (manager != null)
            {
                result.Add(manager);
                var colleagues = await userGraphService.GetReports(manager.UserPrincipalName);
                result.AddRange(colleagues);
            }
            else
            {
                this.logger.LogInformation("Manager information is null.");
            }

            var reports = await userGraphService.GetMyReports();

            if (reports != null)
            {
                result.AddRange(reports);
            }
            else
            {
                this.logger.LogInformation("Reports are null.");
            }

            var userId = User.FindFirst("http://schemas.microsoft.com/identity/claims/objectidentifier")?.Value;
            return result.Where(u => u.Id != userId).ToList();
        }

        /// <summary>
        /// Gets a list of people as suggestions for the current user.
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [Route("people")]
        public async Task<List<Person>> GetMyPeople()
        {
            List<Person> people = await userGraphService.GetMyPeople();
            if (people == null)
            {
                this.logger.LogInformation("People information is null.");
                return new List<Person>();
            }
            string userPrincipalName = User.Claims.ToList().Find(claim => claim.Type == "preferred_username")?.Value;
            userPrincipalName ??= User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn")?.Value;
            userPrincipalName ??= string.Empty;

            Regex tenantRegex = new Regex(@"@(.+)");
            MatchCollection matches = tenantRegex.Matches(userPrincipalName);
            string tenant = (matches.Count > 0) ? matches[^1].Value : string.Empty;

            people.RemoveAll(p => string.IsNullOrEmpty(p.UserPrincipalName) || p.UserPrincipalName.Equals(userPrincipalName) ||
                                    (p.PersonType != null && !p.PersonType.Class.SameAs("Person")));
            return people.Where(p => p.UserPrincipalName.EndsWith(tenant)).ToList();
        }

        /// <summary>
        /// Current user's list of users.
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [Route("list")]
        public async Task<List<DirectoryObject>> GetMyList()
        {
            ConvergeSettings convergeSettings = await userGraphService.GetConvergeSettings();
            List<DirectoryObject> result = new List<DirectoryObject>();
            if (convergeSettings.MyList == null)
            {
                this.logger.LogInformation("Users list is null.");
                return result;
            }
            foreach (string upn in convergeSettings.MyList)
            {
                DirectoryObject user = await userGraphService.GetUser(upn);
                if (user != null)
                {
                    result.Add(user);
                }
            }
            return result;
        }

        /// <summary>
        /// Get Recommended Locations to collaborate for the current user.
        /// </summary>
        /// <param name="year"></param>
        /// <param name="month"></param>
        /// <param name="day"></param>
        /// <returns></returns>
        [HttpGet]
        [Route("recommendation")]
        public async Task<string> GetMyRecommendedLocation(int year, int month, int day)
        {
            Microsoft.Graph.Calendar calendar = await userGraphService.GetMyConvergeCalendar();
            if (calendar == null)
            {
                this.logger.LogInformation("user's calendar is null.");
                return "Remote";
            }

            Event prediction = await userGraphService.GetMyConvergePrediction(calendar.Id, year, month, day);
            return prediction?.Location?.DisplayName ?? "Remote";
        }

        /// <summary>
        /// Sets up a new converge user by adding or updating the
        /// converge settings, calendar and default location predictions
        /// </summary>
        /// <param name="convergeSettings">converge settings</param>
        /// <returns></returns>
        [HttpPost]
        [Route("setup")]
        public async Task SetupNewUser(ConvergeSettings convergeSettings)
        {
            ConvergeSettings settings = await userGraphService.GetConvergeSettings();
            if (settings == null)
            {
                await userGraphService.SaveConvergeSettings(convergeSettings, DataOperationType.IsAdd);
            }
            else
            {
                await userGraphService.SaveConvergeSettings(convergeSettings, DataOperationType.IsUpdate);
            }
            var calendar = await userGraphService.GetMyConvergeCalendar();
            if (calendar == null)
            {
                await userGraphService.CreateMyConvergeCalendar();
            }

            List<OutlookCategory> categories = await userGraphService.GetMyCalendarCategories();
            if (categories.Find(c => c.DisplayName == userGraphService.ConvergeDisplayName) == null)
            {
                await userGraphService.CreateMyCalendarCategory(new OutlookCategory
                {
                    DisplayName = userGraphService.ConvergeDisplayName,
                    Color = CategoryColor.Preset9,
                });
            }
                
            var userId = User.FindFirst("http://schemas.microsoft.com/identity/claims/objectidentifier")?.Value;
            WorkingHours workingHours = await userGraphService.GetMyWorkingHours();

            PredictionMetrics predictionMetrics = new PredictionMetrics();
            Dictionary<string, ExchangePlace> placesDictionary = new Dictionary<string, ExchangePlace>();
            // Perform prediction for the given user.
            await predictionService.PerformPrediction(userId, workingHours, placesDictionary, predictionMetrics);

            //If there is a failure only 1 Exception is expected. Log the failure, but do not throw to the user. They can continue to use Converge.
            if (predictionMetrics.ExceptionsList.Count > 0)
            {
                logger.LogError(predictionMetrics.ExceptionsList[0], $"Error while predicting future locations for request: {JsonConvert.SerializeObject(convergeSettings)}");
            }
        }
         
        /// <summary>
        /// Updates current user's predicted location.
        /// </summary>
        /// <param name="request"></param>
        /// <returns></returns>
        [HttpPut]
        [Route("updatePredictedLocation")]
        public async Task<ActionResult> UpdatePredictedLocationChosenByUser(UserPredictedLocationRequest request)
        {
            var userId = User.FindFirst("http://schemas.microsoft.com/identity/claims/objectidentifier")?.Value;
            var startDate = new DateTime(request.Year, request.Month, request.Day);

            bool isUpdated = await predictionService.UpdatePredictedLocationChosenByUser(startDate, userId, request.UserPredictedLocation);
            return isUpdated ? Ok() : StatusCode(500);
        }

        /// <summary>
        /// Gets converge calendar for the current user.
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [Route("convergeCalendar")]
        public async Task<Microsoft.Graph.Calendar> GetMyConvergeCalendar()
        {
            return await userGraphService.GetMyConvergeCalendar();
        }

        /// <summary>
        /// Current user's recent buildings.
        /// </summary>
        /// <returns>Building Basic Information of current user's recent buildings</returns>
        [HttpGet]
        [Route("recentBuildings")]
        public async Task<List<BuildingBasicInfo>> GetRecentBuildings()
        {
            ConvergeSettings convergeSettings = await userGraphService.GetConvergeSettings();
            if (convergeSettings == null)
            {
                logger.LogInformation($"Converge settings is unavailable for the user '{User.Identity.Name}'.");
                return new List<BuildingBasicInfo>();
            }
            if (convergeSettings.RecentBuildingUpns == null)
            {
                logger.LogInformation($"There are no saved recent buildings for the user '{User.Identity.Name}'.");
                return new List<BuildingBasicInfo>();
            }

            var recentBuildingUpns = convergeSettings.RecentBuildingUpns.Distinct().ToList();
            List<BuildingBasicInfo> buildingsBasicInfoList = await buildingsService.GetBuildingsBasicInfo(recentBuildingUpns);
            if (buildingsBasicInfoList.Count != recentBuildingUpns.Count)
            {
                var missingBuildings = recentBuildingUpns.Except(buildingsBasicInfoList.Select(x => x.Identity));
                logger.LogInformation($"Unable to find Buildings by UPNs: {string.Join(", ", missingBuildings)}.");
            }
            else
            {
                logger.LogInformation($"Successfully found {buildingsBasicInfoList.Count} out of {recentBuildingUpns.Count} recent buildings.");
            }

            return buildingsBasicInfoList;
        }

        /// <summary>
        /// Gets the detailed list of Current user's favorite campuses to collaborate
        /// </summary>
        /// <returns>Favorite campuses as a collection of Exchange Places</returns>
        [HttpGet]
        [Route("favoriteCampusesDetails")]
        public async Task<List<ExchangePlace>> GetFavoriteCampuses()
        {
            ConvergeSettings convergeSettings = await userGraphService.GetConvergeSettings();
            if(convergeSettings == null)
            {
                logger.LogInformation($"Converge settings is unavailable for the user '{User.Identity.Name}'.");
                return new List<ExchangePlace>();
            }
            if (convergeSettings.FavoriteCampusesToCollaborate == null || convergeSettings.FavoriteCampusesToCollaborate.Count == 0)
            {
                logger.LogInformation($"There are no favorite campuses for the user '{User.Identity.Name}'.");
                return new List<ExchangePlace>();
            }

            var favoritePlacesUpns = convergeSettings.FavoriteCampusesToCollaborate.Distinct().ToList();
            var placesResponse = await placesService.GetPlacesByPlaceUpns(favoritePlacesUpns);
            if (placesResponse.ExchangePlacesList.Count != favoritePlacesUpns.Count)
            {
                var missingBuildings = favoritePlacesUpns.Except(placesResponse.ExchangePlacesList.Select(x => x.Identity));
                logger.LogInformation($"Unable to find favorite campuses by UPNs: {string.Join(", ", missingBuildings)}.");
            }
            else
            {
                logger.LogInformation($"Successfully found {placesResponse.ExchangePlacesList.Count} out of {favoritePlacesUpns.Count} favorite campuses.");
            }

            return placesResponse.ExchangePlacesList;
        }
    }
}
