// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { makeStyles } from "@fluentui/react-theme-provider";

const CollaborationPlaceResultsStyles = makeStyles(() => ({
  root: {
    gap: "14px",
    overflowY: "scroll",
    height: "calc(100vh - 230px)",
    paddingBottom: "1em",
    overflowX: "hidden",
    gridTemplateColumns: "repeat(auto-fill, 210px)",
    "@media (max-width: 968px)": {
      maxWidth: "100%",
      gridTemplateColumns: "repeat(auto-fill, 210px)",
    },
  },
  lightTheme: {
    "& button": {
      backgroundColor: "#fff",
      color: "#605D5A",
    },
  },
  loadBtnContainer: {
    width: "100%",
    height: "70px",
    display: "grid",
  },
  showMoreBtn: {
    margin: "auto",
    fontSize: "small",
    fontWeight: "bold",
    color: "#000 !important",
  },
  textNoMore: {
    margin: "auto",
    fontSize: "small",
    color: "grey !important",
  },
}));

export default CollaborationPlaceResultsStyles;
