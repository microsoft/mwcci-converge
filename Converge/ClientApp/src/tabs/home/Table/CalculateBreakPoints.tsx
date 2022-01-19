// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export type Column = {
  priority: number;
  minWidth: number;
  childIndex?: number;
};

export type Breakpoint = Record<string, Column[]> | undefined;

export default function calculateBreakpoints(config: Column[], breakpoints: number[]): Breakpoint {
  const minTableSize = config.reduce((acc, curr) => acc + curr.minWidth, 0);
  const breaks: Breakpoint = {};

  const configsWithIndex: Column[] = config.map((column, i) => ({ ...column, childIndex: i + 1 }));
  const tempConfig = configsWithIndex.sort((a, b) => a.priority - b.priority);

  breakpoints.forEach((breakPoint) => {
    let tempMinTableSize = minTableSize;
    for (let i = 0; tempMinTableSize > breakPoint; i += 1) {
      const currColumn = configsWithIndex.find(
        (column) => tempConfig[i].priority === column.priority,
      );

      if (currColumn) {
        breaks[breakPoint] = breaks[breakPoint]
          ? [...breaks[breakPoint], currColumn] : [currColumn];
        tempMinTableSize -= tempConfig[i].minWidth;
      }
    }
  });

  return breaks;
}
