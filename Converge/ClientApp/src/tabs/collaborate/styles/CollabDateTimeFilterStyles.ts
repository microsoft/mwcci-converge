// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { makeStyles } from "@fluentui/react-theme-provider";

const CollabDateTimeFilterStyles = makeStyles(() => ({
  datePickerStyles: {
    marginRight: "10px",
    borderRadius: 0,
    width: "182px",
    "& .ui-button": {
      boxShadow: "none",
      border: "none",
    },
    "& .ui-input__input": {
      borderRadius: 0,
      width: "150px",
      paddingRight: ".5em",
    },
  },
  timePickerStyles: {
    width: "100px",
    "& .ms-Label": {
      fontSize: "12px",
      color: "#616161",
      fontWeight: "normal",
      paddingTop: 0,
    },
    "& .ms-ComboBox-Input, & .ms-ComboBox": {
      boxShadow: "none",
      maxWidth: "100px",
      height: "32px",
    },
    "& .ms-ComboBox::after": {
      border: "none",
    },
    "& .ms-ComboBox-CaretDown-button:hover": {
      backgroundColor: "#fff",
    },
  },
  arrowRight: {
    margin: "10px",
  },
}));

export default CollabDateTimeFilterStyles;
