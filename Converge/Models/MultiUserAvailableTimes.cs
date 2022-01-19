// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Newtonsoft.Json;
using System;
using System.Collections.Generic;

namespace Converge.Models
{
    public class MultiUserAvailableTimesRequest
    {
        public int Year { get; set; }
        public int Month { get; set; }
        public int Day { get; set; }
        public List<string> UsersUpnList { get; set; }
        public DateTime? ScheduleFrom { get; set; }
        public DateTime? ScheduleTo { get; set; }
        [JsonConstructor]
        public MultiUserAvailableTimesRequest(List<string> usersUpnList, int year, int month, int day, DateTime? scheduleFrom = null, DateTime? scheduleTo = null)
        {
            UsersUpnList = usersUpnList;
            Year = year;
            Month = month;
            Day = day;
            ScheduleFrom = scheduleFrom;
            ScheduleTo = scheduleTo;
        }

        public MultiUserAvailableTimesRequest(List<string> usersUpnList, DateTime dateTime)
                                    : this(usersUpnList, dateTime.Year, dateTime.Month, dateTime.Day)
        {
        }
    }

    public class MultiUserAvailableTimesResponse
    {
        public List<UserAvailableTimes> MultiUserAvailabilityTimes { get; set; }

        public MultiUserAvailableTimesResponse()
        {
            MultiUserAvailabilityTimes = new List<UserAvailableTimes>();
        }
    }
}
