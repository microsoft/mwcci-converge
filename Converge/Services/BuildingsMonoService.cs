// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Converge.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Converge.Services
{
    /// <summary>
    /// This class is meant to "Mirror" functionality of BuildingsService for Singleton classes support.
    /// </summary>
    public class BuildingsMonoService
    {
        private readonly AppGraphService appGraphService;
        private readonly PlacesService placesService;
        private readonly BuildingsService buildingsService;

        /// <summary>
        /// The empty constructor for testing purposes.
        /// </summary>
        public BuildingsMonoService() { }

        public BuildingsMonoService(IConfiguration configuration,
                                    ILogger<PlacesService> placesSvcLogger,
                                    AppGraphService appGraphSvc, 
                                    CachePlacesProviderService cacheProviderService,
                                    CacheSharePointContentService cacheSharePointContentService, 
                                    CachePlacesProviderService cachePlacesProviderService)
        {
            appGraphService = appGraphSvc;

            //Had to manually instantiate for addressing Singleton-classes-instantiation-issues during Dependency-injection.
            placesService = new PlacesService(placesSvcLogger, configuration, appGraphService, new ScheduleService(appGraphService), cacheSharePointContentService, cachePlacesProviderService);
            buildingsService = new BuildingsService(appGraphService, cacheProviderService, placesService, null);
        }

        public virtual async Task<GraphExchangePlacesResponse> GetPlacesOfBuilding(string buildingUpn, PlaceType? placeType = null, int? topCount = null, string skipTokenString = null)
        {
            return await buildingsService.GetPlacesOfBuilding(buildingUpn, placeType, topCount, skipTokenString);
        }

        public virtual async Task<GraphExchangePlacesResponse> GetPlacesByUpnsList(List<string> placesUpnList, PlaceType? placeType = null, int? topCount = null, string skipTokenString = null)
        {
            return await buildingsService.GetPlacesByUpnsList(placesUpnList, placeType, topCount, skipTokenString);
        }
    }
}
