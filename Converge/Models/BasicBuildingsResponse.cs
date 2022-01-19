// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Microsoft.Graph;
using System.Collections.Generic;

namespace Converge.Models
{
    public class BasicBuildingsResponse
    {
        public List<BuildingBasicInfo> BuildingsList { get; set; }

        public QueryOption SkipToken { get; set; }
        
        public BasicBuildingsResponse(List<BuildingBasicInfo> buildingsList, QueryOption skipToken = null)
        {
            BuildingsList = buildingsList;
            SkipToken = skipToken;
        }
    }
}
