// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { makeStyles } from "@fluentui/react-theme-provider";

const CollaborateFurtherStyles = makeStyles(() => ({
  root: {
    paddingRight: "24px",
    position: "relative",
    height: "calc(100vh - 85px)",
  },
  title: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "24px",
    lineHeight: "24px",
    fontWeight: "bold",
  },
  sortDropdown: {
    "& .ui-dropdown__selected-items .ui-button .ui-button__content": {
      fontSize: "14px",
      fontWeight: "normal",
    },
    "& .ui-dropdown__selecteditem .ui-dropdown__selecteditem__header": {
      fontSize: "14px",
      fontWeight: "normal",
    },
  },
  sortContainer: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
  },
  sortBy: {
    fontSize: "12px",
    lineHeight: "32px",
    paddingRight: "8px",
  },
  results: {
    lineHeight: "32px",
  },
  panel: {
    "& .ms-Panel-main": {
      position: "fixed",
      left: "490px",
      top: "80px",
      width: "480px",
      padding: "20px 0",
      backgroundColor: "#F5F5F5",
      opacity: ".95",
    },
  },
  actionButton: {
    minHeight: "143px",
    textAlign: "left",
    paddingLeft: "0",
    "& .ms-Button-label": {
      marginLeft: "0",
    },
  },
  tryAgainBtn: {
    minWidth: "0px !important",
    marginBottom: "0.2rem",
    textDecoration: "underline",
    color: "rgb(196, 49, 75)",
  },
}));

export default CollaborateFurtherStyles;
