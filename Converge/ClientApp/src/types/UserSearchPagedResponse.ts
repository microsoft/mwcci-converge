// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as MicrosoftGraph from "@microsoft/microsoft-graph-types";
import QueryOption from "./QueryOption";

interface UserSearchPagedResponse {
  users: MicrosoftGraph.User[],
  queryOptions: QueryOption[],
}

export default UserSearchPagedResponse;
