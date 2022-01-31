// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Microsoft.AspNetCore.Builder;

namespace Converge.Middleware
{
    // Extension method used to add the middleware to the HTTP request pipeline.
    public static class MiddlewareExtension
    {
        public static IApplicationBuilder UseMiddlewareExtensions(this IApplicationBuilder builder)
        {
            //Add all Middleware extension classes here.
            builder.UseMiddleware<UserConsentErrorMiddleware>();

            return builder;
        }
    }
}
