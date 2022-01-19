// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { makeStyles } from "@fluentui/react-theme-provider";

const CampusPlaceEventTitleStyles = makeStyles(() => ({
  title: {
    fontSize: "24px",
    margin: 0,
    paddingRight: ".5em",
  },
  availability: {
    flexGrow: 1,
  },
  availabilityText: {
    fontSize: "14px",
  },
  titleWrapper: {
    width: "100%",
  },
  lightTheme: {
    backgroundColor: "transparent",
    color: "#605D5A",
  },
  completedIcon: {
    marginRight: "0.2em",
  },
}));

export default CampusPlaceEventTitleStyles;
