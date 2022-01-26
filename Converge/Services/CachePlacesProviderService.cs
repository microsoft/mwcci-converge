// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Converge.Helpers;
using Converge.Models;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Graph;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Converge.Services
{
    public class CachePlacesProviderService
    {
        private readonly IMemoryCache buildingsPlacesCache;
        private readonly IConfiguration configuration;
        private readonly MemoryCacheEntryOptions memoryCacheEntryOptions;
        private readonly ILogger<CachePlacesProviderService> logger;

        private const string keyBuildings = "Buildings";
        private const string keyPlaces = "Places";
        private const string keyBuildingsUpnInfo = "BuildingsUpnInfo";
        private const string keyPlacesUpnInfo = "PlacesUpnInfo";
        private const string keySkipTokens = "SkipTokens";

        /// <summary>
        /// Left empty for testing purposes.
        /// </summary>
        public CachePlacesProviderService() { }

        public CachePlacesProviderService(IConfiguration paramConfiguration,
                                            ILogger<CachePlacesProviderService> paramLogger,
                                            IMemoryCache paramBuildingsPlacesCache)
        {
            configuration = paramConfiguration;
            logger = paramLogger;
            buildingsPlacesCache = paramBuildingsPlacesCache;

            if (CacheConfigEnabled)
            {
                // Here the idea is to cache the data until the end of day (11.59 PM) for PST, regardless of
                // when this part of code gets executed during the day. Note: This is a Singleton class.
                // Secondly, this way, we get cache refreshed everyday after the place-sync-job runs.

                var timeZoneInfo = TimeZoneInfo.FindSystemTimeZoneById(Constant.TimeZonePST);
                var startDateTime = TimeZoneInfo.ConvertTime(DateTime.Now, timeZoneInfo);
                var endDateTime = startDateTime.Initialize(new TimeOfDay(23, 59, 59));

                memoryCacheEntryOptions = new MemoryCacheEntryOptions()
                                                .SetPriority(CacheItemPriority.Normal)
                                                .SetAbsoluteExpiration(endDateTime.Subtract(startDateTime));
            }
        }

        private bool CacheConfigEnabled => configuration != null ? bool.Parse(configuration["CachingEnabled:BuildingsService"] ?? "false") : false;

        private void AddBuildingUpnInfoToCache(List<BuildingBasicInfo> buildingsList, string cacheKey)
        {
            var key = keyBuildingsUpnInfo;
            buildingsPlacesCache.TryGetValue(key, out List<CachedDataUpnInfo> buildingsUpnInfoList);
            buildingsUpnInfoList ??= new List<CachedDataUpnInfo>();

            CachedDataUpnInfo.AddUpnsListInfoToCache(buildingsList.Select(y => y.Identity).ToList(),
                                                        buildingsUpnInfoList,
                                                        cacheKey);

            if (buildingsUpnInfoList.Count > 0)
            {
                buildingsPlacesCache.Set(key, buildingsUpnInfoList, memoryCacheEntryOptions);
            }
        }

        private void AddPlaceUpnInfoToCache(List<ExchangePlace> exchangePlacesList, string cacheKey)
        {
            var key = keyPlacesUpnInfo;
            buildingsPlacesCache.TryGetValue(key, out List<CachedDataUpnInfo> placesUpnInfoList);
            placesUpnInfoList ??= new List<CachedDataUpnInfo>();
            CachedDataUpnInfo.AddUpnsListInfoToCache(exchangePlacesList.Select(y => y.Identity).ToList(), 
                                                        placesUpnInfoList, 
                                                        cacheKey);
            if (placesUpnInfoList.Count > 0)
            {
                buildingsPlacesCache.Set(key, placesUpnInfoList, memoryCacheEntryOptions);
            }
        }

        private void AddSkipTokenToCache(string skipTokenString, string cacheKey)
        {
            var key = keySkipTokens;

            //Get SkipTokens-list from the Cache
            buildingsPlacesCache.TryGetValue(key, out List<CachedDataSkipToken> skipTokensList);
            skipTokensList ??= new List<CachedDataSkipToken>();
            if (skipTokensList.Any(x => cacheKey.SameAs(x.CachedPageKey)))
            {
                return;
            }

            //Add to the list.
            skipTokensList.Add(new CachedDataSkipToken(cacheKey, skipTokenString));

            buildingsPlacesCache.Set(key, skipTokensList, memoryCacheEntryOptions);
        }

        private List<BuildingBasicInfo> SortBuildingsAsCached(List<CachedDataUpnInfo> buildingsUpnInfoList, List<BuildingBasicInfo> buildingsList, string cacheKey)
        {
            var cachedBuildings = buildingsUpnInfoList.Where(x => x.DataOrderList.Select(y => y.CachedPageKey).Contains(cacheKey))
                                                        .Select(z => new { z.DataUpn, z.DataOrderList[0].DataOrderRank })
                                                        .ToList();
            var orderedBuildings = from cb in cachedBuildings
                                   join bl in buildingsList
                                       on cb.DataUpn equals bl.Identity
                                   orderby cb.DataOrderRank
                                   select bl;

            return orderedBuildings.ToList();
        }

        private List<ExchangePlace> SortPlacesAsCached(List<CachedDataUpnInfo> placesUpnInfoList, List<ExchangePlace> exchangePlacesList, string cacheKey)
        {
            var placesOrder = placesUpnInfoList.Where(x => x.DataOrderList.Select(y => y.CachedPageKey).Contains(cacheKey))
                                                .Select(z => new { z.DataUpn, z.DataOrderList[0].DataOrderRank });
            var orderedPlaces = from po in placesOrder
                                 join ep in exchangePlacesList
                                    on po.DataUpn equals ep.Identity
                                 orderby po.DataOrderRank
                                 select ep;

            return orderedPlaces.ToList();
        }

        private string BuildPartCacheKey(int? topCount = null, string skipTokenString = null)
        {
            StringBuilder partCacheKey = new StringBuilder($"&topCount={topCount ?? 100}&skipToken={skipTokenString ?? "0"}");
            return partCacheKey.ToString();
        }

        private string BuildPartCacheKey(string upnOrKey, PlaceType? placeType = null)
        {
            StringBuilder partCacheKey = new StringBuilder($"{upnOrKey}");
            if (placeType.HasValue)
            {
                string placeTypeString = Enum.GetName(typeof(PlaceType), placeType.Value);
                partCacheKey.Append($"&placeType={placeTypeString}");
            }

            return partCacheKey.ToString();
        }

        public BasicBuildingsResponse GetBuildings(int? topCount = 10, int? skip = 0)
        {
            BasicBuildingsResponse buildingsResponse = null;
            if (!CacheConfigEnabled)
            {
                return buildingsResponse;
            }

            try
            {
                string cacheKey = new StringBuilder(BuildPartCacheKey(keyBuildings)
                                                    + BuildPartCacheKey(topCount, skip.ToString())).ToString();
                //Get Buildings-Upns-List from the Cache
                buildingsPlacesCache.TryGetValue(keyBuildingsUpnInfo, out List<CachedDataUpnInfo> buildingsUpnInfoList);
                //Get Buildings-list from the Cache
                buildingsPlacesCache.TryGetValue(keyBuildings, out List<BuildingBasicInfo> cachedBuildingsList);

                if (buildingsUpnInfoList == null || CachedDataUpnInfo.GetUpnsListInfoForCacheKey(buildingsUpnInfoList, cacheKey).Count == 0
                    || cachedBuildingsList == null || cachedBuildingsList.Count == 0)
                {
                    return null;
                }

                var buildingsList = new List<BuildingBasicInfo>(cachedBuildingsList.Select(b => new BuildingBasicInfo(b.Identity, b.DisplayName)));
                buildingsList = SortBuildingsAsCached(buildingsUpnInfoList, buildingsList, cacheKey);

                return new BasicBuildingsResponse(buildingsList);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error occurred with GetBuildings cache-logic.");
                return null;
            }
        }

        public BuildingBasicInfo GetBuildingFromCache(string buildingUpn)
        {
            buildingsPlacesCache.TryGetValue(keyBuildings, out List<BuildingBasicInfo> cachedBuildingsList);
            var building = cachedBuildingsList.FirstOrDefault(b => b.Identity.Equals(buildingUpn));
            if (building == null)
            {
                return null;
            }
            return new BuildingBasicInfo(building.Identity, building.DisplayName);
        }

        public void AddBuildings(BasicBuildingsResponse buildingsResponse, int? topCount = null, int? skip = null)
        {
            if (!CacheConfigEnabled)
            {
                return;
            }

            try
            {
                string cacheKey = new StringBuilder(BuildPartCacheKey(keyBuildings)
                                                + BuildPartCacheKey(topCount, skip.ToString())).ToString();

                //Get Buildings-list from the Cache
                buildingsPlacesCache.TryGetValue(keyBuildings, out List<BuildingBasicInfo> buildingsList);
                buildingsList ??= new List<BuildingBasicInfo>();
                buildingsList.AddRange(buildingsResponse.BuildingsList.Where(x => !x.Identity.OneAmong(buildingsList.Select(y => y.Identity)))
                                                                        .Select(b => new BuildingBasicInfo(b.Identity, b.DisplayName)));

                buildingsPlacesCache.Set(keyBuildings, buildingsList, memoryCacheEntryOptions);
                //Add Buildings-Places-Upn-list from the Cache
                AddBuildingUpnInfoToCache(buildingsList, cacheKey);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error occurred with AddBuildings cache-logic.");
                return;
            }
        }

        public GraphExchangePlacesResponse GetPlacesOfBuilding(string buildingUpn, 
                                                                PlaceType? placeType = null, 
                                                                int? topCount = null, 
                                                                string skipTokenString = null, 
                                                                ListItemFilterOptions listItemFilterOptions = null)
        {
            GraphExchangePlacesResponse exchangePlacesResponse = null;
            if (!CacheConfigEnabled)
            {
                return exchangePlacesResponse;
            }

            try
            {
                string cacheKey = new StringBuilder(BuildPartCacheKey(keyBuildings, placeType: placeType)
                                                    + BuildPartCacheKey(topCount, skipTokenString)).ToString();
                //Get Places-Upns-List from the Cache
                buildingsPlacesCache.TryGetValue(keyPlacesUpnInfo, out List<CachedDataUpnInfo> placesUpnInfoList);
                //Get Places-list from the Cache
                buildingsPlacesCache.TryGetValue(keyPlaces, out List<ExchangePlace> exchangePlacesList);
                if (exchangePlacesList == null || exchangePlacesList.Count == 0
                    || placesUpnInfoList == null || placesUpnInfoList.Count == 0)
                {
                    return null;
                }

                exchangePlacesList = exchangePlacesList.Where(x => x.Locality.SameAs(buildingUpn)).ToList();

                placesUpnInfoList = CachedDataUpnInfo.GetUpnsListMatchFromCache(exchangePlacesList.Select(y => y.Identity).ToList(),
                                                                                placesUpnInfoList,
                                                                                cacheKey);
                if (placesUpnInfoList.Count != exchangePlacesList.Count)
                {
                    return null;
                }

                exchangePlacesList = SortPlacesAsCached(placesUpnInfoList, exchangePlacesList, cacheKey);

                //Get Skip-Token-Upns-List from the Cache
                buildingsPlacesCache.TryGetValue(keySkipTokens, out List<CachedDataSkipToken> skipTokensList);
                //Get Skip-token from the Cache.
                var skipTokenData = skipTokensList?.FirstOrDefault(x => x.CachedPageKey.SameAs(cacheKey));
                var skipToken = skipTokenData?.SkipToken;

                exchangePlacesResponse = new GraphExchangePlacesResponse(exchangePlacesList, skipToken);
                return exchangePlacesResponse;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error occurred with GetPlacesOfBuilding cache-logic.");
                return null;
            }
        }

        public void AddPlacesOfBuilding(List<ExchangePlace> exchangePlacesList, PlaceType? placeType = null, int? topCount = null, string skipTokenString = null)
        {
            if (!CacheConfigEnabled)
            {
                return;
            }

            try
            {
                string cacheKey = new StringBuilder(BuildPartCacheKey(keyPlaces, placeType: placeType)
                                                    + BuildPartCacheKey(topCount, skipTokenString)).ToString();

                //Get Places-list from the Cache
                buildingsPlacesCache.TryGetValue(keyPlaces, out List<ExchangePlace> cachedExchangePlacesList);
                cachedExchangePlacesList ??= new List<ExchangePlace>();
                cachedExchangePlacesList.AddRange(exchangePlacesList.Where(x => !x.Identity.OneAmong(cachedExchangePlacesList.Select(y => y.Identity))));

                buildingsPlacesCache.Set(keyPlaces, cachedExchangePlacesList, memoryCacheEntryOptions);

                AddPlaceUpnInfoToCache(exchangePlacesList, cacheKey);

                //Add Skip-token to the Cache.
                AddSkipTokenToCache(skipTokenString, cacheKey);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error occurred with AddPlacesOfBuilding cache-logic.");
                return;
            }
        }

        public ExchangePlace GetPlaceByUpn(string placeUpn, PlaceType? placeType = null)
        {
            ExchangePlace exchangePlace = null;
            if (!CacheConfigEnabled)
            {
                return exchangePlace;
            }

            try
            {
                string cacheKey = BuildPartCacheKey(placeUpn, placeType: placeType);

                //Get Places-Upns-List from the Cache
                buildingsPlacesCache.TryGetValue(keyPlacesUpnInfo, out List<CachedDataUpnInfo> placesUpnInfoList);
                //Get Places-list from the Cache
                buildingsPlacesCache.TryGetValue(keyPlaces, out List<ExchangePlace> exchangePlacesList);
                if (placesUpnInfoList == null || placesUpnInfoList.Count == 0
                        || exchangePlacesList == null || exchangePlacesList.Count == 0)
                {
                    return null;
                }
                var cachedPlaceUpnInfo = CachedDataUpnInfo.GetUpnMatchFromCache(placeUpn, placesUpnInfoList);
                exchangePlace = exchangePlacesList.FirstOrDefault(x => x.Identity.SameAs(placeUpn));
                if (cachedPlaceUpnInfo == null || exchangePlace == null
                    || (placeType.HasValue && placeType.Value != exchangePlace.Type))
                {
                    return null;
                }

                return exchangePlace;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error occurred with GetPlaceByUpn cache-logic.");
                return null;
            }
        }

        public void AddPlaceByUpn(ExchangePlace exchangePlace, PlaceType? placeType = null)
        {
            if (!CacheConfigEnabled)
            {
                return;
            }

            try
            {
                string cacheKey = BuildPartCacheKey(exchangePlace.Identity, placeType: placeType);

                //Get Places-list from the Cache
                buildingsPlacesCache.TryGetValue(keyPlaces, out List<ExchangePlace> exchangePlacesList);
                exchangePlacesList ??= new List<ExchangePlace>();
                exchangePlacesList.Add(exchangePlace);
                buildingsPlacesCache.Set(keyPlaces, exchangePlacesList, memoryCacheEntryOptions);

                AddPlaceUpnInfoToCache(exchangePlacesList, cacheKey);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error occurred with AddPlaceByUpn cache-logic.");
                return;
            }
        }

        public GraphExchangePlacesResponse GetPlacesByUpnsList(List<string> placesUpnList, PlaceType? placeType = null, int? topCount = null, string skipTokenString = null)
        {
            GraphExchangePlacesResponse exchangePlacesResponse = null;
            if (!CacheConfigEnabled)
            {
                return exchangePlacesResponse;
            }

            try
            {
                string cacheKey = new StringBuilder(BuildPartCacheKey(keyPlaces, placeType: placeType)
                                                    + BuildPartCacheKey(topCount, skipTokenString)).ToString();

                //Get Places-Upns-List from the Cache
                buildingsPlacesCache.TryGetValue(keyPlacesUpnInfo, out List<CachedDataUpnInfo> placesUpnInfoList);
                //Get Places-list from the Cache
                buildingsPlacesCache.TryGetValue(keyPlaces, out List<ExchangePlace> exchangePlacesList);
                if (placesUpnInfoList == null || placesUpnInfoList.Count == 0
                    || exchangePlacesList == null || exchangePlacesList.Count == 0
                    || placesUpnList.Any(x => !x.OneAmong(placesUpnInfoList.Select(y => y.DataUpn)))
                    || placesUpnList.Any(x => !x.OneAmong(exchangePlacesList.Select(y => y.Identity)))
                    || (placeType.HasValue && !exchangePlacesList.Exists(x => x.Type == placeType.Value)))
                {
                    return null;
                }

                exchangePlacesList = SortPlacesAsCached(placesUpnInfoList, exchangePlacesList, cacheKey);

                //Get Skip-Token-Upns-List from the Cache
                buildingsPlacesCache.TryGetValue(keySkipTokens, out List<CachedDataSkipToken> skipTokensList);
                //Get Skip-token from the Cache.
                var skipTokenData = skipTokensList?.FirstOrDefault(x => x.CachedPageKey.SameAs(cacheKey));
                var skipToken = skipTokenData?.SkipToken;

                return new GraphExchangePlacesResponse(exchangePlacesList, skipToken);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error occurred with GetPlacesByUpnsList cache-logic.");
                return null;
            }
        }

        public void AddPlacesByUpnsList(GraphExchangePlacesResponse exchangePlacesResponse, PlaceType? placeType = null, int? topCount = null, string skipTokenString = null)
        {
            if (!CacheConfigEnabled)
            {
                return;
            }

            try
            {
                string cacheKey = new StringBuilder(BuildPartCacheKey(keyPlaces, placeType: placeType)
                                                    + BuildPartCacheKey(topCount, skipTokenString)).ToString();

                //Get Places-list from the Cache
                buildingsPlacesCache.TryGetValue(keyPlaces, out List<ExchangePlace> exchangePlacesList);
                exchangePlacesList ??= new List<ExchangePlace>();
                exchangePlacesList.AddRange(exchangePlacesResponse.ExchangePlacesList.Where(x => !x.Identity.OneAmong(exchangePlacesList.Select(y => y.Identity))));
                buildingsPlacesCache.Set(keyPlaces, exchangePlacesList, memoryCacheEntryOptions);

                AddPlaceUpnInfoToCache(exchangePlacesResponse.ExchangePlacesList, cacheKey);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error occurred with AddPlacesByUpnsList cache-logic.");
                return;
            }
        }
    }
}
