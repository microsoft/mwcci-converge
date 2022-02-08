// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { makeStyles } from "@fluentui/react-theme-provider";

const BookWorkspaceStyles = makeStyles(() => ({
  root: {
    marginTop: "16px",
    minHeight: "400px",
  },
  halfWidthDropDown: {
    "& .ui-button__content": {
      fontWeight: "normal",
    },
  },
  datePickerStyles: {
    marginLeft: "3.6rem",
    "& .ui-input__input": {
      maxWidth: "115px !important",
    },
  },
  errorMessage: {
    marginTop: "7.5rem",
  },
  hideErrorMessage: {
    marginTop: "0rem",
  },
  boxStyle: {
    width: "320px",
    height: "325px",
    border: "1px solid #C4C4C4",
    padding: "16px 8px 8px 16px",
    borderRadius: "4px",
    display: "inline-block",
    marginTop: "1em",
  },
  actions: {
    maxWidth: "320px",
    "& .ui-input__input": {
      maxWidth: "155px",
    },
    "& > div": {
      width: "105px",
      "@media (max-width: 1366px)": {
        marginTop: ".5em",
      },
    },
  },
  changeLocation: {
    position: "absolute",
    right: "1.5em",
    bottom: "1em",
    "@media (max-width: 1366px)": {
      position: "static",
      display: "block",
      margin: "2em 0 0",
      "& .ui-button": {
        paddingLeft: 0,
      },
    },
  },
  retryBtn: {
    minWidth: "0px !important",
    marginBottom: "0.2rem",
    textDecoration: "underline",
    color: "rgb(196, 49, 75)",
  },
  header: {
    fontSize: "18px",
    color: "#252525",
    fontWeight: "normal",
  },
  buildingContent: {
    overflowy: "auto",
    overflowX: "hidden !important",
    MsOverflowStyle: "none",
    "@media (max-width: 1366px)": {
      height: "auto",
    },
  },
  WorkSpacebuildingContent: {
    overflowy: "auto",
    overflowX: "hidden !important",
    MsOverflowStyle: "none",
    "@media (max-width: 1366px)": {
      height: "auto",
    },
  },
  dialog: {
    "& .ui-header": {
      color: "#252525",
      fontWeight: "normal",
    },
  },
  displayNameBox: {
    marginBottom: "8px",
  },
  displayName: {
    margin: "0px",
  },
  loaderBox: {
    height: "200px",
  },
  errBox: {
    marginTop: "3rem",
    marginLeft: "0.8rem",
  },
}));

export default BookWorkspaceStyles;
