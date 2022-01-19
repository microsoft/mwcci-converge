// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using System;

namespace Converge.Models
{
    public class FullDateTimeSlot
    {
        public DateTime SlotStart { get; set; }
        public DateTime SlotEnd { get; set; }
        public TimeLimit SlotAsTimeLimit { get; set; }
        public char AvailabilityCode { get; set; }
    }
}
