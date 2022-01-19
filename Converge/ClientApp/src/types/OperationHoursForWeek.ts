// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import OperationHoursForDay from "./OperationHoursForDay";

interface OperationHoursForWeek {
  operationHoursForDayList: OperationHoursForDay[];
  hoursType: string;
  isOpenNow: boolean;
}

export default OperationHoursForWeek;
