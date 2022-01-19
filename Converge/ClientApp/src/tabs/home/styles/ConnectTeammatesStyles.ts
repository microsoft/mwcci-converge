// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { makeStyles } from "@fluentui/react-theme-provider";

const ConnectTeammatesStyles = makeStyles(() => ({
  root: {
    marginTop: "16px",
  },
  header: {
    "& > div": {
      marginBottom: "1em",
    },
  },
  datePickerStyles: {
    "& .ui-input__input": {
      width: "135px",
    },
  },
  search: {
    input: {
      borderRadius: "4px",
    },
  },
}));

export default ConnectTeammatesStyles;
