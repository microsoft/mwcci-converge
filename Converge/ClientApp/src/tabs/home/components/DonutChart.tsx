// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from "react";
import { VictoryPie } from "victory";
import Schedule from "../../../types/Schedule";
import capacityUtils from "../../../utilities/capacityUtils";
import "./donutChartFix.css";

interface Props {
  schedule: Schedule;
  data: { x: number; y: number }[];
}

const DonutChart: React.FC<Props> = (props) => {
  const { schedule, data } = props;

  return (
    <div className="donut-chart-fix">
      <VictoryPie
        colorScale={[
          "#D9DBDB",
          "#76767B",
          capacityUtils.getCapacityColor(schedule.available),
        ]}
        startAngle={-90}
        endAngle={90}
        data={data}
        innerRadius={80}
        width={300}
        height={300}
        padding={{ top: 50 }}
        labels={() => ""}
        style={{
          data: { stroke: "white", strokeWidth: 1 },
        }}
      />
    </div>
  );
};

export default DonutChart;
