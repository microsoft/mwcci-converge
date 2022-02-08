// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Converge.Helpers;
using Microsoft.Graph;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Collections.Generic;

namespace ConvergeUnitTests.Helpers
{
    [TestClass]
    public class TimeHelperTest
    {
        [TestMethod]
        public void TestGetAverageReserved_OneEventOneReservationAllDay()
        {
            DateTime start = new DateTime(2021, 12, 01, 0, 0, 0);
            DateTime end = start.AddHours(8);
            List<Event> events = new List<Event>
            { 
                new Event
                {
                    Start = new DateTimeTimeZone { DateTime = start.ToString("o") },
                    End = new DateTimeTimeZone { DateTime = end.ToString("o") },
                    Attendees = new List<Attendee>
                    {
                        new Attendee
                        {
                            EmailAddress = new EmailAddress
                            {
                                Address="organizer@example.com"
                            },
                            Status = new ResponseStatus()
                            {
                                Response = ResponseType.Accepted,
                            },
                        }
                    },
                    Organizer = new Recipient
                    {
                        EmailAddress = new EmailAddress
                        {
                            Address = "organizer@example.com"
                        }
                    }
                }
            };
            Assert.AreEqual(1.0, TimeHelper.GetAverageReserved(start, end, events), "One event with one reservation all day is one reservation on average.");
        }

        [TestMethod]
        public void TestGetAverageReserved_OneEventOneReservationHalfDay()
        {
            DateTime start = new DateTime(2021, 12, 01, 0, 0, 0);
            DateTime end = start.AddHours(8);
            List<Event> events = new List<Event>
            {
                new Event
                {
                    Start = new DateTimeTimeZone { DateTime = start.ToString("o") },
                    End = new DateTimeTimeZone { DateTime = start.AddHours(4).ToString("o") },
                    Attendees = new List<Attendee>
                    {
                        new Attendee
                        {
                            EmailAddress = new EmailAddress
                            {
                                Address="organizer@example.com"
                            },
                            Status = new ResponseStatus()
                            {
                                Response = ResponseType.Accepted,
                            },
                        }
                    },
                    Organizer= new Recipient
                    {
                        EmailAddress= new EmailAddress
                        {
                            Address = "organizer@example.com"
                        }
                    }
                }
            };
            Assert.AreEqual(0.5, TimeHelper.GetAverageReserved(start, end, events), "One event with one reservation half a day is half a reservation on average.");
        }

        [TestMethod]
        public void TestGetAverageReserved_OneEventAfterHours()
        {
            DateTime start = new DateTime(2021, 12, 01, 0, 0, 0);
            DateTime end = start.AddHours(8);
            List<Event> events = new List<Event>
            {
                new Event
                {
                    Start = new DateTimeTimeZone { DateTime = end.ToString("o") },
                    End = new DateTimeTimeZone { DateTime = end.AddHours(4).ToString("o") },
                    Attendees = new List<Attendee>
                    {
                        new Attendee
                        {
                            EmailAddress = new EmailAddress()
                        }
                    }
                }
            };
            Assert.AreEqual(0.0, TimeHelper.GetAverageReserved(start, end, events), "Events after hours do not count toward average reserved.");
        }

        [TestMethod]
        public void TestGetAverageReserved_OneEventBeforeHours()
        {
            DateTime start = new DateTime(2021, 12, 01, 0, 0, 0);
            DateTime end = start.AddHours(8);
            List<Event> events = new List<Event>
            {
                new Event
                {
                    Start = new DateTimeTimeZone { DateTime = start.ToString("o") },
                    End = new DateTimeTimeZone { DateTime = start.Subtract(new TimeSpan(1, 0, 0)).ToString("o") },
                    Attendees = new List<Attendee>
                    {
                        new Attendee
                        {
                            EmailAddress = new EmailAddress()
                        }
                    }
                }
            };
            Assert.AreEqual(0.0, TimeHelper.GetAverageReserved(start, end, events), "Events before hours do not count toward average reserved.");
        }
    }
}
