// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { makeStyles } from "@fluentui/react-theme-provider";

const CollaborationCampusPlaceCardStyles = makeStyles(() => ({
  root: {
    minWidth: "436px",
    height: "148px",
    boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px",
    borderRadius: "5px 5px",
    cursor: "pointer",
    padding: "16px",
    backgroundColor: "white",
  },
  displayName: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    width: "250px",
  },
  details: {
    color: "#605D5A",
    fontSize: "12px",
  },
  availability: {
    color: "#237B4B",
    fontSize: "16px",
  },
  starIcon: {
    color: "#6264a7",
  },
  imgWrapper: {
    display: "flex",
    flex: "0 0 120px",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  imageContainer: {
    width: "120px",
    height: "120px !important",
    position: "absolute",
    objectFit: "cover",
    borderRadius: "5px",
  },
}));

export default CollaborationCampusPlaceCardStyles;
