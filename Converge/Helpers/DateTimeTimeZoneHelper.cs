// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Microsoft.Graph;
using System;

namespace Converge.Helpers
{
    public static class DateTimeTimeZoneHelper
    {
        public static int CompareTo(this DateTimeTimeZone givenDateTimeZone, DateTime secondDateTime)
        {
            DateTime givenDateTime = DateTime.Parse(givenDateTimeZone.DateTime);

            return givenDateTime.CompareTo(secondDateTime);
        }
    }
}
