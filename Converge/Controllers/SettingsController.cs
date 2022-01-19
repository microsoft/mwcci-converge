// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Converge.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;

namespace Converge.Controllers
{
    [Route("api/settings")]
    [ApiController]
    public class SettingsController : Controller
    {
        private readonly ILogger<SettingsController> logger;
        private readonly IConfiguration configuration;

        public SettingsController(ILogger<SettingsController> logger, IConfiguration configuration)
        {
            this.logger = logger ?? throw new ArgumentNullException(nameof(logger));
            this.configuration = configuration;
        }

        /// <summary>
        /// Gets the Application Settings
        /// </summary>
        /// <returns></returns>
        [HttpGet("appSettings")]
        public ActionResult<AppSettings> GetAppSettings()
        {
            try
            {
                var result = new AppSettings
                {
                    ClientId = this.configuration["AzureAd:ClientId"],
                    InstrumentationKey = this.configuration["AppInsightsInstrumentationKey"],
                    BingAPIKey = this.configuration["BingMapsAPIKey"],
                    AppBanner = this.configuration["AppBannerMessage"]
                };
                return Ok(result);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, $"Error occurred while getting App-settings by the user '{User.Identity.Name}'.");
                throw;
            }
        }
    }
}
