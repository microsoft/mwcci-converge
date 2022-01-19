// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { makeStyles } from "@fluentui/react-theme-provider";

const VenueFilterStyles = makeStyles(() => ({
  root: {
    "& .ui-dropdown__selected-items .ui-button .ui-button__content": {
      fontSize: "14px",
      fontWeight: "normal",
    },
    "& .ui-dropdown__selecteditem .ui-dropdown__selecteditem__header": {
      fontSize: "14px",
      fontWeight: "normal",
    },
    "& .ui-dropdown__items-list": {
      zIndex: "100000000",
    },
  },
}));

export default VenueFilterStyles;
