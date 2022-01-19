// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { makeStyles } from "@fluentui/react-theme-provider";

const ReviewStyles = makeStyles(() => ({
  review: {
    padding: "12px 0",
  },
  link: {
    color: "#6264A7",
    textDecoration: "none",
    marginBottom: "24px",
  },
  flexBox: {
    flex: "0 0 2em",
  },
  imgCtr: {
    position: "relative",
  },
  imgStyles: {
    position: "absolute",
    width: "2em",
    height: "2em",
    top: 0,
    left: 0,
  },
  name: {
    lineHeight: "2em",
  },
}));

export default ReviewStyles;
