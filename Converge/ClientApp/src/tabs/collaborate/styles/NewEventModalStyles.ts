// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { makeStyles } from "@fluentui/react-theme-provider";

const NewEventModalStyles = makeStyles(() => ({
  root: {
    "& > div": {
      marginBottom: "1em",
    },
  },
  header: {
    display: "flex",
    alignItems: "baseline",
    marginBottom: "1em",
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
  datePickerStyles: {
    "& .ui-input__input": {
      width: "135px",
      paddingRight: ".5em",
    },
  },
  title: {
    fontSize: "24px",
    color: "#252525",
    margin: 0,
    paddingRight: ".5em",
    maxWidth: "250px",
  },
  timeWrapper: {
    display: "flex",
    flexWrap: "wrap",
    gap: ".5em",
  },
  icon: {
    alignSelf: "center",
    margin: "0 .5em",
    paddingTop: "1.5em",
  },
  checkBox: {
    alignSelf: "center",
    paddingTop: "2em",
    fontSize: "12px",
  },
  formLabel: {
    fontSize: "12px",
    margin: "0 0 8px 0",
  },
  arrowRight: {
    alignSelf: "center",
    margin: "0 .5em",
    paddingTop: "1.5em",
  },
  attendees: {
    "& .ui-dropdown__selected-items .ui-button .ui-button__content": {
      fontSize: "14px",
      fontWeight: "normal",
    },
  },
}));

export default NewEventModalStyles;
