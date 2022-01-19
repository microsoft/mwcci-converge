// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from "react";
import { Flex } from "@fluentui/react-northstar";
import capacityUtils from "../../../utilities/capacityUtils";

interface Props {
  availableSpace: number;
}

const BuildingCapacity: React.FC<Props> = (props) => {
  const {
    availableSpace,
  } = props;
  const capacityIcon = capacityUtils.getCapacityIcon(availableSpace);
  return (
    <Flex
      style={{
        color: capacityUtils.getCapacityIconColor(availableSpace),
        fontSize: "10px",
      }}
    >
      {capacityIcon}
      {" "}
      {capacityUtils.getCapacityName(availableSpace)}
    </Flex>
  );
};

export default BuildingCapacity;
