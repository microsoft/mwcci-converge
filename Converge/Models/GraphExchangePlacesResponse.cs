// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Microsoft.Graph;
using System.Collections.Generic;
using System.Linq;

namespace Converge.Models
{
    public class GraphExchangePlacesResponse
    {
        public List<ExchangePlace> ExchangePlacesList { get; set; }

        public QueryOption SkipToken { get; set; }

        public int TotalRecordCount { get; set; }

        public GraphExchangePlacesResponse(List<ExchangePlace> exchangePlacesList, QueryOption skipToken = null)
        {
            ExchangePlacesList = exchangePlacesList;
            SkipToken = skipToken;
        }

        public GraphExchangePlacesResponse(List<GraphExchangePlace> graphExchangePlacesList, QueryOption skipToken = null)
        {
            ExchangePlacesList = graphExchangePlacesList.Select(x => x.ExchangePlace).ToList();
            SkipToken = skipToken;
        }
    }
}
