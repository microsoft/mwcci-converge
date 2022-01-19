// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Box } from "@fluentui/react-northstar";
import React from "react";

const RepeatingBox:React.FC = (props) => {
  const { children } = props;
  return (
    <Box styles={{
      width: "100%",
      display: "grid",
      gap: "14px",
      gridTemplateColumns: "repeat(auto-fill, 32%)",
      "@media (min-width: 1366px)": {
        gridTemplateColumns: "repeat(auto-fill, 310px)",
      },
    }}
    >
      {children}
    </Box>
  );
};

export default RepeatingBox;
