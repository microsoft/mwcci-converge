// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Box } from "@fluentui/react-northstar";
import React from "react";

const CenterAlignBox:React.FC = (props) => {
  const { children } = props;
  return (
    <Box styles={{
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1em 0",
    }}
    >
      {children}
    </Box>
  );
};

export default CenterAlignBox;
