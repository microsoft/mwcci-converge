// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Microsoft.Graph;

namespace Converge.Models
{
    public class EventRecipient
    {
        public string Name { get; set; }

        public string EmailAddress { get; set; }

        public AttendeeType Type { get; set; }
    }
}
