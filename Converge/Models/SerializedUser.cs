// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

namespace Converge.Models
{
    public class SerializedUser
    {
        public SerializedUser(Microsoft.Graph.User user)
        {
            this.DisplayName = user.DisplayName;
            this.UserPrincipalName = user.UserPrincipalName;
            this.Id = user.Id;
        }
        public string DisplayName { get; set; }
        public string UserPrincipalName { get; set; }
        public string Id { get; set; }
    }
}
