// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useEffect, useState } from "react";
import {
  Image, Box, Button, Dialog, Flex, Provider, SiteVariablesPrepared, Text,
} from "@fluentui/react-northstar";
import { CloseIcon } from "@fluentui/react-icons-northstar";
import * as MicrosoftGraph from "@microsoft/microsoft-graph-types";
import { Icon } from "office-ui-fabric-react";
import dayjs, { Dayjs } from "dayjs";
import BookPlaceModal from "./BookPlaceModal";
import ExchangePlace, { PlaceType } from "../../../types/ExchangePlace";
import { useProvider as PlaceProvider, useProvider as PlaceFilterProvider } from "../../../providers/PlaceFilterProvider";
import { logEvent } from "../../../utilities/LogWrapper";
import {
  UI_SECTION, UISections, USER_INTERACTION, DESCRIPTION,
} from "../../../types/LoggerTypes";
import NewConfRoomEvent from "./NewConfRoomEvent";
import { createEvent } from "../../../api/calendarService";
import Notifications from "../../../utilities/ToastManager";
import ImagePlaceholder from "../../../utilities/ImagePlaceholder";
import PlaceCardStyles from "../styles/PlaceCardStyles";
import { updateMyPredictedLocation } from "../../../api/meService";
import { usePlacePhotos } from "../../../providers/PlacePhotosProvider";
import { useConvergeSettingsContextProvider } from "../../../providers/ConvergeSettingsProvider";
import { AddRecentBuildings } from "../../../utilities/RecentBuildingsManager";
import getPlaceMaxReserved, { getRoomAvailability } from "../../../api/placeService";

type Props = {
  place: ExchangePlace,
  buildingName: string,
};

const PlaceCard: React.FC<Props> = (props) => {
  const { place, buildingName } = props;
  const classes = PlaceCardStyles();
  const {
    convergeSettings,
    setConvergeSettings,
  } = useConvergeSettingsContextProvider();
  const { createReservation } = PlaceFilterProvider();
  const [open, setOpen] = useState<boolean>(false);
  const [newEventDialogOpen, setNewEventDialogOpen] = useState<boolean>(false);
  const [bookable, setBookable] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [err, setErr] = useState<string | undefined>(undefined);
  const { state, loadUpcomingReservations } = PlaceProvider();
  const [start, setStart] = useState<Dayjs>(state.startDate);
  const [end, setEnd] = useState<Dayjs>(state.endDate);
  const [isAllDay, setIsAllDay] = useState<boolean>(false);
  const [isFlexibleSeating, setIsFlexibleSeating] = useState<boolean | undefined>(false);
  const [availability, setAvailability] = useState(0);
  const [isAvailable, setIsAvailable] = useState(false);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);

  const [,
    placePhotos,,
    getPlacePhotos,
  ] = usePlacePhotos();
  const photoUrl = placePhotos?.[0].coverPhoto?.url;
  useEffect(() => {
    if (place.sharePointID) {
      getPlacePhotos([place.sharePointID]);
    }
  }, [place.sharePointID]);

  useEffect(() => {
    setEnd(state.endDate);
  }, [state.endDate]);

  useEffect(() => {
    setStart(state.startDate);
  }, [state.startDate]);

  const clearPlaceCard = () => {
    setStart(state.startDate);
    setEnd(state.endDate);
    setIsAllDay(false);
    return state.startDate;
  };

  const getAvailability = () => {
    setAvailabilityLoading(true);
    if (state.startDate.utc().toISOString() <= state.endDate.utc().toISOString()) {
      if (place.type === PlaceType.Space) {
        getPlaceMaxReserved(
          place.identity,
          (state.startDate).utc().toISOString(),
          (state.endDate).utc().toISOString(),
        ).then((maxReserved) => {
          setAvailability(place.capacity - maxReserved);
        })
          .finally(() => setAvailabilityLoading(false));
      } else {
        getRoomAvailability(
          place.identity,
          (state.startDate).utc().toISOString(),
          (state.endDate).utc().toISOString(),
        ).then((roomIsAvailable) => {
          setIsAvailable(roomIsAvailable);
        }).finally(() => setAvailabilityLoading(false));
      }
    }
  };

  useEffect(() => {
    getAvailability();
  }, [place, state.startDate, state.endDate]);

  useEffect(() => {
    setIsFlexibleSeating(place?.displayName?.toLowerCase().startsWith("flex space"));
  }, [place]);

  const isWorkspace = place.type === PlaceType.Space;

  return (
    <Box
      className={classes.lightCard}
      key={place.identity}
    >
      <Box>
        {
          !photoUrl
            ? <ImagePlaceholder width="100%" height="123px" borderRadius="5px 5px 0 0" fluid />
            : (
              <Box className={classes.imgWrapper}>
                <Image
                  className={classes.imageContainer}
                  fluid
                  src={photoUrl}
                />
              </Box>
            )
        }
      </Box>
      <Flex space="between" gap="gap.small" padding="padding.medium" vAlign="start" hAlign="center">
        <Flex
          column
          className={classes.detailsWrapper}
        >
          <Box
            className={classes.displayName}
            title={place.displayName}
          >
            {place.displayName}
          </Box>
          <Flex className={classes.lightTheme} styles={{ fontSize: "12px" }} gap="gap.smaller">
            <span className={classes.buildingName} title={buildingName}>
              {buildingName}
            </span>
            {place.floor
              && (
                <>
                  <span>|</span>
                  <span>
                    Floor
                    {" "}
                    {place.floor}
                  </span>
                </>
              )}
            {!isWorkspace
              && (
                <>
                  <span>|</span>
                  <Icon iconName="contact" />
                  <span>{place.capacity}</span>
                </>
              )}
          </Flex>
        </Flex>
        <Box>
          <Provider
            theme={{
              componentVariables: {
                Dialog: ({ colorScheme }: SiteVariablesPrepared) => ({
                  rootWidth: "795px",
                  headerFontSize: "18px",
                  rootBackground: colorScheme.default.background,
                  color: colorScheme.default.background3,
                }),
              },
            }}
          >
            <>
              <Dialog
                open={open}
                onOpen={() => {
                  logEvent(USER_INTERACTION, [
                    { name: UI_SECTION, value: UISections.BookPlaceModal },
                    { name: DESCRIPTION, value: "open_modal" },
                  ]);
                  setOpen(true);
                }}
                onCancel={() => {
                  logEvent(USER_INTERACTION, [
                    { name: UI_SECTION, value: UISections.BookPlaceModal },
                    { name: DESCRIPTION, value: "cancel_modal" },
                  ]);
                  clearPlaceCard();
                  setOpen(false);
                }}
                onConfirm={() => {
                  logEvent(USER_INTERACTION, [
                    { name: UI_SECTION, value: UISections.BookPlaceModal },
                    { name: DESCRIPTION, value: "confirm_modal" },
                  ]);
                  if (place.type === PlaceType.Room) {
                    setOpen(false);
                    setNewEventDialogOpen(true);
                  }
                  if (place.type === PlaceType.Space) {
                    setLoading(true);
                    let startDate = start.utc().toDate();
                    let endDate = end.utc().toDate();
                    if (isAllDay) {
                      startDate = dayjs(start.format("YYYY-MM-DD")).toDate();
                      endDate = dayjs(end.add(1, "day").format("YYYY-MM-DD")).toDate();
                    }
                    createEvent({
                      isAllDay,
                      start: startDate,
                      end: endDate,
                      attendees: [{
                        emailAddress: place.identity,
                        type: "resource" as MicrosoftGraph.AttendeeType,
                      }],
                      location: {
                        displayName: place.displayName,
                        locationEmailAddress: place.identity,
                        locationType: "conferenceRoom",
                      },
                      title: "Converge Workspace Booking",
                      showAs: "free" as MicrosoftGraph.FreeBusyStatus,
                    })
                      .then((calendarEvent) => {
                        const newSettings = {
                          ...convergeSettings,
                          recentBuildingUpns: AddRecentBuildings(
                            convergeSettings?.recentBuildingUpns,
                            place.locality,
                          ),
                        };
                        setConvergeSettings(newSettings);
                        createReservation(calendarEvent);
                        return updateMyPredictedLocation({
                          year: dayjs.utc(startDate).year(),
                          month: dayjs.utc(startDate).month() + 1,
                          day: dayjs.utc(startDate).date(),
                          userPredictedLocation: {
                            campusUpn: place.locality,
                          },
                        });
                      })
                      .then(() => {
                        clearPlaceCard();
                        setOpen(false);
                        getAvailability();
                        loadUpcomingReservations(
                          state.upcomingReservationsStartDate,
                          state.upcomingReservationsEndDate,
                        );
                        Notifications.show({
                          duration: 5000,
                          title: "You reserved a workspace.",
                          content: `${place?.displayName} (${dayjs(startDate).format("ddd @ h:mm A")})`,
                        });
                      })
                      .catch(() => {
                        setErr("Something went wrong with your workspace reservation. Please try again.");
                      })
                      .finally(() => {
                        setLoading(false);
                      });
                  }
                }}
                confirmButton={{
                  content: isWorkspace ? "Reserve" : "Create event",
                  disabled: !bookable,
                  loading,
                }}
                cancelButton="Cancel"
                content={(
                  <BookPlaceModal
                    place={place}
                    bookable={bookable}
                    setBookable={setBookable}
                    buildingName={buildingName}
                    err={err}
                    start={start}
                    end={end}
                    setStart={setStart}
                    setEnd={setEnd}
                    isAllDay={isAllDay}
                    setIsAllDay={setIsAllDay}
                    isFlexible={isFlexibleSeating}
                  />
                )}
                header={(
                  <Text
                    as="h2"
                    content={`Book a ${isWorkspace ? "workspace" : "meeting room"}`}
                    styles={{ fontSize: "18px", color: "#252525", fontWeight: "normal" }}
                    className={classes.lightTheme}
                  />
                )}
                headerAction={{
                  icon: <CloseIcon />,
                  title: "Close",
                  onClick: () => {
                    clearPlaceCard();
                    logEvent(USER_INTERACTION, [
                      { name: UI_SECTION, value: UISections.BookPlaceModal },
                      { name: DESCRIPTION, value: "close_modal" },
                    ]);
                    setOpen(false);
                  },
                }}
                trigger={(
                  <Button
                    className={classes.triggerBtn}
                    loading={availabilityLoading}
                    content={(
                      <>
                        {!availabilityLoading && isWorkspace && `${availability} available`}
                        {(!availabilityLoading && !isWorkspace) && `${!isAvailable ? "Unavailable" : "Available"}`}
                      </>
                    )}
                  />
                )}
                className={classes.dialog}
              />
              <NewConfRoomEvent
                open={newEventDialogOpen}
                setOpen={setNewEventDialogOpen}
                place={place}
                start={start}
                end={end}
                setStart={setStart}
                setEnd={setEnd}
                clearPlaceCard={clearPlaceCard}
                getAvailability={getAvailability}
              />
            </>
          </Provider>

        </Box>
      </Flex>
    </Box>
  );
};

export default PlaceCard;
