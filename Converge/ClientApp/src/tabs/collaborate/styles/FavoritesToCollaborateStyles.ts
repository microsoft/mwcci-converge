// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { makeStyles } from "@fluentui/react-theme-provider";

const FavoritesToCollaborateStyles = makeStyles(() => ({
  emptyMessage: {
    fontSize: "12px",
    color: "#616161",
    width: "100%",
    height: "120px",
  },
  recommendations: {
    marginTop: "16px",
  },
  errIcon: {
    marginBottom: "0.3rem",
  },
  tryAgainBtn: {
    minWidth: "0px !important",
    marginBottom: "0.2rem",
    textDecoration: "underline",
    color: "rgb(196, 49, 75)",
  },
  errText: {
    paddingLeft: "0.2rem",
  },
}));

export default FavoritesToCollaborateStyles;
