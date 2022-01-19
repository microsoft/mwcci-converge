// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Microsoft.Graph;
using System.Collections.Generic;

namespace Converge.Models
{
    public class GraphListItem
    {
        public ListItem ListItem { get; set; }

        public GraphListItem(ListItem listItem, int sortOrderNumber)
        {
            ListItem = listItem;
            OrderRank = sortOrderNumber;
        }

        public int OrderRank { get; set; }
    }
}
