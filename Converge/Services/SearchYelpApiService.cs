// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Converge.DataTransformers;
using Converge.Models;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace Converge.Services
{
    public class SearchYelpApiService
    {
        private readonly IConfiguration configuration;
        private readonly TelemetryService telemetryService;
        private readonly IHttpClientProviderService httpClientProviderService;
        private readonly SearchBingMapsService searchBingMapsService;

        public SearchYelpApiService(
                    IConfiguration paramConfiguration,
                    TelemetryService paramTelemetryService,
                    SearchBingMapsService paramSearchBingMapsService,
                    IHttpClientProviderService paramHttpClientProviderService)
        {
            configuration = paramConfiguration;
            telemetryService = paramTelemetryService;
            searchBingMapsService = paramSearchBingMapsService;
            httpClientProviderService = paramHttpClientProviderService;
        }

        internal string YelpAPIKey
        {
            get
            {
                //Need to monitor if the below line works forever.
                return this.configuration.GetValue<string>("YelpAPIKey");
            }
        }

        public async Task<List<VenuesToCollaborate>> GetBusinesses(GPSCoordinates centralGeoCoordinates, string categoryType, string keywords, int? skip = 0, int? limit = 30)
        {
            var categories = string.IsNullOrWhiteSpace(categoryType) ? string.Empty : "&categories=" + categoryType;
            var term = string.IsNullOrWhiteSpace(keywords) ? string.Empty : "&term=" + keywords;

            //Do Yelp-search at the Central point for all members.
            string uri = new StringBuilder().AppendFormat(@"https://api.yelp.com/v3/businesses/search?latitude={0}&longitude={1}{2}{3}&limit={4}&offset={5}",
                                                            centralGeoCoordinates.Latitude, centralGeoCoordinates.Longitude, categories, term, limit, skip).ToString();

            string errorMessage = "Failure getting Venues with Yelp service!";
            HttpResponseMessage response = await httpClientProviderService.Set(YelpAPIKey).GetAsync(uri);
            if (!response.IsSuccessStatusCode)
            {
                Exception exception = new Exception(errorMessage);
                //Log or return exception
                telemetryService.TrackException(exception, "Failed URI: ", uri);
                throw exception;
            }

            string yelpApiSearchContent = await response.Content.ReadAsStringAsync();
            try
            {
                return await YelpApiBusinessesSearchTransformer.Transform(searchBingMapsService, yelpApiSearchContent);
            }
            catch (Exception innerException)
            {
                Exception exception = new Exception(errorMessage, innerException);
                //Log or return exception
                telemetryService.TrackException(exception, "Failure with Response: ", uri);
                throw exception;
            }
        }

        public async Task<VenueDetails> GetBusinessDetails(string businessId)
        {
            string uri = new StringBuilder().AppendFormat(@"https://api.yelp.com/v3/businesses/{0}",businessId).ToString();

            string errorMessage = "Failure getting Venue specific details with Yelp service!";
            HttpResponseMessage response = await httpClientProviderService.Set(YelpAPIKey).GetAsync(uri);
            if (!response.IsSuccessStatusCode)
            {
                Exception exception = new Exception(errorMessage);
                //Log or return exception
                telemetryService.TrackException(exception, "Failed URI: ", uri);
                throw exception;
            }

            string yelpApiSearchContent = await response.Content.ReadAsStringAsync();
            try
            {
                return YelpApiBusinessTransformer.Transform(yelpApiSearchContent);
            }
            catch (Exception innerException)
            {
                Exception exception = new Exception(errorMessage, innerException);
                //Log or return exception
                telemetryService.TrackException(exception, "Failure with Response: ", uri);
                throw exception;
            }
        }

        public async Task<ServiceJsonResponse> GetBusinessReviews(string businessId)
        {
            string uri = new StringBuilder().AppendFormat(@"https://api.yelp.com/v3/businesses/{0}/reviews", businessId).ToString();

            HttpResponseMessage response = await httpClientProviderService.Set(YelpAPIKey).GetAsync(uri);
            if (!response.IsSuccessStatusCode)
            {
                //Log or return exception
                Exception exception = new Exception("Failure getting Venue reviews with Yelp service!");
                telemetryService.TrackException(exception, "Failed URI: ", uri);
                throw exception;
            }

            string yelpApiSearchContent = await response.Content.ReadAsStringAsync();
            return new ServiceJsonResponse()
            {
                Response = JsonConvert.DeserializeObject<dynamic>(yelpApiSearchContent)
            };
        }
    }
}