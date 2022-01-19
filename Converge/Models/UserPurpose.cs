// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

namespace Converge.Models
{
    public class UserPurpose
    {
        public UserPurpose(Microsoft.Graph.User user, string purpose)
        {
            GraphUser = user;
            Purpose = purpose;
        }

        public Microsoft.Graph.User GraphUser { get; set; }

        public string Purpose { get; set; }
    }
}
