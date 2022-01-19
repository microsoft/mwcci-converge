// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Microsoft.Graph;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Converge.Models
{
    public class BuildingSearchInfo
    {
        public List<BuildingBasicInfo> BuildingInfoList { get; set; }
        public QueryOption SkipToken { get; set; }

        public BuildingSearchInfo(List<BuildingBasicInfo> buildingInfoList, QueryOption skipToken)
        {
            BuildingInfoList = buildingInfoList;
            SkipToken = skipToken;
        }
    }
}
