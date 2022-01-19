// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using System.Collections.Generic;

namespace Converge.Models
{
    // This class maintains a pair - an order/rank for a UPN for given Cache-key.
    // More details can be found on its usage, in the class CachedDataUpnInfo.

    public class CachedDataOrder
    {
        public string CachedPageKey { get; set; }
        public int DataOrderRank { get; set; }

        public CachedDataOrder(string cachedPageKey, int dataOrderRank = 0)
        {
            CachedPageKey = cachedPageKey;
            DataOrderRank = dataOrderRank;
        }
    }
}
