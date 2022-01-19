// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from "react";
import { Flex, Box } from "@fluentui/react-northstar";
import Schedule from "../../../types/Schedule";
import DonutChart from "./DonutChart";
import capacityUtils from "../../../utilities/capacityUtils";
import AvailabilityChartStyles from "../styles/AvailabilityChartStyles";

interface Props {
  schedule: Schedule;
}

const AvailabilityChart: React.FC<Props> = (props) => {
  const { schedule } = props;
  const classes = AvailabilityChartStyles();
  const data: { x: number; y: number; color: string; l: string }[] = [
    {
      x: 1,
      y: schedule.occupied,
      color: "#D9DBDB",
      l: "Occupied",
    },
    {
      x: 2,
      y: schedule.reserved,
      color: "#76767B",
      l: "Reserved",
    },
    {
      x: 3,
      y: schedule.available,
      color: capacityUtils.getCapacityColor(schedule.available),
      l: "Available",
    },
  ];

  return (
    <Box className={classes.root}>
      <DonutChart schedule={schedule} data={data} />
      <Flex
        hAlign="center"
        className={classes.availability}
      >
        {`${Math.round(schedule.available)}%`}
      </Flex>
      <Flex
        vAlign="center"
        column
        className={classes.legendContainer}
      >
        <Flex space="around" className={classes.legends}>
          <span className={classes.percentLegend}>0%</span>
          <span className={classes.availLegend}>Available</span>
          <span className={classes.percentLegend}>100%</span>
        </Flex>
        <Flex space="around">
          {data.map((p) => (
            <Flex
              space="around"
              vAlign="center"
              className={classes.data}
              key={p.x}
            >
              <Box
                style={{
                  backgroundColor: p.color,
                }}
                className={classes.colorBox}
              />
              {p.l}
            </Flex>
          ))}
        </Flex>
      </Flex>
    </Box>
  );
};

export default AvailabilityChart;
