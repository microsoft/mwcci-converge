// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Box } from "@fluentui/react-northstar";
import React from "react";

const CollaborationPlacesRepeatingBox:React.FC = (props) => {
  const { children } = props;
  return (
    <Box styles={{
      width: "250px",
      display: "grid",
      gap: "8px",
      gridTemplateColumns: "repeat(auto-fill, 310px)",
      "@media (min-width: 1415px)": {
        maxWidth: "100%",
      },
      "@media (max-width: 968px)": {
        maxWidth: "100%",
        gridTemplateColumns: "repeat(auto-fill, 310px)",
      },
    }}
    >
      {children}
    </Box>
  );
};

export default CollaborationPlacesRepeatingBox;
