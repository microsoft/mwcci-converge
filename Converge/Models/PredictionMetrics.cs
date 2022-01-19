// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using System;
using System.Collections.Generic;

namespace Converge.Models
{
    public class PredictionMetrics
    {
        public int FailedUsersCount
        {
            get
            {
                return ExceptionUser.Keys.Count;
            }
        }

        public List<Exception> ExceptionsList { get; set; } = new List<Exception>();

        public Dictionary<string, double> SummaryCount { get; set; } = new Dictionary<string, double>();

        public Dictionary<string, string> ExceptionUser { get; set; } = new Dictionary<string, string>();
    }
}
