// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Microsoft.Graph;
using System;

namespace Converge.Models
{
    public class WorkingStartEnd
    {
        public WorkingStartEnd(WorkingHours workingHours)
        {
            TimeZoneInfo timeZoneInfo = TimeZoneInfo.FindSystemTimeZoneById(workingHours.TimeZone.Name);
            Start = TimeZoneInfo.ConvertTimeToUtc(new DateTime(
                DateTime.UtcNow.Year,
                DateTime.UtcNow.Month,
                DateTime.UtcNow.Day,
                workingHours.StartTime.Hour,
                workingHours.StartTime.Minute,
                workingHours.StartTime.Second
            ), timeZoneInfo);
            End = TimeZoneInfo.ConvertTimeToUtc(new DateTime(
                DateTime.UtcNow.Year,
                DateTime.UtcNow.Month,
                DateTime.UtcNow.Day,
                workingHours.EndTime.Hour,
                workingHours.EndTime.Minute,
                workingHours.EndTime.Second
            ), timeZoneInfo);
        }

        /// <summary>
        /// The time of day this user starts their workday today, in UTC.
        /// </summary>
        public DateTime Start { get; set; }

        /// <summary>
        /// The time of day this user ends their workday today, in UTC.
        /// </summary>
        public DateTime End { get; set; }
    }
}
