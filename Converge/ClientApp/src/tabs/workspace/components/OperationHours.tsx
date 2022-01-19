// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useBoolean } from "@fluentui/react-hooks";
import {
  TriangleUpIcon, TriangleDownIcon, InfoIcon,
} from "@fluentui/react-icons-northstar";
import { Flex, Button } from "@fluentui/react-northstar";
import dayjs, { Dayjs } from "dayjs";
import { Icon } from "office-ui-fabric-react";
import React from "react";
import {
  UI_SECTION, UISections, DESCRIPTION, USER_INTERACTION,
} from "../../../types/LoggerTypes";
import OperationHoursForDay from "../../../types/OperationHoursForDay";
import OperationHoursForWeek from "../../../types/OperationHoursForWeek";
import TimeLimit from "../../../types/TimeLimit";
import { logEvent } from "../../../utilities/LogWrapper";
import OperationHoursStyles from "../styles/OperationHoursStyles";

interface Props {
  operatingHours: OperationHoursForWeek;
}

const getTime = (time: string): Dayjs => {
  const hourMinute = time.split(":");
  return dayjs().set("hour", Number(hourMinute[0])).set("minute", Number(hourMinute[1]));
};

const getClosingTime = (times: OperationHoursForDay[]): string => {
  const today = dayjs().format("dddd");
  const todaysTimes = times.find((time) => time.day === today);
  if (todaysTimes) {
    const closingIndex = todaysTimes.operationHours.length - 1;
    return getTime(todaysTimes.operationHours[closingIndex].end).format("h:mm A");
  }
  return "";
};

const getIsOpen = (times: OperationHoursForDay[]): boolean => {
  const now = dayjs();
  const today = now.format("dddd");
  const todaysTimes = times.find((time) => time.day === today);
  let isOpen = false;
  if (todaysTimes) {
    todaysTimes.operationHours.forEach((tt: TimeLimit) => {
      const start = getTime(tt.start);
      const end = getTime(tt.end);
      if (now.isBefore(end) && now.isAfter(start)) {
        isOpen = true;
      }
    });
    return isOpen;
  }
  return false;
};

const OperationHours: React.FC<Props> = (props) => {
  const { operatingHours } = props;
  const [showFullHours, { toggle }] = useBoolean(false);
  const classes = OperationHoursStyles();
  return (
    <>
      <li className={classes.list}>
        <Icon iconName="Clock" />
        {getIsOpen(operatingHours.operationHoursForDayList) ? (
          <Flex className={classes.open} vAlign="center">
            Open
            <Icon iconName="LocationDot" />
          </Flex>
        ) : (
          <Flex className={classes.closed} vAlign="center">
            Closed
            <Icon iconName="LocationDot" />
          </Flex>
        )}
        <span>
          {getIsOpen(operatingHours.operationHoursForDayList) && (
          <>
            Closes
            {" "}
            {getClosingTime(operatingHours.operationHoursForDayList)}
          </>
          )}
        </span>
        <Button
          text
          onClick={() => {
            toggle();
            logEvent(USER_INTERACTION, [
              { name: UI_SECTION, value: UISections.PlaceDetails },
              { name: DESCRIPTION, value: "show_full_place_hours" },
            ]);
          }}
          size="small"
          icon={showFullHours ? <TriangleUpIcon size="larger" /> : <TriangleDownIcon size="larger" />}
        />
        <span>
          <InfoIcon size="medium" />
          {" "}
          Hours may vary
        </span>
      </li>
      {showFullHours && (
      <div className={classes.hours}>
        {operatingHours.operationHoursForDayList
          .map((o) => (
            <Flex gap="gap.large">
              <span className={classes.day}>{o.day}</span>
              {o.operationHours
                .map((t) => (
                  <span>
                    {getTime(t.start).format("h:mm A")}
                    {" "}
                    -
                    {" "}
                    {getTime(t.end).format("h:mm A")}
                  </span>
                ))}
            </Flex>
          ))}
      </div>
      )}
    </>
  );
};

export default OperationHours;
