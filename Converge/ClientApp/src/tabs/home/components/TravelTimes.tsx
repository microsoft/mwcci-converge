// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Flex } from "@fluentui/react-northstar";
import dayjs from "dayjs";
import { Icon } from "office-ui-fabric-react";
import React, { useEffect, useState } from "react";
import { useApiProvider } from "../../../providers/ApiProvider";

interface Props {
  start: string,
  end: string,
}

const TravelTimes:React.FC<Props> = (props) => {
  const { start, end } = props;
  const { routeService } = useApiProvider();
  const [driveTime, setDriveTime] = useState("");
  const [transitTime, setTransitTime] = useState("");
  const [isError, setIsError] = useState<boolean>(false);
  useEffect(() => {
    routeService.getRoute(start, end)
      .then((routeResponse) => {
        setDriveTime(dayjs.duration(routeResponse.driveTravelTimeInSeconds, "seconds").humanize());
        setTransitTime(dayjs.duration(routeResponse.transitTravelTimeInSeconds, "seconds").humanize());
      }).catch(() => {
        setIsError(true);
      });
  }, [start, end]);
  return (
    <Flex hAlign="start" gap="gap.small">
      {!isError
      && (
      <>
        <Flex hAlign="start" gap="gap.small">
          <Icon iconName="car" />
          <span>{driveTime}</span>
        </Flex>
        <Flex hAlign="start" gap="gap.small">
          <Icon iconName="bus" />
          <span>{transitTime}</span>
        </Flex>
      </>
      )}
    </Flex>
  );
};

export default TravelTimes;
