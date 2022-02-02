// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Converge.DataTransformers;
using Converge.Models;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Linq;
using Converge.Helpers;

namespace Converge.Services
{
    public class SearchBingMapsService
    {
        private readonly IConfiguration configuration;
        private readonly IHttpClientProviderService httpClientProviderService;
        private readonly TelemetryService telemetryService;

        /// <summary>
        /// Constructor left empty for testing purposes.
        /// </summary>
        public SearchBingMapsService() { }

        public SearchBingMapsService(
                    IConfiguration paramConfiguration,
                    TelemetryService paramTelemetryService,
                    IHttpClientProviderService paramHttpClientProviderService)
        {
            configuration = paramConfiguration;
            telemetryService = paramTelemetryService;

            httpClientProviderService = paramHttpClientProviderService;
        }

        internal string BingMapsAPIKey
        {
            get
            {
                //Need to monitor if the below line works forever.
                return this.configuration.GetValue<string>("BingMapsAPIKey");
            }
        }

        public async Task<GPSCoordinates> GetGeoCoordsForZipcode(string zipcode)
        {
            string uri = new StringBuilder($@"http://dev.virtualearth.net/REST/v1/Locations?").Append($"key={BingMapsAPIKey}")
                                            .Append($"&postalCode={zipcode}")
                                            .Append($"&countryRegion={Constant.CountryCodeUS}")
                                            .ToString();

            string errorMessage = "Failure to get Geo-coordinates for a Zipcode!";
            HttpResponseMessage response = await httpClientProviderService.GetObject().GetAsync(uri);
            if (!response.IsSuccessStatusCode)
            {
                ApplicationException appException = new ApplicationException(errorMessage);
                //Log or return exception
                telemetryService.TrackException(appException, "Failed URI: ", uri);
                throw appException;
            }

            var bingMapsSearchContent = await response.Content.ReadAsStringAsync();
            JObject json = JObject.Parse(bingMapsSearchContent);
            var recList = json.SelectTokens("$..matchCodes").ToList();
            string matchCode = (recList != null && recList.Count > 0)? recList.First().ToString() : string.Empty;
            if (!matchCode.Comprises("Good"))
            {
                errorMessage = "Invalid ZipCode: ";
                ApplicationException appException = new ApplicationException(errorMessage + $"{zipcode}");
                //Log or return exception
                telemetryService.TrackException(appException, errorMessage, zipcode);
                throw appException;
            }

            try
            {
                return BingMapsLocationByAddressTransformer.GetGeoCoordinates(bingMapsSearchContent);
            }
            catch (Exception innerException)
            {
                ApplicationException appException = new ApplicationException(errorMessage, innerException);
                //Log or return exception
                telemetryService.TrackException(appException, "Failure with Response: ", uri);
                throw appException;
            }
        }

        public async Task<GPSCoordinates> GetGeoCoordsForAnAddress(string street, string city, string state, string postalCode, string countryCode = null)
        {
            var uriBuilder = new StringBuilder($@"http://dev.virtualearth.net/REST/v1/Locations?").Append($"key={BingMapsAPIKey}");
            if (!string.IsNullOrWhiteSpace(street))
            {
                uriBuilder.Append($"&addressLine={street}");
            }
            if (!string.IsNullOrWhiteSpace(city))
            {
                uriBuilder.Append($"&locality={city}");
            }
            if (!string.IsNullOrWhiteSpace(state))
            {
                uriBuilder.Append($"&adminDistrict={state}");
            }
            if (!string.IsNullOrWhiteSpace(postalCode))
            {
                uriBuilder.Append($"&postalCode={postalCode}");
            }
            uriBuilder.Append($"&countryRegion={countryCode ?? Constant.CountryCodeUS}");

            var uri = uriBuilder.ToString();
            string errorMessage = "Failure to get Geo-coordinates for an Address!";
            HttpResponseMessage response = await httpClientProviderService.GetObject().GetAsync(uri);
            if (!response.IsSuccessStatusCode)
            {
                ApplicationException appException = new ApplicationException(errorMessage);
                //Log or return exception
                telemetryService.TrackException(appException, "Failed URI: ", uri);
                throw appException;
            }

            var bingMapsSearchContent = await response.Content.ReadAsStringAsync();
            try
            {
                return BingMapsLocationByAddressTransformer.GetGeoCoordinates(bingMapsSearchContent);
            }
            catch (Exception innerException)
            {
                ApplicationException appException = new ApplicationException(errorMessage, innerException);
                //Log or return exception
                telemetryService.TrackException(appException, "Failure with Response: ", uri);
                throw appException;
            }
        }

        public async Task<List<BingMapsDistanceMatrix>> GetDistanceMatrix(string[] sourceCoordinatesList, string[] destinationCoordinatesList)
        {
            string sources = string.Join(";", sourceCoordinatesList);
            string destinations = string.Join(";", destinationCoordinatesList);

            string uri = new StringBuilder().AppendFormat(@"https://dev.virtualearth.net/REST/v1/Routes/DistanceMatrix?origins={0}&destinations={1}&distanceUnit=mi&travelMode=driving&key={2}",
                                                            sources, destinations, BingMapsAPIKey).ToString();

            string errorMessage = "Failure to get Distance between the sources and destinations!";
            HttpResponseMessage response = await httpClientProviderService.GetObject().GetAsync(uri);
            if (!response.IsSuccessStatusCode)
            {
                Exception exception = new Exception(errorMessage);
                //Log or return exception
                telemetryService.TrackException(exception, "Failed URI: ", uri);
                throw exception;
            }

            string bingMapsSearchContent = await response.Content.ReadAsStringAsync();
            try
            {
                return BingMapsDistanceMatrixTransformer.Transform(bingMapsSearchContent);
            }
            catch (Exception innerException)
            {
                Exception exception = new Exception(errorMessage, innerException);
                //Log or return exception
                telemetryService.TrackException(exception, "Failure with Response: ", uri);
                throw exception;
            }
        }
    }
}
