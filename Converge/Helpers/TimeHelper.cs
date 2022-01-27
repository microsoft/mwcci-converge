// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Microsoft.Graph;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Converge.Helpers
{
    public static class TimeHelper
    {
        /// <summary>
        /// Gets the average amount of capacity that is reserved given a time frame and a
        /// number of events.
        /// </summary>
        /// <param name="start">The start DateTime of the reservation period.</param>
        /// <param name="end">The end DateTime of the reservation period.</param>
        /// <param name="events">The events that take place during the reservation period.</param>
        /// <returns></returns>
        public static double GetAverageReserved(DateTime start, DateTime end, List<Event> events)
        {
            return (double)GetTimeFrames(start, end, events, 8.0).Select(tf => tf.Reserved).Sum() / 8.0;
        }

        public static int GetMaxReserved(DateTime start, DateTime end, List<Event> events)
        {
            return GetTimeFrames(start, end, events, 8.0).Select(tf => tf.Reserved).Max();
        }

        private static List<TimeFrame> GetTimeFrames(DateTime start, DateTime end, List<Event> events, double intervalCount)
        {
            List<TimeFrame> timeFrames = new List<TimeFrame>();
            TimeSpan workingHoursTimeSpan = end - start;
            double intervalSeconds = workingHoursTimeSpan.TotalSeconds / intervalCount;
            for (double i = 0; i < 8; i++)
            {
                timeFrames.Add(new TimeFrame
                {
                    Start = start.AddSeconds(intervalSeconds * i),
                    End = start.AddSeconds(intervalSeconds * (i + 1.0)),
                });
            }
            foreach (Event e in events)
            {
                foreach (TimeFrame timeFrame in timeFrames)
                {
                    if (
                        (DateTime.Parse(e.Start.DateTime) < timeFrame.End &&
                        DateTime.Parse(e.End.DateTime) > timeFrame.Start &&
                        e.Attendees != null &&
                        e.Attendees.Count() > 0) || e.IsAllDay == true
                    )
                    {
                        // Always include one for the organizer
                        timeFrame.Reserved += e.Attendees
                            .Where(a => a.Status?.Response == ResponseType.Accepted && a.Type != AttendeeType.Resource && a.EmailAddress.Address != e.Organizer.EmailAddress.Address)
                            .Count() + 1;
                    }
                }
            }
            return timeFrames;
        }
    }

    internal class TimeFrame
    {
        public DateTime Start { get; set; }
        public DateTime End { get; set; }
        public int Reserved { get; set; }
    }

}
