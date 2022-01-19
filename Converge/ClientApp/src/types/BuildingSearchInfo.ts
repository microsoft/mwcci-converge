// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import BuildingBasicInfo from "./BuildingBasicInfo";
import QueryOption from "./QueryOption";

interface BuildingSearchInfo {
  buildingInfoList: BuildingBasicInfo[];
  skipToken:QueryOption;
}

export default BuildingSearchInfo;
