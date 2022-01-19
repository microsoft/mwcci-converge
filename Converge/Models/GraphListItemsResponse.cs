// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Microsoft.Graph;
using System.Collections.Generic;

namespace Converge.Models
{
    public class GraphListItemsResponse
    {
        public List<GraphListItem> GraphListItems { get; set; }

        public QueryOption SkipToken { get; set; }

        public GraphListItemsResponse(List<GraphListItem> graphListItems, QueryOption skipToken = null)
        {
            GraphListItems = graphListItems;
            SkipToken = skipToken;
        }

        public GraphListItemsResponse(List<ListItem> listItems, QueryOption skipToken = null)
        {
            AddListItems(listItems);
            SkipToken = skipToken;
        }

        public void AddListItems(List<ListItem> listItems)
        {
            GraphListItems = new List<GraphListItem>();
            for (int index = 0; index < listItems.Count; ++index)
            {
                GraphListItem graphListItem = new GraphListItem(listItems[index], index + 1);
                GraphListItems.Add(graphListItem);
            }
        }
    }
}
