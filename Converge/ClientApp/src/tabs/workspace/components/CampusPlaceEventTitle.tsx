// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Flex } from "@fluentui/react-northstar/dist/es/components/Flex/Flex";
import React, { useEffect, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { Icon } from "office-ui-fabric-react";
import ExchangePlace from "../../../types/ExchangePlace";
import CampusPlaceEventTitleStyles from "../styles/CampusPlaceEventTitleStyles";
import { useApiProvider } from "../../../providers/ApiProvider";

interface Props {
  place: ExchangePlace,
  date?: Date,
  start?: Dayjs,
  end?: Dayjs,
  isAllDay: boolean,
}

const CampusPlaceEventTitle:React.FC<Props> = (props) => {
  const { placeService } = useApiProvider();
  const classes = CampusPlaceEventTitleStyles();
  const {
    place,
    date,
    start,
    end,
    isAllDay,
  } = props;
  const [isAvailable, setIsAvailable] = useState<boolean>(true);

  useEffect(() => {
    let startDay = dayjs(dayjs(date)
      .hour(start?.hour() ?? 0)
      .minute(start?.minute() ?? 0)
      .format("MM-DD-YYYY h:mm A"));
    let endDay = dayjs(dayjs(date)
      .hour(end?.hour() ?? 0)
      .minute(end?.minute() ?? 0)
      .format("MM-DD-YYYY h:mm A"));
    if (isAllDay) {
      startDay = dayjs(dayjs(date).format("MM-DD-YYYY"));
      endDay = dayjs(startDay).add(1, "day");
    }
    placeService.getRoomAvailability(
      place.identity,
      startDay.utc().toISOString(),
      endDay.utc().toISOString(),
    ).then(setIsAvailable);
  }, [isAllDay, start, end, date]);

  return (
    <Flex vAlign="end" className={classes.titleWrapper}>
      <h1 className={classes.title}>
        {`${place?.displayName} `}
      </h1>
      <Flex
        styles={{ fontSize: "12px" }}
        gap="gap.small"
        className={classes.lightTheme}
      >
        <span>{place.building}</span>
        {place?.floor && (
        <>
          <span>
            |
          </span>
          <span>
            {`Floor ${place?.floor}`}
          </span>
        </>
        )}
        {place?.capacity && (
        <>
          <span>|</span>
          <span>
            <Icon iconName="contact" />
            {" "}
            <span>{place.capacity}</span>
          </span>
        </>
        )}
      </Flex>
      <div className={classes.availability}>
        <Flex hAlign="end" style={{ color: isAvailable ? "#237B4B" : "red", paddingTop: ".5em" }}>
          <Icon iconName="completed" className={classes.completedIcon} />
          <span className={classes.availabilityText}>
            <span>{isAvailable ? "Available" : "Unavailable"}</span>
          </span>
        </Flex>
      </div>
    </Flex>
  );
};

export default CampusPlaceEventTitle;
