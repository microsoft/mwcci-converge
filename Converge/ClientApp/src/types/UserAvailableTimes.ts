// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import TimeLimit from "./TimeLimit";

interface UserAvailableTimes {
  userUpn: string;
  availabilityTimes: TimeLimit[];
}

export default UserAvailableTimes;
