// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using System.Collections.Generic;

namespace Converge.Models
{
    public class UserAvailableTimes
    {
        public string UserUpn { get; set; }
        public List<TimeLimit> AvailabilityTimes { get; set; }

        public UserAvailableTimes(string userUpn, List<TimeLimit> availabilityTimes)
        {
            UserUpn = userUpn;
            AvailabilityTimes = availabilityTimes;
        }
    }
}
