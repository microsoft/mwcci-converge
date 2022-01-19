// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { makeStyles } from "@fluentui/react-theme-provider";

const DateTimeFilterStyles = makeStyles(() => ({
  datePickerStyles: {
    "& .ui-input__input": {
      width: "150px",
    },
  },
  timePickerStyles: {
    "& .ms-Label": {
      fontSize: "12px",
      color: "#616161",
      fontWeight: "normal",
      paddingTop: 0,
    },
    "& .ms-ComboBox-Input, & .ms-ComboBox": {
      boxShadow: "none",
      backgroundColor: "#f3f2f1",
      maxWidth: "100px",
      height: "32px",
    },
    "& .ms-ComboBox::after": {
      border: "none",
    },
  },
  formLabel: {
    fontSize: "12px",
    marginBottom: "8px !important",
  },
}));

export default DateTimeFilterStyles;
