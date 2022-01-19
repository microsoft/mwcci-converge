// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Microsoft.Graph;
using System.Collections.Generic;

namespace Converge.Models
{
    public class CampusesToCollaborateResponse
    {
        public List<ExchangePlace> CampusesToCollaborateList { get; set; }

        public QueryOption SkipToken { get; set; }

        public CampusesToCollaborateResponse(List<ExchangePlace> campusesToCollaborateList, QueryOption skipToken = null)
        {
            CampusesToCollaborateList = campusesToCollaborateList;
            SkipToken = skipToken;
        }
    }
}
