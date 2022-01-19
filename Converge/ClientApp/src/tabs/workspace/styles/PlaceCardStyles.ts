// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { makeStyles } from "@fluentui/react-theme-provider";

const PlaceCardStyles = makeStyles(() => ({
  lightCard: {
    height: "180px",
    display: "flex",
    flexDirection: "column",
    boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px",
    marginBottom: "1em",
    borderRadius: "0 0 5px 5px",
    backgroundColor: "transparent",
  },
  displayName: {
    fontWeight: "bold",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  buildingName: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  lightTheme: {
    backgroundColor: "transparent",
    color: "#605D5A",
  },
  imgWrapper: {
    height: 0,
    overflow: "hidden",
    paddingTop: "123px",
    background: "#fff",
    position: "relative",
  },
  imageContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    borderRadius: "5px 5px 0 0",
  },
  detailsWrapper: {
    maxWidth: "50%",
  },
  triggerBtn: {
    fontWeight: "bold",
    padding: "4 15px",
  },
  dialog: {
    "& .ui-header": {
      color: "#252525",
      fontWeight: "normal",
    },
  },
}));

export default PlaceCardStyles;
