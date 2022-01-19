// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Converge.Controllers
{
    [AllowAnonymous]
    public class HealthCheckController : Controller
    {
        /// <summary>
        /// API method to check connectivity
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [Route("api/healthcheck")]
        public ActionResult GetHealthcheck()
        {
            return Ok();
        }

        /// <summary>
        /// API method to check connectivity
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [Route("")]
        public ActionResult GetHome()
        {
            return Ok();
        }
    }
}
