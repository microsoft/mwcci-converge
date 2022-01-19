// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { makeStyles } from "@fluentui/react-theme-provider";

const OperationHoursStyles = makeStyles(() => ({
  hours: {
    padding: "0 48px 16px 48px",
  },
  list: {
    display: "flex",
    alignItems: "center",
  },
  open: {
    color: "#237B4B",
  },
  closed: {
    color: "red",
  },
  day: {
    width: "30%",
  },
}));

export default OperationHoursStyles;
