// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import UserPredictedLocation from "./UserPredictedLocation";

interface UserPredictedLocationRequest {
  year: number;
  month: number;
  day: number;
  userPredictedLocation: UserPredictedLocation;
}

export default UserPredictedLocationRequest;
