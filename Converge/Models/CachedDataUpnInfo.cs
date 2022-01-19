// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Converge.Helpers;
using Microsoft.Graph;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Converge.Models
{
    // This class is structured so that it captures Building/Place-UPN for caching, and for such each UPN,
    // it is necessary that we maintain a list of Cache-key and order/rank of the Upn. Idea is to fetch a
    // collection of UPNs for a given Cache-key, and then apply the order to return. So, for the first time
    // API request, one instance of a (new) Cache-key along with UPN's order/rank is stored for each Upn.
    // When data from the cache can be returned for subsequent requests for the same Cache-key, the order/rank 
    // field is used to determine the position of the Building/Plan-UPN among the list of these UPNs.
    // This approach is used to avoid duplicate-caching for a given Upn for each cache-key, and also to maintain 
    // the order of the output (UPNs).

    public class CachedDataUpnInfo
    {
        public string DataUpn { get; set; }
        public List<CachedDataOrder> DataOrderList { get; set; }

        public CachedDataUpnInfo(string dataUpn, List<CachedDataOrder> dataOrderList)
        {
            DataUpn = dataUpn;
            DataOrderList = dataOrderList;
        }

        public static List<CachedDataUpnInfo> GetUpnsListInfoForCacheKey(List<CachedDataUpnInfo> dataUpnInfoList, string cacheKey)
        {
            return dataUpnInfoList.Where(x => cacheKey.OneAmong(x.DataOrderList.Select(y => y.CachedPageKey))).ToList();
        }

        public static CachedDataUpnInfo GetUpnMatchFromCache(string upn, List<CachedDataUpnInfo> dataUpnInfoList)
        {
            return dataUpnInfoList.FirstOrDefault(x => x.DataUpn.SameAs(upn));
        }

        public static List<CachedDataUpnInfo> GetUpnsListMatchFromCache(List<string> upnsList, List<CachedDataUpnInfo> dataUpnInfoList, string cacheKey)
        {
            return dataUpnInfoList.Where(x => cacheKey.OneAmong(x.DataOrderList.Select(y => y.CachedPageKey))
                                                                    && x.DataUpn.OneAmong(upnsList)).ToList();
        }

        public static void AddUpnInfoToCache(string upn, List<CachedDataUpnInfo> dataUpnInfoList, string cacheKey, int dataOrderRank = 0)
        {
            var cacheUpnInfo = dataUpnInfoList.FirstOrDefault(x => x.DataUpn.SameAs(upn));
            if (cacheUpnInfo == null)
            {
                cacheUpnInfo = new CachedDataUpnInfo(upn, new List<CachedDataOrder>());
                //Now add to cache.
                dataUpnInfoList.Add(cacheUpnInfo);
            }
            cacheUpnInfo.DataOrderList.Add(new CachedDataOrder(cacheKey, dataOrderRank));
        }

        public static void AddUpnsListInfoToCache(List<string> upnsList, List<CachedDataUpnInfo> dataUpnInfoList, string cacheKey, int dataOrderRank = 0)
        {
            for (int index = 0; index < upnsList.Count; ++index)
            {
                var exchangePlaceUpn = upnsList[index];
                AddUpnInfoToCache(exchangePlaceUpn, dataUpnInfoList, cacheKey, index + 1);
            }
        }
    }
}
