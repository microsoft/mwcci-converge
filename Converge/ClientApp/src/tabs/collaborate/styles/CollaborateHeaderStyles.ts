// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { makeStyles } from "@fluentui/react-theme-provider";

const CollaborateHeaderStyles = makeStyles(() => ({
  root: {
    borderBottom: "1px solid #E6E6E6",
    padding: "1em 0 0 1em",
  },
  filter: {
    display: "flex",
    height: "32px",
    paddingLeft: "10px",
    lineHeight: "32px",
  },
  iconStyles: {
    paddingTop: "8px",
    margin: "0 5px",
  },
  filterLabel: {
    fontWeight: "bold",
  },
}));

export default CollaborateHeaderStyles;
