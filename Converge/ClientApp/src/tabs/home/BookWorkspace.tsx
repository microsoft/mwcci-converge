// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, useEffect } from "react";
import dayjs, { Dayjs } from "dayjs";
import {
  Box, Button, Header, Flex, Loader, Provider, Dialog, Text, SiteVariablesPrepared,
  DatepickerProps,
} from "@fluentui/react-northstar";
import {
  CloseIcon,
} from "@fluentui/react-icons-northstar";
import * as microsoftTeams from "@microsoft/teams-js";
import * as MicrosoftGraph from "@microsoft/microsoft-graph-types";
import DisplayBox from "./DisplayBox";
import AvailabilityChart from "./components/AvailabilityChart";
import BuildingCapacity from "./components/BuildingCapacity";
import Schedule from "../../types/Schedule";
import ExchangePlace, { PlaceType } from "../../types/ExchangePlace";
import { getBuildingSchedule, getBuildingPlaces } from "../../api/buildingService";
import { getWorkingHours, createEvent } from "../../api/calendarService";
import {
  DESCRIPTION,
  UISections, UI_SECTION, USER_INTERACTION,
} from "../../types/LoggerTypes";
import { logEvent } from "../../utilities/LogWrapper";
import createDeepLink from "../../utilities/deepLink";
import { getMyRecommendation, updateMyPredictedLocation } from "../../api/meService";
import TravelTimes from "./components/TravelTimes";
import WorkingStartEnd from "../../types/WorkingStartEnd";
import IsThisHelpful from "../../utilities/IsThisHelpful";
import DatePickerPrimary from "../../utilities/datePickerPrimary";
import RemoteCard from "./components/RemoteCard";
import Notifications from "../../utilities/ToastManager";
import BookPlaceModal from "../workspace/components/BookPlaceModal";
import ChangeLocationModal from "../../utilities/ChangeLocationModal";
import { getDefaultTime } from "../../providers/PlaceFilterProvider";
import { useConvergeSettingsContextProvider } from "../../providers/ConvergeSettingsProvider";
import BookWorkspaceStyles from "./styles/BookWorkspaceStyles";
import { useAppSettingsProvider } from "../../providers/AppSettingsProvider";
import AddRecentBuildings from "../../utilities/RecentBuildingsManager";
import PopupMenuWrapper from "../../utilities/popupMenuWrapper";
import BuildingBasicInfo from "../../types/BuildingBasicInfo";

const RECOMMENDED = "My Location";

const BookWorkspace: React.FC = () => {
  const classes = BookWorkspaceStyles();
  const {
    state,
    convergeSettings,
    setConvergeSettings,
    loadBuildingsByDistance,
    loadBuildingsByName,
  } = useConvergeSettingsContextProvider();
  const { buildingsList } = state;
  const [schedule, setSchedule] = useState<Schedule | undefined>(undefined);
  const [selectedBuildingName,
    setSelectedBuildingName] = useState<string | undefined>(RECOMMENDED);
  const [loading, setLoading] = useState<boolean>(false);
  const [workingHours, setWorkingHours] = useState<WorkingStartEnd | undefined>(undefined);
  const [myRecommendation, setMyRecommendation] = useState<string | undefined>(undefined);
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingBasicInfo | undefined>(
    undefined,
  );
  const [flexiblePlace, setFlexiblePlace] = useState<ExchangePlace | undefined>(undefined);
  const [open, setOpen] = React.useState<boolean>(false);
  const [bookable, setBookable] = useState<boolean>(true);
  const [err, setErr] = useState<string | undefined>(undefined);
  const [start, setStart] = useState<Dayjs>(getDefaultTime());
  const [end, setEnd] = useState<Dayjs>(getDefaultTime().add(30, "minutes"));
  const [isAllDay, setIsAllDay] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [address, setAddress] = useState<string | undefined>(undefined);
  const { appSettings } = useAppSettingsProvider();

  useEffect(() => {
    if (convergeSettings?.geoCoordinates) {
      loadBuildingsByDistance(convergeSettings.geoCoordinates);
    } else {
      loadBuildingsByName();
    }
  }, []);

  const clearEvent = () => {
    setIsAllDay(false);
    setStart(getDefaultTime());
    setEnd(getDefaultTime().add(30, "minutes"));
    setIsError(false);
  };

  const goToWorkspaces = () => {
    if (selectedBuildingName !== RECOMMENDED && selectedBuildingName) {
      const building = buildingsList.find((b) => b.displayName === selectedBuildingName);
      if (building) {
        microsoftTeams.executeDeepLink(
          createDeepLink("workspace", {
            location: building?.identity,
            date: start?.valueOf().toString() ?? "",
          }, appSettings?.clientId ?? ""),
        );
      }
    } else if (myRecommendation) {
      const building = buildingsList.find((b) => b.displayName === myRecommendation);
      if (building) {
        microsoftTeams.executeDeepLink(
          createDeepLink("workspace", {
            location: building?.identity,
            date: start?.valueOf().toString() ?? "",
          }, appSettings?.clientId ?? ""),
        );
      }
    }
  };

  const getSchedule = async (building: BuildingBasicInfo) => {
    setLoading(true);
    setIsError(false);
    let hours = workingHours;
    if (!hours) {
      hours = await getWorkingHours();
      setWorkingHours(hours);
    }
    const startHours = dayjs(hours.start);
    const endHours = dayjs(hours.end);
    const startBuilding = dayjs.utc(start).set("hour", startHours.hour()).set("minute", startHours.minute());
    let endBuilding = dayjs.utc(start).set("hour", endHours.hour()).set("minute", endHours.minute());
    if (endBuilding.isBefore(startBuilding)) {
      endBuilding = endBuilding.add(1, "day");
    }
    return getBuildingSchedule(
      building.identity,
      startBuilding.toISOString(),
      endBuilding.toISOString(),
    )
      .then(setSchedule).catch(() => setIsError(true))
      .finally(() => setLoading(false));
  };

  const refreshRecommendation = async () => {
    setIsError(false);
    const day = dayjs.utc(start);
    setSelectedBuilding(undefined);
    await getMyRecommendation(day.year(), day.month() + 1, day.date())
      .then((recommendation) => {
        setMyRecommendation(recommendation);
        if (recommendation !== "Remote" && recommendation !== "Out of Office") {
          const building = buildingsList.find((b) => b.displayName === recommendation);
          if (building) {
            getSchedule(building);
            setSelectedBuilding(building);
          }
        }
      }).catch(() => setIsError(true));
  };

  useEffect(() => {
    setSelectedBuilding(undefined);
    if (selectedBuildingName === RECOMMENDED) {
      refreshRecommendation();
    } else {
      const building = buildingsList.find((b) => b.displayName === selectedBuildingName);
      if (building) {
        getSchedule(building);
        setSelectedBuilding(building);
      }
    }
  }, [start, selectedBuildingName]);

  useEffect(() => {
    if (selectedBuilding) {
      getBuildingPlaces(
        selectedBuilding.identity,
        PlaceType.Space,
        {
          displayNameSearchString: "Flex Space",
        },
      ).then((response) => {
        if (response.exchangePlacesList.length > 0) {
          setFlexiblePlace(response.exchangePlacesList[0]);
        }
      });
    }
  }, [selectedBuilding]);

  const handleDropdownChange = (bldg: string | undefined) => {
    if (bldg !== "Remote" && bldg !== "Out of Office") {
      setSelectedBuildingName(bldg);
    } else {
      setSelectedBuildingName(RECOMMENDED);
    }
    logEvent(USER_INTERACTION, [
      { name: UI_SECTION, value: UISections.WorkspaceHome },
      { name: DESCRIPTION, value: `selected_building_change_${bldg}` },
    ]);
  };

  const handleDatepickerChange = (
    event: React.SyntheticEvent, data: (DatepickerProps & { value: Date; }) | undefined,
  ) => {
    setIsError(false);
    const newStart = dayjs(`${dayjs(data?.value).format("MM-DD-YYYY")} ${start.format("h:mm A")}`, "MM-DD-YYYY h:mm A");
    const newEnd = dayjs(`${dayjs(data?.value).format("MM-DD-YYYY")} ${end.format("h:mm A")}`, "MM-DD-YYYY h:mm A");
    setStart(newStart);
    setEnd(newEnd);
    logEvent(USER_INTERACTION, [
      { name: UI_SECTION, value: UISections.WorkspaceHome },
      { name: DESCRIPTION, value: "date_change" },
    ]);
  };

  const refreshWorkSpace = async () => {
    setLoading(true);
    const building = buildingsList.find((b) => b.displayName === selectedBuildingName);
    if (building) {
      getSchedule(building);
    }
    setLoading(false);
  };

  const refreshRecommended = async () => {
    setLoading(true);
    const day = dayjs.utc(start);
    getMyRecommendation(day.year(), day.month() + 1, day.date())
      .then((recommendation) => {
        setMyRecommendation(recommendation);
        if (recommendation !== "Remote" && recommendation !== "Out of Office") {
          const building = buildingsList.find((b) => b.displayName === recommendation);
          if (building) {
            getSchedule(building);
            setSelectedBuilding(building);
          }
        }
      }).catch(() => setIsError(true));
    setLoading(false);
  };

  useEffect(() => {
    if (selectedBuilding?.identity) {
      getBuildingPlaces(selectedBuilding?.identity, PlaceType.Room)
        .then((response) => {
          const place = response.exchangePlacesList.find((ep) => (
            ep.street || ep.city || ep.postalCode || ep.countryOrRegion
          ));
          if (place) {
            setAddress(`${place.street} ${place.city} ${place.postalCode} ${place.countryOrRegion}`);
          }
        });
    }
  }, [selectedBuilding]);

  return (
    <DisplayBox
      descriptionContent="Find somewhere to get things done"
      headerContent="Book a workspace"
      gridArea="BookWorkspace"
      height="520px"
    >
      <Box className={classes.root}>
        <Flex gap="gap.small" wrap className={classes.actions}>
          <Box className={classes.halfWidthDropDown}>
            <PopupMenuWrapper headerTitle={RECOMMENDED} handleDropdownChange={handleDropdownChange} buildingList={buildingsList.map((x) => x.displayName)} locationBuildingName={myRecommendation} width="320px" marginContent="5.1rem" value={selectedBuildingName === RECOMMENDED ? "" : selectedBuildingName} placeholderTitle={RECOMMENDED} buttonTitle="See more" otherOptionsList={[]} maxHeight="320px" />
          </Box>
          <Box className={classes.datePickerStyles}>
            <DatePickerPrimary
              selectedDate={start.toDate()}
              onDateChange={handleDatepickerChange}
            />
          </Box>
        </Flex>
        {isError
          && selectedBuildingName === RECOMMENDED && (
            <Box className={classes.errBox}>
              <Text content="Something went wrong." color="red" />
              <Button
                content="Try again"
                text
                onClick={() => {
                  refreshRecommended();
                  logEvent(USER_INTERACTION, [
                    { name: UI_SECTION, value: UISections.WorkspaceHome },
                    { name: DESCRIPTION, value: "refreshRecommended" },
                  ]);
                }}
                color="red"
                className={classes.retryBtn}
              />
            </Box>
        )}
        {!isError && selectedBuildingName === RECOMMENDED && myRecommendation === "Out of Office"
          && (
            <RemoteCard
              title="Out of office"
              description="Kick back and relax. You're supposed to be out of the office."
            />
          )}
        {!isError && selectedBuildingName === RECOMMENDED && myRecommendation === "Remote"
          && (
            <RemoteCard
              title="Work from home"
              description="Go into an office if you want, but save yourself the commute. "
            />
          )}
        {selectedBuilding && (
          <Box className={classes.boxStyle}>
            <Flex vAlign="center" space="between" gap="gap.small">
              <Flex vAlign="end" gap="gap.small" className={classes.displayNameBox}>
                <Header
                  as="h3"
                  content={selectedBuilding.displayName}
                  className={classes.displayName}
                />
                <BuildingCapacity availableSpace={schedule?.available || 100} />
              </Flex>
            </Flex>
            {convergeSettings
              && convergeSettings.zipCode
              && address
              && <TravelTimes start={convergeSettings?.zipCode} end={address} />}
            {isError
              && selectedBuildingName !== RECOMMENDED && (
                <Box className={classes.errBox}>
                  <Text content="Something went wrong." color="red" />
                  <Button
                    content="Try again"
                    text
                    onClick={() => {
                      refreshWorkSpace();
                      logEvent(USER_INTERACTION, [
                        { name: UI_SECTION, value: UISections.WorkspaceHome },
                        { name: DESCRIPTION, value: "refreshWorkSpace" },
                      ]);
                    }}
                    color="red"
                    className={classes.retryBtn}
                  />
                </Box>
            )}
            <Flex hAlign="center">
              {loading && <Box className={classes.loaderBox}><Loader /></Box>}
              {!loading && schedule && <AvailabilityChart schedule={schedule} />}
            </Flex>
            <Flex
              vAlign="center"
              space="between"
              gap="gap.small"
              padding="padding.medium"
              className={isError ? classes.errorMessage : classes.hideErrorMessage}
            >
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
                <Dialog
                  open={open}
                  onOpen={() => {
                    logEvent(USER_INTERACTION, [
                      { name: UI_SECTION, value: UISections.WorkspaceHome },
                      { name: DESCRIPTION, value: "open_workspace_dialog" },
                    ]);
                    setOpen(true);
                  }}
                  onCancel={() => {
                    clearEvent();
                    logEvent(USER_INTERACTION, [
                      { name: UI_SECTION, value: UISections.WorkspaceHome },
                      { name: DESCRIPTION, value: "cancel_workspace_dialog" },
                    ]);
                    setOpen(false);
                  }}
                  onConfirm={() => {
                    logEvent(USER_INTERACTION, [
                      { name: UI_SECTION, value: UISections.WorkspaceHome },
                      { name: DESCRIPTION, value: "confirm_workspace_dialog" },
                    ]);
                    setLoading(true);
                    let startDate = start.toDate();
                    let endDate = end.toDate();
                    if (isAllDay) {
                      startDate = dayjs(start.format("YYYY-MM-DD")).toDate();
                      endDate = dayjs(end.add(1, "day").format("YYYY-MM-DD")).toDate();
                    }
                    createEvent({
                      isAllDay,
                      start: startDate,
                      end: endDate,
                      attendees: [{
                        emailAddress: flexiblePlace?.identity,
                        type: "resource" as MicrosoftGraph.AttendeeType,
                      }],
                      location: {
                        displayName: flexiblePlace?.displayName,
                        locationEmailAddress: flexiblePlace?.identity,
                        locationType: "conferenceRoom",
                      },
                      title: "Converge Workspace Booking",
                      showAs: "free" as MicrosoftGraph.FreeBusyStatus,
                    })
                      .then(() => {
                        updateMyPredictedLocation({
                          year: dayjs.utc(startDate).year(),
                          month: dayjs.utc(startDate).month() + 1,
                          day: dayjs.utc(startDate).date(),
                          userPredictedLocation: {
                            campusUpn: flexiblePlace?.locality,
                          },
                        });
                        if (flexiblePlace) {
                          const newSettings = {
                            ...convergeSettings,
                            recentBuildingUpns: AddRecentBuildings(
                              convergeSettings?.recentBuildingUpns,
                              flexiblePlace.locality,
                            ),
                          };
                          setConvergeSettings(newSettings);
                        }
                      })
                      .then(refreshRecommended)
                      .then(() => {
                        setOpen(false);
                        clearEvent();
                        Notifications.show({
                          duration: 5000,
                          title: "You reserved a workspace.",
                          content: `${flexiblePlace?.displayName} (${dayjs(startDate).format("ddd @ h:mm A")})`,
                        });
                      })
                      .catch(() => {
                        setErr("Something went wrong with your workspace reservation. Please try again.");
                      })
                      .finally(() => {
                        setLoading(false);
                      });
                  }}
                  confirmButton={{
                    content: "Reserve",
                    loading,
                  }}
                  cancelButton="Cancel"
                  content={(
                    flexiblePlace && (
                      <BookPlaceModal
                        place={flexiblePlace}
                        bookable={bookable}
                        setBookable={setBookable}
                        buildingName={selectedBuildingName}
                        err={err}
                        start={start}
                        end={end}
                        setStart={setStart}
                        setEnd={setEnd}
                        isAllDay={isAllDay}
                        setIsAllDay={setIsAllDay}
                        isFlexible={!!flexiblePlace}
                      />
                    )
                  )}
                  header={(
                    <Text
                      as="h2"
                      content="Book a workspace"
                      className={classes.header}
                    />
                  )}
                  trigger={(
                    <Button
                      primary
                      text
                      disabled={!flexiblePlace}
                    >
                      Flexible seating
                    </Button>
                  )}
                  headerAction={{
                    icon: <CloseIcon />,
                    title: "Close",
                    onClick: () => {
                      logEvent(USER_INTERACTION, [
                        { name: UI_SECTION, value: UISections.WorkspaceHome },
                        { name: DESCRIPTION, value: "close_workspace_dialog" },
                      ]);
                      clearEvent();
                      setOpen(false);
                    },
                  }}
                  className={classes.dialog}
                />
              </Provider>
              <Button
                onClick={() => {
                  goToWorkspaces();
                  logEvent(USER_INTERACTION, [
                    { name: UI_SECTION, value: UISections.WorkspaceHome },
                    { name: DESCRIPTION, value: "go_to_search_workspaces" },
                  ]);
                }}
              >
                Search spaces
              </Button>
            </Flex>
          </Box>
        )}
        <IsThisHelpful logId="e0510597" sectionName={UISections.WorkspaceHome} />
        <Box className={classes.changeLocation}>
          {selectedBuildingName === RECOMMENDED && (
            <ChangeLocationModal
              buildings={buildingsList}
              date={start.toDate()}
              recommendation={myRecommendation}
              refreshRecommendation={refreshRecommendation}
            />
          )}
        </Box>
      </Box>
    </DisplayBox>
  );
};

export default BookWorkspace;
