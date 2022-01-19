// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Microsoft.Graph;

namespace Converge.Models
{
    public class UserPresence
    {
        public UserPresence(UserPurpose user, Presence presence)
        {
            User = user;
            Presence = presence;
        }

        public UserPurpose User { get; set; }

        public Presence Presence { get; set; }
    }
}
