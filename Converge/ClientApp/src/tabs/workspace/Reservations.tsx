// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from "react";
import dayjs from "dayjs";
import {
  Label, Box, Loader, Text, ErrorIcon, Button, Flex, DatepickerProps, ArrowRightIcon,
} from "@fluentui/react-northstar";
import DisplayBox from "../home/DisplayBox";
import Reservation from "./components/Reservation";
import { logEvent } from "../../utilities/LogWrapper";
import {
  USER_INTERACTION, UISections, UI_SECTION, DESCRIPTION,
} from "../../types/LoggerTypes";
import CenterAlignBox from "../../utilities/CenterAlignBox";
import {
  useProvider as PlaceFilterProvider,
} from "../../providers/PlaceFilterProvider";
import ReservationsStyles from "./styles/ReservationsStyles";
import DatePickerPrimary from "../../utilities/datePickerPrimary";
import IsThisHelpful from "../../utilities/IsThisHelpful";

const Reservations: React.FC = () => {
  const {
    state,
    loadUpcomingReservations,
    setUpcomingReservationEndDate,
    setUpcomingReservationStartDate,
    setUpcomingReservationSkip,
  } = PlaceFilterProvider();
  const classes = ReservationsStyles();

  const refreshReservations = () => {
    loadUpcomingReservations(
      state.upcomingReservationsStartDate,
      state.upcomingReservationsEndDate,
    );
  };

  const onClickShowMore = () => {
    setUpcomingReservationSkip(state.upcomingReservationsSkip + 10);
  };

  const handleDatePickerStartChange = (
    event: React.SyntheticEvent, data: (DatepickerProps & { value: Date; }) | undefined,
  ) => {
    const newStart = dayjs(`${dayjs(data?.value).format("MM-DD-YYYY")} ${state.upcomingReservationsStartDate.format("h:mm A")}`, "MM-DD-YYYY h:mm A");
    setUpcomingReservationStartDate(newStart);
    logEvent(USER_INTERACTION, [
      { name: UI_SECTION, value: UISections.Reservations },
      { name: DESCRIPTION, value: "change_reservation_duration" },
    ]);
  };
  const handleDatePickerEndChange = (
    event: React.SyntheticEvent, data: (DatepickerProps & { value: Date; }) | undefined,
  ) => {
    const newEnd = dayjs(`${dayjs(data?.value).format("MM-DD-YYYY")} ${state.upcomingReservationsEndDate.format("h:mm A")}`, "MM-DD-YYYY h:mm A");
    setUpcomingReservationEndDate(newEnd);
    logEvent(USER_INTERACTION, [
      { name: UI_SECTION, value: UISections.Reservations },
      { name: DESCRIPTION, value: "change_reservation_duration" },
    ]);
  };

  return (
    <DisplayBox
      descriptionContent={`Last updated ${dayjs().format("dddd, MMM D [a]t h:mm A (PST)")}`}
      headerContent="Reservations"
      gridArea="Reservations"
      height="560px"
    >
      <Box className={classes.root}>
        <Box>
          <Label content="From" color="white" className={classes.duration} />
          <Label content="To" color="white" className={classes.duration} styles={{ marginLeft: "9.4rem" }} />
          <Box className={classes.datePickerStyles}>
            <Flex>
              <DatePickerPrimary
                selectedDate={state.upcomingReservationsStartDate.toDate()}
                onDateChange={handleDatePickerStartChange}
              />
              <ArrowRightIcon styles={{ marginLeft: "1.5rem", marginTop: "0.5rem" }} />
              <Flex styles={{ marginLeft: "1.5rem" }}>
                <DatePickerPrimary
                  selectedDate={state.upcomingReservationsEndDate.toDate()}
                  onDateChange={handleDatePickerEndChange}
                />
              </Flex>
            </Flex>
          </Box>
        </Box>

        {state.upcomingReservationsList?.length > 0
          && (
            <Box className={classes.reservationsBox}>
              {state.upcomingReservationsList.map((reservation) => (
                <Reservation
                  reservation={reservation}
                  key={reservation.id}
                />
              ))}
            </Box>
          )}
        {state.reservationsListLoading && <Loader />}
        {!state.reservationsListLoading && state.reservationsListError
          && (
            <>
              <Box styles={{ paddingLeft: "4rem" }}>
                <ErrorIcon />
                <Text content="Something went wrong." color="red" styles={{ paddingLeft: "0.4rem" }} />
                <Button
                  content="Refresh"
                  text
                  onClick={() => {
                    refreshReservations();
                    logEvent(USER_INTERACTION, [
                      {
                        name: UI_SECTION,
                        value: UISections.Reservations,
                      },
                      { name: DESCRIPTION, value: "refreshReservations" },
                    ]);
                  }}
                  color="red"
                  styles={{
                    minWidth: "0px !important", paddingTop: "0.2rem", marginBottom: "0.2rem", textDecoration: "UnderLine", color: "rgb(196, 49, 75)",
                  }}
                />
              </Box>
            </>
          )}
        {!state.reservationsListLoading && !state.reservationsListError
          && state.upcomingReservationsList.length === 0
          && <CenterAlignBox>You have no reservations in this date range.</CenterAlignBox>}
      </Box>
      <Box>
        <Flex>
          <IsThisHelpful logId="b753b649" sectionName={UISections.Reservations} />
          {" "}
          <Box styles={{ marginTop: "0.8rem" }}>
            <Button
              content="Show More"
              text
              disabled={!state.loadMoreUpcomingReservations}
              onClick={() => {
                onClickShowMore();
                logEvent(USER_INTERACTION, [
                  { name: UI_SECTION, value: UISections.Reservations },
                  { name: DESCRIPTION, value: "onClickShowMore" },
                ]);
              }}
              styles={{ right: "1.5em", position: "absolute", color: "#464775" }}
            />
          </Box>
        </Flex>
      </Box>
    </DisplayBox>
  );
};
export default Reservations;
