// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Converge.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

namespace Converge.Controllers
{
    [Authorize]
    [Route("api/v1.0/settings")]
    [ApiController]
    public class SettingsV1Controller : Controller
    {
        private readonly IConfiguration configuration;

        public SettingsV1Controller(IConfiguration configuration)
        {
            this.configuration = configuration;
        }

        /// <summary>
        /// Gets the Application Settings
        /// </summary>
        /// <returns></returns>
        [HttpGet("appSettings")]
        public ActionResult<AppSettings> GetAppSettings()
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
    }
}
