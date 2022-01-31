// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Converge.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Microsoft.Identity.Web;
using System;
using System.Threading.Tasks;

namespace Converge.Middleware
{
    // You may need to install the Microsoft.AspNetCore.Http.Abstractions package into your project
    public class UserConsentErrorMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IOptions<MicrosoftGraphOptions> _graphOptions;

        public UserConsentErrorMiddleware(RequestDelegate next, IOptions<MicrosoftGraphOptions> graphOptions)
        {
            _next = next;
            _graphOptions = graphOptions;
        }

        public async Task InvokeAsync(HttpContext httpContext, ITokenAcquisition tokenAcquisition)
        {
            try
            {
                await _next(httpContext);
            }
            catch (Exception ex)
            {
                if (ex is MicrosoftIdentityWebChallengeUserException || ex.InnerException is MicrosoftIdentityWebChallengeUserException)
                {
                    var accessException = ex as MicrosoftIdentityWebChallengeUserException;
                    accessException ??= ex.InnerException as MicrosoftIdentityWebChallengeUserException;
                    tokenAcquisition.ReplyForbiddenWithWwwAuthenticateHeader(Constant.ScopesToAccessGraphApi, accessException.MsalUiRequiredException);
                    return;
                }
                else
                {
                    throw;
                }
            }
        }
    }
}
