// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

namespace Converge.Models
{
    public class ApiPresence
    {
        public ApiPresence(string activity, string availability)
        {
            Activity = activity;
            Availability = availability;
        }
        public string Activity { get; set; }
        public string Availability { get; set; }
    }
}
