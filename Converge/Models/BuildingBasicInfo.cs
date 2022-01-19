// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

namespace Converge.Models
{
    public class BuildingBasicInfo
    {
        public string Identity { get; set; }
        public string DisplayName { get; set; }

        public BuildingBasicInfo(string identity, string displayName)
        {
            Identity = identity;
            DisplayName = displayName;
        }
    }
}
