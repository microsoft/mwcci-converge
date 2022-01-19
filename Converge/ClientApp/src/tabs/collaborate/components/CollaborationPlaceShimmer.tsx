// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IShimmerColors,
  IShimmerElement,
  Shimmer,
  ShimmerElementType,
} from "@fluentui/react";
import { Flex } from "@fluentui/react-northstar";
import React from "react";
import CollaborationPlaceShimmerStyles from "../styles/CollaborationPlaceShimmerStyles";

interface Props {
  numRows?: number;
}

const CollaborationPlaceShimmer: React.FC<Props> = ({ numRows = 1 }) => {
  const containerStyles = CollaborationPlaceShimmerStyles(numRows).map((styles) => styles());
  const generateResultRows = () => {
    const rows: IShimmerElement[][] = [];
    for (let i = 0; i < numRows; i += 1) {
      // Generate Scrollbar on first row.
      rows.push(i === 0 ? [
        {
          type: ShimmerElementType.line,
          width: "calc(100% - 28px)",
          height: 148,
        },
        {
          type: ShimmerElementType.gap,
          width: "16px",
        },
        {
          type: ShimmerElementType.line,
          width: "8px",
          height: 102,
          verticalAlign: "top",
        },
        {
          type: ShimmerElementType.gap,
          width: "4px",
        },
      ] : [
        {
          type: ShimmerElementType.line,
          width: "calc(100% - 28px)",
          height: 148,
        },
        {
          type: ShimmerElementType.gap,
          width: "28px",
        },
      ]);
    }
    return rows;
  };

  const shimmerElementRows: IShimmerElement[][] = [
    [
      // title text
      {
        type: ShimmerElementType.line,
        width: "148px",
        height: 20,
        verticalAlign: "top",
      },
      {
        type: ShimmerElementType.gap,
        width: "calc(100% - 180px)",
      },
      // collapse icon
      {
        type: ShimmerElementType.circle,
        width: "32px",
        height: 32,
      },
    ],
    [
      // result set text
      {
        type: ShimmerElementType.line,
        width: "64px",
        height: 16,
      },
      {
        type: ShimmerElementType.gap,
        width: "calc(100% - 64px)",
        height: 32,
      },
    ],
    // Generate duplicate rows
    ...generateResultRows(),
  ];

  const shimmerColors: IShimmerColors = {
    shimmer: "#dfdfdf",
    shimmerWave: "#fafafa",
    background: "#f5f5f5",
  };
  return (
    <Flex column>
      {shimmerElementRows.map((rowElements, index) => (
        <div className={containerStyles[index].root}>
          <Shimmer shimmerElements={rowElements} shimmerColors={shimmerColors} />
        </div>
      ))}
    </Flex>
  );
};

export default CollaborationPlaceShimmer;
