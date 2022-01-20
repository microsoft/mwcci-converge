// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Converge.Helpers;
using Converge.Models;
using Converge.Models.Enums;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Microsoft.Graph;
using System;
using System.Collections.Generic;
using System.Text;

namespace Converge.Services
{
    public class CacheSharePointContentService
    {
        private readonly IMemoryCache sharePointContentCache;
        private readonly ILogger<CacheSharePointContentService> logger;

        private const string keyPlacePhotoUrls = "keyPlacePhotoUrls";
        private const int placePhotoUrlSize = 1;

        public CacheSharePointContentService(ILogger<CacheSharePointContentService> logger,
                                            IMemoryCache sharePointContentCache)
        {
            this.logger = logger;
            this.sharePointContentCache = sharePointContentCache;
        }

        public static MemoryCacheEntryOptions CacheEntryOptionsDefaults()
        {
            // Structurally, similar idea based on CachePlacesProviderService
            // CacheSharePointContentService will be existing regardless of appsettings configuration.

            return new MemoryCacheEntryOptions()
                        .SetPriority(CacheItemPriority.Normal)
                        .SetSlidingExpiration(TimeSpan.FromHours(24));
        }

        private string GetContentKeyAndString(SharePointContentType? contentType, out string contentTypeString)
        {
            contentTypeString = "";
            if (contentType.HasValue)
            {
                switch (contentType)
                {
                    case SharePointContentType.ExchangePlacePhotoUrls:
                        contentTypeString = Enum.GetName(typeof(SharePointContentType), contentType.Value);
                        return keyPlacePhotoUrls;
                }
            }
            return "";
        }

        private string DetermineCacheKeyForSharePointContent(SharePointContentType? sharePointContentType, string sharePointContentId)
        {
            string sharePointContentTypeString;
            StringBuilder cacheKey = new StringBuilder(GetContentKeyAndString(sharePointContentType, out sharePointContentTypeString));
            cacheKey.Append($"&sharePointContentId={sharePointContentId}");
            cacheKey.Append($"&sharePointContentType={sharePointContentTypeString}");
            return cacheKey.ToString();
        }

        public List<ExchangePlacePhoto> GetExchangePlacePhotoUrlsFromCache(string placeSharePointId)
        {
            try
            {
                List<ExchangePlacePhoto> exchangePlacePhotos;
                string itemCacheKey = DetermineCacheKeyForSharePointContent(SharePointContentType.ExchangePlacePhotoUrls, placeSharePointId);
                if (!sharePointContentCache.TryGetValue(itemCacheKey, out exchangePlacePhotos))
                {
                    logger.LogInformation($"placeSharePointId: {placeSharePointId}, ExchangePlace photo urls not found in cache.");
                    return null;
                }
                logger.LogInformation($"placeSharePointId: {placeSharePointId}, ExchangePlace photo urls found in cache.");
                return exchangePlacePhotos;
            }
            catch (Exception ex)
            {
                logger.LogError($"placeSharePointId: {placeSharePointId}, Error while retrieving ExchangePlace photo urls.", ex, ex.Message);
                return null;
            }
        }

        public void AddExchangePlacePhotoUrlsToCache(string placeSharePointId, List<ExchangePlacePhoto> exchangePlacePhotos)
        {
            try
            {
                logger.LogInformation($"placeSharePointId: {placeSharePointId}, creating unique cache entry key.");
                string itemCacheKey = DetermineCacheKeyForSharePointContent(SharePointContentType.ExchangePlacePhotoUrls, placeSharePointId);
                sharePointContentCache.Set(itemCacheKey,
                                            exchangePlacePhotos,
                                            CacheEntryOptionsDefaults().SetSize(placePhotoUrlSize));
                logger.LogInformation($"placeSharePointId: {placeSharePointId}, ExchangePlace photo urls successfully added to cache.");
            }
            catch (Exception ex)
            {
                logger.LogError($"placeSharePointId: {placeSharePointId}, Error while adding ExchangePlace photo urls.", ex, ex.Message);
            }
        }
    }
}
