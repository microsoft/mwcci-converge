// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Microsoft.Graph;

namespace Converge.Models
{
    public class TimeLimit
    {
        public TimeOfDay Start { get; set; }
        public TimeOfDay End { get; set; }
        public bool? IsOvernight { get; set; }

        public TimeLimit()
        {
        }

        public TimeLimit(TimeOfDay start, TimeOfDay end, bool? isOvernight = null)
        {
            Start = start;
            End = end;
            IsOvernight = isOvernight;
        }
    }
}
