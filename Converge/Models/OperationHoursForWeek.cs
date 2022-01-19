// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Converge.Models.Enums;
using Microsoft.Graph;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Converge.Models
{
    public class OperationHoursForWeek
    {
        public List<OperationHoursForDay> OperationHoursForDayList { get; set; }
        public string HoursType { get; set; }
        public bool IsOpenNow { get; set; }

        public OperationHoursForWeek()
        {
            OperationHoursForDayList = new List<OperationHoursForDay>();
        }

        internal OperationHoursForWeek Set(YelpOperationHoursByDayCollection yelpOperationHoursCollection)
        {
            const int week = 7;
            var yelpOperationHours = yelpOperationHoursCollection.Open;
            for (int dayIndex = 0; dayIndex < week; ++dayIndex)
            {
                var day = (YelpDayOfWeek) dayIndex;
                var operatingHoursForTheDay = yelpOperationHours.Where(x => x.Day == day).ToList();

                var operationHoursForDay = new OperationHoursForDay
                {
                    Day = day.ToString()
                };
                operationHoursForDay.OperationHours = operationHoursForDay.GetOperationHours(operatingHoursForTheDay);

                OperationHoursForDayList.Add(operationHoursForDay);
            }

            HoursType = yelpOperationHoursCollection.Hours_type;
            IsOpenNow = yelpOperationHoursCollection.Is_open_now;

            return this;
        }
    }

    public class OperationHoursForDay
    {
        public string Day { get; set; }
        public List<TimeLimit> OperationHours { get; set; }

        public OperationHoursForDay()
        {
            OperationHours = new List<TimeLimit>();
        }

        internal List<TimeLimit> GetOperationHours(List<YelpOperationHoursByDay> yelpOperationHoursList)
        {
            foreach (var yelpTime in yelpOperationHoursList)
            {
                //Start
                int startHour = Convert.ToInt32((yelpTime.Start.Length < 2) ? "00" : yelpTime.Start.Substring(0, 2));
                int startMinutes = Convert.ToInt32((yelpTime.Start.Length < 4) ? "00" : yelpTime.Start.Substring(2, 2));

                //End
                int endHour = Convert.ToInt32((yelpTime.End.Length < 2) ? "00" : yelpTime.End.Substring(0, 2));
                int endMinutes = Convert.ToInt32((yelpTime.End.Length < 4) ? "00" : yelpTime.End.Substring(2, 2));

                var timeLimit = new TimeLimit()
                {
                    Start = new TimeOfDay(startHour, startMinutes, 0),
                    End = new TimeOfDay(endHour, endMinutes, 0),
                    IsOvernight = yelpTime.Is_overnight
                };
                OperationHours.Add(timeLimit);
            }

            return OperationHours;
        }
    }

    internal class YelpOperationHoursByDayCollection
    {
        public YelpOperationHoursByDay[] Open { get; set; }
        public string Hours_type { get; set; }
        public bool Is_open_now { get; set; }
    }

    internal class YelpOperationHoursByDay
    {
        public YelpDayOfWeek Day { get; set; }
        public bool Is_overnight { get; set; }

        public string Start { get; set; }
        public string End { get; set; }
    }
}
