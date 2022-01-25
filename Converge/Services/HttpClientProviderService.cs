// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Converge.Models;
using Microsoft.Identity.Web;
using System;
using System.Net.Http;
using System.Net.Http.Headers;

namespace Converge.Services
{
    public interface IHttpClientProviderService
    {
        HttpClient Set(string authnToken, TimeSpan? timeSpan = null, string mediaType = null);
        HttpClient GetObject();
    }

    public class HttpClientProviderService : IHttpClientProviderService
    {
        private readonly HttpClient httpClient;
        private bool isAllSet = false;

        public HttpClientProviderService(IHttpClientFactory clientFactory)
        {
            httpClient = clientFactory.CreateClient();
        }

        private void SetToken(string authnToken)
        {
            httpClient.DefaultRequestHeaders.Add("Authorization", string.Format("Bearer {0}", authnToken));
        }

        /// <summary>
        /// Set the default values, unless appropriate values are passed.
        /// </summary>
        private void SetAttributes(TimeSpan? timeSpan = null, string mediaType = null)
        {
            httpClient.Timeout = timeSpan?? TimeSpan.FromMilliseconds(-1);
            httpClient.DefaultRequestHeaders.Accept.Clear();
            httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue(mediaType?? "application/json"));
        }

        /// <summary>
        /// This method will set HttpClient object's properties
        /// </summary>
        /// <param name="authnToken"></param>
        /// <param name="timeSpan"></param>
        /// <param name="mediaType"></param>
        /// <returns></returns>
        public HttpClient Set(string authnToken, TimeSpan? timeSpan = null, string mediaType = null)
        {
            if(isAllSet)
            {
                return GetObject();
            }

            this.SetToken(authnToken);
            this.SetAttributes(timeSpan, mediaType);
            isAllSet = true;

            return httpClient;
        }

        /// <summary>
        /// This method should be consumed only after Set() is consumed atleast once.. Meant for multiple service calls if the need be.
        /// </summary>
        /// <returns></returns>
        public HttpClient GetObject()
        {
            return httpClient;
        }
    }

}
