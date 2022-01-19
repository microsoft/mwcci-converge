// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { makeStyles } from "@fluentui/react-theme-provider";

const CollaborationPlaceShimmerStyles = (numRows: number): ReturnType<typeof makeStyles>[] => {
  const rows = [];
  for (let i = 0; i < numRows; i += 1) {
    rows.push({ margin: "8px 0 0 0" });
  }
  return [
    { margin: "24px 0 0 0" },
    { margin: "0 0 2px 0" },
    // Result item rows
    ...rows,
  ].map((styles) => makeStyles(() => ({ root: styles })));
};

export default CollaborationPlaceShimmerStyles;
