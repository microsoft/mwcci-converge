// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { makeStyles } from "@fluentui/react-theme-provider";

const CampusPlacePanelStyles = makeStyles(() => ({
  root: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: "10px",
    position: "relative",
    minHeight: "800px",
    overflow: "auto",
    "& .ms-Panel-commands": {
      margin: 0,
    },
    "& .ms-Panel-main": {
      padding: 0,
    },
  },
  actions: {
    marginRight: "8px",
    fontWeight: "bold",
    color: "#000",
    "& > div": {
      marginRight: "5px",
    },
  },
  contact: {
    ul: {
      listStyle: "none",
      padding: "24px 0px",
      margin: "0",
    },
    "ul > li": {
      listStyle: "none",
      display: "flex",
      marginBottom: "15px",
      fontSize: "14px",
      lineHeight: "16px",
    },
    "ul li:last-child": {
      marginBottom: "0",
    },
    "ul > li > i": {
      marginRight: "11px",
    },
    "ul > li > span": {
      marginRight: "5px",
    },
  },
  icons: {
    color: "#6264A7",
    backgroundColor: "#fff",
    padding: ".5em",
  },
  iconContainer: {
    position: "absolute",
    top: "145px",
    right: "12px",
    "& button": {
      borderColor: "#6264A7",
      marginLeft: "12px",
    },
    "& button:hover": {
      backgroundColor: "#fff",
    },
  },
  displayContainer: {
    padding: "24px 0px 18px",
  },
  floor: {
    color: "#605D5A",
    fontSize: "12px",
    marginBottom: "1em",
  },
  images: {
    height: "160px",
  },
  detailsContainer: {
    padding: "0 16px",
  },
  ammenitiesTitle: {
    paddingTop: "24px",
  },
  imgGrid: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr",
    gridTemplateRows: "80px 80px",
    "grid-template-areas": `
            'index0 index1 index1' 
            'index0 index2 index2'`,
  },
  iconColor: {
    color: "#6264A7",
  },
}));

export default CampusPlacePanelStyles;
