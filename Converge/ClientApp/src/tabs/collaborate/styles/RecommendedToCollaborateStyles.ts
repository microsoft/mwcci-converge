// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { makeStyles } from "@fluentui/react-theme-provider";

const RecommendedToCollaborateStyles = makeStyles(() => ({
  recommendations: {
    marginTop: "20px",
  },
  noResult: {
    paddingLeft: "5rem",
    marginBottom: "0.3rem",
  },
  isError: {
    paddingLeft: "0.2rem",
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
  errBox: {
    paddingLeft: "2.5rem",
  },
  errBoxCtr: {
    marginTop: "4rem",
  },
}));

export default RecommendedToCollaborateStyles;
