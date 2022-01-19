// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { makeStyles } from "@fluentui/react-theme-provider";

const UserSearchDropdownStyles = makeStyles(() => ({
  root: {
    "& .ui-dropdown__selected-items .ui-button .ui-button__content": {
      fontSize: "14px",
      fontWeight: "normal",
    },
    "& .ui-dropdown__selecteditem .ui-dropdown__selecteditem__header": {
      fontSize: "14px",
      fontWeight: "normal",
    },
  },
}));

export default UserSearchDropdownStyles;
