// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Converge.Models;
using Microsoft.Graph;
using System;
using System.Collections.Generic;
using System.Runtime;

namespace Converge.Helpers
{
    public static class DateTimeTypeHelper
    {
        public static DateTime Initialize(this DateTime dateTime, TimeOfDay timeOfDay)
        {
            return new DateTime(dateTime.Year, dateTime.Month, dateTime.Day,
                                timeOfDay.Hour, timeOfDay.Minute, timeOfDay.Second);
        }

        /// <summary>
        /// Converts provided working hours from original timezone to UTC
        /// </summary>
        /// <param name="userSchedule"></param>
        /// <param name="targetDay"></param>
        /// <param name="e"></param>
        /// <returns>on no errors - converted working hours, or orignal working hours on exception</returns>
        public static ScheduleInformation TransformAsUTC(this ScheduleInformation userSchedule, DateTime targetDay, out Exception e)
        {
            var originalSchedule = userSchedule;
            var originalWorkingHours = userSchedule.WorkingHours;
            var additionalData = new Dictionary<string, object>();
            additionalData.Add("OriginalWorkingHours", originalWorkingHours);
            try
            {
                var workStart = TimeZoneInfo.ConvertTime(Initialize(targetDay, userSchedule.WorkingHours.StartTime),
                    TimeZoneInfo.FindSystemTimeZoneById(userSchedule.WorkingHours.TimeZone.Name),
                    TimeZoneInfo.FindSystemTimeZoneById(Constant.TimeZoneCodeUTC));
                var workEnd = TimeZoneInfo.ConvertTime(Initialize(targetDay, userSchedule.WorkingHours.EndTime),
                    TimeZoneInfo.FindSystemTimeZoneById(userSchedule.WorkingHours.TimeZone.Name),
                    TimeZoneInfo.FindSystemTimeZoneById(Constant.TimeZoneCodeUTC));
                userSchedule.WorkingHours.StartTime = new TimeOfDay(workStart.Hour, workStart.Minute, workStart.Second);
                userSchedule.WorkingHours.EndTime = new TimeOfDay(workEnd.Hour, workEnd.Minute, workEnd.Second);
                userSchedule.WorkingHours.TimeZone = new TimeZoneBase()
                {
                    Name = Constant.TimeZoneUTC,
                    AdditionalData = additionalData
                };
                e = null;
                return userSchedule;
            }
            catch (Exception ex)
            {
                // Just in case, Timezone is not found.
                e = ex;
                return originalSchedule;
            }
        }
    }
}
