// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from "react";
import {
  CheckmarkCircleIcon, ExclamationTriangleIcon, ExclamationCircleIcon, SvgIconProps,
} from "@fluentui/react-icons-northstar";
import Capacity from "../types/Capacity";

const capacityUtils = {
  getCapacity(availableSpace: number):Capacity {
    let availability = Capacity.Available;
    if (availableSpace <= 30) {
      availability = Capacity.Limited;
    }
    if (availableSpace <= 10) {
      availability = Capacity.Full;
    }
    return availability;
  },

  getCapacityIcon(availableSpace: number):JSX.Element {
    const capacity = this.getCapacity(availableSpace);
    const iconComponents: {[TKey in Capacity]: React.FC<
      React.HTMLAttributes<HTMLSpanElement> & SvgIconProps
      >} = {
        [Capacity.Full]: ExclamationTriangleIcon,
        [Capacity.Limited]: ExclamationCircleIcon,
        [Capacity.Available]: CheckmarkCircleIcon,
      };
    const CapacityIcon = iconComponents[capacity];
    if (!CapacityIcon) {
      return <div />;
    }
    return <CapacityIcon outline size="small" style={{ marginRight: "4px" }} />;
  },
  getCapacityColor(availability: number): string {
    const capacity = this.getCapacity(availability);
    const colors: {[TKey in Capacity]: string} = {
      [Capacity.Full]: "#C4314B",
      [Capacity.Limited]: "#F7E227",
      [Capacity.Available]: "#6BB700",
    };
    return colors[capacity] || "#237B4B";
  },
  getCapacityIconColor(availability: number): string {
    const capacity = this.getCapacity(availability);
    const colors: {[TKey in Capacity]: string} = {
      [Capacity.Full]: "#C4314B",
      [Capacity.Limited]: "#A16114",
      [Capacity.Available]: "#237B4B",
    };
    return colors[capacity] || "#237B4B";
  },
  getCapacityName(availability: number): string {
    const capacity = this.getCapacity(availability);
    const names: {[TKey in Capacity]: string} = {
      [Capacity.Full]: "FULL",
      [Capacity.Limited]: "Limited",
      [Capacity.Available]: "Available",
    };
    return names[capacity] || "";
  },
};

export default capacityUtils;
