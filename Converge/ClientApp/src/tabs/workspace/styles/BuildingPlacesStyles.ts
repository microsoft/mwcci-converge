// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { makeStyles } from "@fluentui/react-theme-provider";

const BuildingPlacesStyles = makeStyles(() => ({

  pageSizeLabel: {
    fontSize: "12px",
    margin: "8px 8px 8px 0",
  },
  pageSizeInput: {
    "& .ui-dropdown__selected-items": {
      height: "32px",
      width: "64px",
      overflowX: "hidden",
    },
  },
  isThisHelpful: {
    marginBottom: "2rem",
  },
}));

export default BuildingPlacesStyles;
