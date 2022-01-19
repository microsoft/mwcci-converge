// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { makeStyles } from "@fluentui/react-theme-provider";

const AvailabilityChartStyles = makeStyles(() => ({
  root: {
    transform: "translateY(-30px)",
    pointerEvents: "none",
    width: "300px",
    height: "200px",
  },
  availability: {
    fontSize: "38px",
    fontWeight: "bold",
    transform: "translateY(-168px)",
  },
  legendContainer: {
    transform: "translateY(-168px)",
  },
  legends: {
    marginBottom: "4px",
    padding: "0",
  },
  colorBox: {
    height: "8px",
    width: "8px",
    marginRight: "4px",
  },
  percentLegend: {
    fontSize: "10px",
    color: "#76767B",
  },
  availLegend: {
    fontSize: "12px",
    color: "#252424",
  },
  data: {
    fontSize: "11px",
  },
}));

export default AvailabilityChartStyles;
