// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { makeStyles } from "@fluentui/react-theme-provider";

const ReservationStyles = makeStyles(() => ({
  formLabel: {
    fontSize: "12px",
    lineHeight: "16px",
  },
  datePickerStyles: {
    "& .ui-input__input": {
      maxWidth: "100px",
    },
  },
  root: {
    margin: "1em 0",
  },
  reserveBox: {
    width: "calc(100% - 76px)",
    overflow: "hidden",
    flexGrow: 1,
  },
  reserve: {
    fontWeight: "bold",
    fontSize: "14px",
    width: "100%",
    marginLeft: ".5em",
  },
  name: {
    width: "calc(100% - 14px)",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  headerText: {
    fontSize: "18px",
    lineHeight: "24px",
  },
  reservationDetails: {
    fontSize: "12px",
    marginLeft: "22px",
  },
}));

export default ReservationStyles;
