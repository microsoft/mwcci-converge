// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using System;

namespace Converge.Models
{
    public class DateTimeLimit
    {
        /// <summary>
        /// The start time in UTC.
        /// </summary>
        public DateTime Start { get; set; }

        /// <summary>
        /// The end time in UTC.
        /// </summary>
        public DateTime End { get; set; }

        /// <summary>
        /// The ID of the underlying time zone.
        /// </summary>
        public string TimeZoneId { get; set; }

        public DateTimeLimit(DateTime start, DateTime end, string timeZoneId)
        {
            Start = start;
            End = end;
            TimeZoneId = timeZoneId;
        }
    }
}
