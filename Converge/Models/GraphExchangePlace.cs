// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Microsoft.Graph;
using System.Collections.Generic;

namespace Converge.Models
{
    public class GraphExchangePlace
    {
        public ExchangePlace ExchangePlace { get; set; }

        public GraphExchangePlace(ExchangePlace exchangePlace, int sortOrderNumber)
        {
            ExchangePlace = exchangePlace;
            OrderRank = sortOrderNumber;
        }

        public int OrderRank { get; set; }
    }
}
