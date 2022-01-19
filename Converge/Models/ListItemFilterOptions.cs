// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

namespace Converge.Models
{
    public class ListItemFilterOptions
    {
        public bool IsWheelChairAccessible { get; set; }
        public bool HasVideo { get; set; }
        public bool HasAudio { get; set; }
        public bool HasDisplay { get; set; }
        public string DisplayNameSearchString { get; set; }
    }
}
