// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import TimeLimit from "./TimeLimit";

interface OperationHoursForDay {
  day: string;
  operationHours: TimeLimit[];
}

export default OperationHoursForDay;
