// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { makeStyles } from "@fluentui/react-theme-provider";

const PlacesStyles = makeStyles(() => ({
  headerBox: {
    borderBottom: "1px solid #E6E6E6",
    minHeight: "80px",
    marginBottom: ".6em",
  },
  isThisHelpful: {
    margin: "2.5em 0 0",
  },
  placeCardBox: {
    height: "49vh",
    overflowX: "auto",
  },
  cardBox: {
  },
}));

export default PlacesStyles;
