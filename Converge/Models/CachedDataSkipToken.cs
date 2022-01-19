// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Converge.Helpers;
using Microsoft.Graph;
using System.Collections.Generic;

namespace Converge.Models
{
    // This class maintains a pair - a skip-token of an output (list of Building/Places) for given Cache-key.
    // When first time API call returns a skip-token for an output is stored against the (new) Cache-key.
    // The subsequent request for same cache-key, will use this skipToken while returning the output from Cache.

    public class CachedDataSkipToken
    {
        public string CachedPageKey { get; set; }
        public QueryOption SkipToken { get; set; }

        public CachedDataSkipToken(string cachedPageKey, QueryOption skipToken = null)
        {
            CachedPageKey = cachedPageKey;
            SkipToken = skipToken;
        }

        public CachedDataSkipToken(string cachedPageKey, string skipTokenString = null)
        {
            CachedPageKey = cachedPageKey;
            SkipToken = DeserializeHelper.QueryOption(skipTokenString);
        }
    }
}
