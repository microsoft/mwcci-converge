// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { makeStyles } from "@fluentui/react-theme-provider";

const EmptyCollaborateStyles = makeStyles(() => ({
  menu: {
    borderBottom: "none",
    "& .ui-menu__itemwrapper": {
      paddingLeft: 0,
    },
  },
}));

export default EmptyCollaborateStyles;
