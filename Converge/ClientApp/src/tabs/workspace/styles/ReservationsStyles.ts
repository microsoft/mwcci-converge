// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { makeStyles } from "@fluentui/react-theme-provider";

const ReservationsStyles = makeStyles(() => ({
  root: {
    borderTop: "1px solid #E6E6E6",
    minHeight: "80px",
    margin: "1em 0",
    padding: "1em 0",
  },
  datePickerStyles: {
    "& .ui-input__input": {
      maxWidth: "100px",
    },
  },
  duration: {
    marginBottom: ".5em",
  },
  reservationsBox: {
    height: "250px",
    overflowY: "auto",
    overflowX: "hidden",
    marginTop: "1em",
    "@media (max-width: 1366px)": {
      height: "auto",
    },
  },
}));

export default ReservationsStyles;
