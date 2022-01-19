// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { makeStyles } from "@fluentui/react-theme-provider";

const RemoteCardStyles = makeStyles(() => ({
  root: {
    width: "320px",
    height: "325px",
    border: "1px solid #C4C4C4",
    padding: "16px 8px 8px 16px",
    borderRadius: "4px",
    display: "inline-block",
    marginTop: "1em",
  },
  title: {
    fontSize: "18px",
    color: "#000",
    margin: "0",
  },
  description: {
    fontSize: "14px",
    color: "#000",
    margin: "0",
    whiteSpace: "normal",
    width: "100%",
  },
  image: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  imgStyles: {
    marginTop: "2em",
  },
}));

export default RemoteCardStyles;
