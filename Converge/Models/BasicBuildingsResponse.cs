// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Microsoft.Graph;
using System.Collections.Generic;

namespace Converge.Models
{
    public class BasicBuildingsResponse
    {
        public List<BuildingBasicInfo> BuildingsList { get; set; }
        
        public BasicBuildingsResponse(List<BuildingBasicInfo> buildingsList)
        {
            BuildingsList = buildingsList;
        }
    }
}
