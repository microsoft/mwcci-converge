// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { makeStyles } from "@fluentui/react-theme-provider";

const NPSDialogStyles = makeStyles(() => ({
  buttonWrapper: {
    "button:hover ~ button": {
      svg: {
        fill: "#333333",
        "> path.ui-icon__outline": {
          display: "block",
        },
        "> path.ui-icon__filled": {
          display: "none",
        },
      },
    },
    ":hover": {
      button: {
        svg: {
          fill: "#333333",
          "> path.ui-icon__filled": {
            display: "block",
          },
        },
      },
    },
  },
}));

export default NPSDialogStyles;
