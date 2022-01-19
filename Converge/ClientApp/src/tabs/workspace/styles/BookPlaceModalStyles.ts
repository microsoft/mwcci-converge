// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { makeStyles } from "@fluentui/react-theme-provider";

const BookPlaceModalStyles = makeStyles(() => ({
  root: {
    "& > div": {
      marginBottom: "1em",
    },
  },
  header: {
    display: "flex",
    alignItems: "baseline",
    marginBottom: "18px",
  },
  timePickerStyles: {
    "& .ms-Label": {
      fontSize: "12px",
      fontWeight: "normal",
      paddingTop: 0,
    },
    "& .ms-ComboBox-Input, & .ms-ComboBox": {
      boxShadow: "none",
      maxWidth: "102px",
      height: "32px",
    },
    "& .ms-ComboBox::after": {
      border: "none",
    },
  },
  datePickerStyles: {
    "& .ui-input__input": {
      width: "120px",
    },
  },
  location: {
    fontSize: "12px",
  },
  timeWrapper: {
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: ".5em",
  },
  icon: {
    alignSelf: "center",
    margin: "0 .2em",
    fontSize: "12px",
    paddingTop: "3px",
  },
  checkBox: {
    alignSelf: "center",
    fontSize: "12px",
    "& .ui-checkbox__label": {
      paddingTop: "3px",
    },
  },
  lightTitle: {
    backgroundColor: "transparent",
    color: "#252525",
    fontSize: "24px",
    margin: 0,
    paddingRight: ".5em",
  },
  arrowRightIcon: {
    alignSelf: "center",
    margin: "0 .3em",
  },
  workspaceBox: {
    display: "flex",
    justifyContent: "space-between",
    margin: "2em 0 1em 0",
    flexWrap: "wrap",
  },
  flexibleSeatingWrapper: {
    flexBasis: "30%",
    marginLeft: "12px",
  },
  flexibleSeating: {
    fontSize: "12px",
    color: "#000",
    display: "block",
    marginBottom: "6px",
    fontWeight: "bold",
  },
  flexibleSeatingDesc: {
    fontSize: "12px",
    color: "#252525",
  },
  amenitiesBox: {
    marginBottom: "2em",
  },
  amenities: {
    fontSize: "12px",
    fontWeight: "bold",
  },
  contactIcon: {
    fontSize: "10px",
  },
}));

export default BookPlaceModalStyles;
