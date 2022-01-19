// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { makeStyles } from "@fluentui/react-theme-provider";

const LocationFilterListStyles = makeStyles(() => ({
  root: {
    display: "flex",
    position: "relative",
    "& .ms-Dropdown, & .ms-Dropdown:hover > .ms-Dropdown-title, & .ms-Dropdown-title": {
      backgroundColor: "#fff",
      color: "#605D5A",
    },
  },
}));

export default LocationFilterListStyles;
