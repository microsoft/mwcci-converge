// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Box } from "@fluentui/react-northstar/dist/es/components/Box/Box";
import { Icon } from "office-ui-fabric-react/lib/Icon";
import React, { useState, useEffect } from "react";
import {
  Button, CloseIcon, Dialog, Flex, FormField, FormLabel, Text, TextArea, TextAreaProps,
} from "@fluentui/react-northstar";
import dayjs from "dayjs";
import CalendarEvent from "../../../types/CalendarEvent";
import {
  DESCRIPTION, UISections, UI_SECTION, USER_INTERACTION,
} from "../../../types/LoggerTypes";
import Notifications from "../../../utilities/ToastManager";
import ReservationStyles from "../styles/ReservationStyles";
import {
  useProvider as PlaceFilterProvider,
} from "../../../providers/PlaceFilterProvider";
import { logEvent } from "../../../utilities/LogWrapper";
import { useApiProvider } from "../../../providers/ApiProvider";

interface Props {
  reservation: CalendarEvent,
}

const Reservation: React.FC<Props> = (props) => {
  const { reservation } = props;
  const { calendarService } = useApiProvider();
  const { cancelReservation } = PlaceFilterProvider();
  const [openCancelDialog, setOpenCancelDialog] = React.useState<boolean>(false);
  const [canceling, setCanceling] = React.useState<boolean>(false);
  const [message, setMessage] = React.useState<string>("");
  const [startTime, setStartTime] = React.useState<string>("");
  const [endTime, setEndTime] = React.useState<string>("");
  const [count, setCount] = useState<number | undefined>(250);
  const setMessageCallback = (event: React.SyntheticEvent<HTMLElement, Event>,
    data: TextAreaProps | undefined) => {
    const charLeft = data?.value?.length ? 250 - data?.value?.length : 250;
    setCount(charLeft);
    setMessage(data?.value || "");
  };
  const classes = ReservationStyles();
  const userTimezone = dayjs.tz.guess();

  const cancelEvent = () => {
    setCanceling(true);
    logEvent(USER_INTERACTION, [
      {
        name: UI_SECTION,
        value: UISections.Reservations,
      },
      {
        name: DESCRIPTION,
        value: "cancel_reservation",
      },
    ]);
    calendarService.deleteEvent(reservation.id, message).then(() => {
      Notifications.show({
        duration: 5000,
        title: "You cancelled a reservation.",
        content: `${reservation.buildingName}: ${reservation.location?.displayName} (${dayjs.utc(reservation.start?.dateTime).tz(userTimezone).format("dd, hh:mm A")})`,
      });
      cancelReservation(reservation.id);
      setOpenCancelDialog(false);
    })
      .catch(() => setCanceling(false));
  };

  useEffect(() => {
    setStartTime(dayjs.utc(reservation.start?.dateTime).tz(userTimezone).format("hh:mm"));
    setEndTime(dayjs.utc(reservation.end?.dateTime).tz(userTimezone).format("hh:mm"));
  }, [startTime, endTime]);

  return (
    <Flex className={classes.root} column>
      <Flex>
        <Flex className={classes.reserveBox}>
          {reservation.isWorkspaceBooking ? <Icon iconName="CityNext2" /> : <Icon iconName="Room" />}
          <Box className={classes.reserve}>
            <span className={classes.name} title={`${reservation.buildingName}`}>
              {reservation.buildingName}
            </span>
          </Box>
        </Flex>
        <Dialog
          open={openCancelDialog}
          onOpen={() => setOpenCancelDialog(true)}
          onCancel={() => setOpenCancelDialog(false)}
          headerAction={{
            icon: <CloseIcon />,
            title: "Close",
            onClick: () => {
              setOpenCancelDialog(false);
            },
          }}
          cancelButton="Dismiss"
          confirmButton={{ content: "Send cancellation", loading: canceling }}
          header={(
            <Text
              content="Cancel this event"
              weight="semibold"
              size="large"
              className={classes.headerText}
            />
          )}
          onConfirm={cancelEvent}
          content={(
            <Box styles={{ paddingTop: "0.8rem" }}>
              <Text
                content={reservation.buildingName}
                title={reservation.buildingName}
                weight="bold"
                size="large"
                styles={{ fontFamily: "Segoe UI", fontSize: "24px", lineHeight: "28PX" }}
              />
              <Box styles={{ display: "flex", padding: ".5em 0" }}>
                <Text
                  content={reservation.location?.displayName}
                  weight="regular"
                  size="large"
                  styles={{ fontFamily: "Segoe UI", fontSize: "14px", lineHeight: "16PX" }}
                />
              </Box>
              <Box styles={{
                display: "flex", padding: ".5em 0", fontFamily: "Segoe UI", fontSize: "14px", lineHeight: "16PX",
              }}
              >
                <Text
                  content={`${dayjs.utc(reservation.start?.dateTime).tz(userTimezone).format("ddd, MMMM D")}`}
                  weight="regular"
                  size="large"
                />
                <Text
                  content={`${dayjs.utc(reservation.start?.dateTime).tz(userTimezone).format("hh:mm A")} -  `}
                  weight="regular"
                  size="large"
                  styles={{ paddingLeft: "0.4rem" }}
                />
                <Text
                  content={dayjs.utc(reservation.end?.dateTime).tz(userTimezone).format("hh:mm A")}
                  weight="regular"
                  size="large"
                  styles={{ paddingLeft: "0.4rem" }}
                />
              </Box>
              <Box styles={{ display: "flex", padding: ".5em 0", fontSize: "8px" }} />
              <FormField>
                <Flex space="between">
                  <FormLabel htmlFor="Message" id="Message" className={classes.formLabel}>
                    Message (optional)
                  </FormLabel>
                  <span className={classes.formLabel}>
                    {`${count} characters`}
                  </span>
                </Flex>
                <TextArea
                  fluid
                  variables={{ height: "96px" }}
                  placeholder="Include a message to attendees"
                  maxLength={250}
                  onChange={((event, data) => setMessageCallback(event, data))}
                  value={message}
                />
              </FormField>
            </Box>
          )}
          trigger={(
            <Button
              styles={{ fontSize: "14px", height: "20px" }}
              text
              content={(
                <Text
                  content="Cancel"
                  styles={{ color: "#464775" }}
                />
              )}
            />
          )}
        />
      </Flex>
      <span className={`${classes.name} ${classes.reservationDetails}`} title={`${reservation.location?.displayName}`}>
        {reservation.location?.displayName}
      </span>
      <span className={`${classes.name} ${classes.reservationDetails}`}>
        {dayjs.utc(reservation.start?.dateTime).tz(userTimezone).format("ddd, MMMM D")}
        :&nbsp;
        {reservation.isAllDay
          ? "All day" : (
            `${dayjs.utc(reservation.start?.dateTime).tz(userTimezone).format("hh:mm A")} - ${dayjs.utc(reservation.end?.dateTime).tz(userTimezone).format("hh:mm A")}`
          )}
      </span>
    </Flex>
  );
};

export default Reservation;
