// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import BuildingBasicInfo from "./BuildingBasicInfo";

interface UpcomingBuildingsResponse {
  buildingsList: BuildingBasicInfo[],
  loadMore: boolean,
  totalRecordCount:number,
}

export default UpcomingBuildingsResponse;
