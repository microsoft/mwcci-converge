// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Microsoft.Graph;
using System.Collections.Generic;

namespace Converge.Models
{
    public class BuildingSearchInfo
    {
        public List<BuildingBasicInfo> BuildingInfoList { get; set; }

        public BuildingSearchInfo(List<BuildingBasicInfo> buildingInfoList)
        {
            BuildingInfoList = buildingInfoList;
        }
    }
}
