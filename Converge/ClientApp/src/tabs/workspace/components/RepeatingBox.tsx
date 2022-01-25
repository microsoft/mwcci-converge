// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Box } from "@fluentui/react-northstar";
import React from "react";
import { useProvider as PlaceProvider } from "../../../providers/PlaceFilterProvider";
import PlacesStyles from "../styles/PlacesStyles";

const RepeatingBox:React.FC = (props) => {
  const { children } = props;
  const { state } = PlaceProvider();
  const classes = PlacesStyles();
  return (
    <Box
      styles={{
        width: "100%",
        display: "grid",
        gap: "14px",
        gridTemplateColumns: "repeat(auto-fill, 32%)",
        "@media (min-width: 1366px)": {
          gridTemplateColumns: "repeat(auto-fill, 310px)",
        },
      }}
      className={state.location === undefined ? classes.cardBox : classes.placeCardBox}
    >
      {children}
    </Box>
  );
};

export default RepeatingBox;
