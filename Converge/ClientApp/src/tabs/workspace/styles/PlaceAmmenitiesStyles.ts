// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { makeStyles } from "@fluentui/react-theme-provider";

const PlaceAmmenitiesStyles = makeStyles(() => ({
  root: {
    listStyle: "none",
    width: "280px",
    paddingLeft: 0,
    display: "grid",
    gap: ".3em",
    gridTemplateColumns: "repeat(auto-fill, 133px)",
  },
  item: {
    paddingRight: ".5em",
  },
}));

export default PlaceAmmenitiesStyles;
