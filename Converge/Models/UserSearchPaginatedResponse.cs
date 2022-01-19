// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Microsoft.Graph;
using System.Collections.Generic;

namespace Converge.Models
{
    public class UserSearchPaginatedResponse
    {
        public UserSearchPaginatedResponse(List<User> users, IList<QueryOption> queryOptions)
        {
            this.Users = users;
            this.QueryOptions = queryOptions;
        }

        public List<User> Users { get; set; }

        public IList<QueryOption> QueryOptions { get; set; }
    }
}
