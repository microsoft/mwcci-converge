// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useEffect, useState } from "react";
import { Panel } from "@fluentui/react/lib/Panel";
import { CloseIcon } from "@fluentui/react-icons-northstar";
import { Provider, Dialog } from "@fluentui/react-northstar";
import * as MicrosoftGraph from "@microsoft/microsoft-graph-types";
import dayjs, { Dayjs } from "dayjs";
import { logEvent } from "../../../utilities/LogWrapper";
import VenuePlacePanel from "./VenuePlacePanel";
import CampusToCollaborate from "../../../types/CampusToCollaborate";
import VenueToCollaborate from "../../../types/VenueToCollaborate";
import CampusPlacePanel from "./CampusPlacePanel";
import NewEventModal from "./NewEventModal";
import Notifications from "../../../utilities/ToastManager";
import CalendarEventRequest from "../../../types/CalendarEventRequest";
import CampusPlaceEventTitle from "../../workspace/components/CampusPlaceEventTitle";
import VenueEventTitle from "./VenueEventTitle";
import { useSearchContextProvider } from "../../../providers/SearchProvider";
import {
  COLLABORATE_COUNT, USER_INTERACTION, ViralityMeasures, VIRALITY_MEASURE,
} from "../../../types/LoggerTypes";
import CollaborationPlaceDetailsStyles from "../styles/CollaborationPlaceDetailsStyles";
import { PlaceType } from "../../../types/ExchangePlace";
import { AddRecentBuildings } from "../../../utilities/RecentBuildingsManager";
import { useConvergeSettingsContextProvider } from "../../../providers/ConvergeSettingsProvider";
import { useApiProvider } from "../../../providers/ApiProvider";

interface Props {
  isOpen: boolean;
  dismissPanel: () => void;
  setOpen: (open: boolean) => void;
  open: boolean;
  place: CampusToCollaborate | VenueToCollaborate;
}

const CollaborationPlaceDetails: React.FC<Props> = (props) => {
  const { calendarService, meService } = useApiProvider();
  const classes = CollaborationPlaceDetailsStyles();
  const {
    isOpen,
    dismissPanel,
    setOpen,
    open,
    place,
  } = props;
  const {
    state,
  } = useSearchContextProvider();
  const [attendees, setAttendees] = useState<MicrosoftGraph.User[]>(state.selectedUsers);
  const [date, setDate] = useState<Date>(state.startTime.toDate());
  const [start, setStart] = useState<Dayjs>(state.startTime);
  const [end, setEnd] = useState<Dayjs>(state.endTime);

  const [isAllDay, setIsAllDay] = useState<boolean>(false);
  const [subject, setSubject] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [err, setErr] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const isCampusPlace = !!(place as CampusToCollaborate).identity;
  const {
    convergeSettings,
    setConvergeSettings,
  } = useConvergeSettingsContextProvider();

  const clearNewEventModal = () => {
    setSubject("");
    setMessage("");
    setIsAllDay(false);
    setAttendees(state.selectedUsers);
    setStart(state.startTime);
    setEnd(state.endTime);
    setDate(state.startTime.toDate());
    setErr(undefined);
  };

  useEffect(() => {
    setStart(state.startTime);
  }, [state.startTime]);

  useEffect(() => {
    setAttendees(state.selectedUsers);
  }, [state.selectedUsers]);

  useEffect(() => {
    setEnd(state.endTime);
  }, [state.endTime]);

  return (
    <>
      <Panel
        className={classes.panel}
        isBlocking={false}
        isOpen={isOpen}
        onDismiss={dismissPanel}
        closeButtonAriaLabel="Close"
      >
        {!!(place as VenueToCollaborate).venueName && (
          <VenuePlacePanel
            setOpen={setOpen}
            dismissPanel={dismissPanel}
            place={place as VenueToCollaborate}
          />
        )}
        {!!(place as CampusToCollaborate).identity && (
          <CampusPlacePanel
            setOpen={setOpen}
            dismissPanel={dismissPanel}
            place={place as CampusToCollaborate}
          />
        )}
      </Panel>
      <Provider
        theme={{
          componentVariables: {
            Dialog: {
              rootWidth: "668px",
              headerFontSize: "18px",
            },
          },
        }}
      >
        <Dialog
          open={open}
          onOpen={() => setOpen(true)}
          onCancel={() => {
            clearNewEventModal();
            setOpen(false);
          }}
          onConfirm={() => {
            setLoading(true);
            let newEvent: CalendarEventRequest;
            let startDate = start.toDate();
            let endDate = end.toDate();
            if (isAllDay) {
              startDate = dayjs(start.format("YYYY-MM-DD")).toDate();
              endDate = dayjs(end.add(1, "day").format("YYYY-MM-DD")).toDate();
            }
            if (isCampusPlace) {
              const campusPlace = place as CampusToCollaborate;
              newEvent = {
                isAllDay,
                start: startDate,
                end: endDate,
                attendees: attendees.map((a) => ({
                  name: a.displayName,
                  emailAddress: a.mail,
                  type: "required" as MicrosoftGraph.AttendeeType,
                })).concat([{
                  emailAddress: campusPlace.identity,
                  name: campusPlace.displayName,
                  type: "resource" as MicrosoftGraph.AttendeeType,
                }]),
                location: {
                  displayName: campusPlace.displayName,
                  address: {
                    city: campusPlace.city,
                    countryOrRegion: campusPlace.countryOrRegion,
                    postalCode: campusPlace.postalCode,
                    state: campusPlace.state,
                    street: campusPlace.street,
                  },
                  locationUri: campusPlace.identity,
                  locationType: "conferenceRoom",
                },
                title: subject,
                body: message,
                showAs: campusPlace.type === PlaceType.Space
                  ? "free" as MicrosoftGraph.FreeBusyStatus
                  : "busy" as MicrosoftGraph.FreeBusyStatus,
              };
            } else {
              const venuePlace = place as VenueToCollaborate;
              newEvent = {
                isAllDay,
                start: startDate,
                end: endDate,
                attendees: attendees.map((a) => ({
                  name: a.displayName,
                  emailAddress: a.mail,
                  type: "required" as MicrosoftGraph.AttendeeType,
                })),
                location: {
                  displayName: venuePlace.venueName,
                  address: {
                    city: venuePlace.city,
                    countryOrRegion: venuePlace.countryOrRegion,
                    postalCode: venuePlace.postalCode,
                    state: venuePlace.state,
                    street: venuePlace.street,
                  },
                },
                title: subject,
                body: message,
              };
            }
            logEvent(USER_INTERACTION, [
              { name: VIRALITY_MEASURE, value: ViralityMeasures.CollaboratorCount },
              { name: COLLABORATE_COUNT, value: attendees.length.toString() },
            ]);
            calendarService.createEvent(newEvent)
              .then(() => {
                const newSettings = {
                  ...convergeSettings,
                  recentBuildingUpns: AddRecentBuildings(
                    convergeSettings?.recentBuildingUpns,
                    (place as CampusToCollaborate).locality,
                  ),
                };
                setConvergeSettings(newSettings);
                if ((place as CampusToCollaborate).type === PlaceType.Space) {
                  return meService.updateMyPredictedLocation({
                    year: dayjs.utc(startDate).year(),
                    month: dayjs.utc(startDate).month() + 1,
                    day: dayjs.utc(startDate).date(),
                    userPredictedLocation: {
                      campusUpn: (place as CampusToCollaborate).locality,
                    },
                  });
                }
                return Promise.resolve();
              }).then(() => {
                clearNewEventModal();
                setOpen(false);
                const name = isCampusPlace
                  ? (place as CampusToCollaborate).displayName
                  : (place as VenueToCollaborate).venueName;
                Notifications.show({
                  duration: 5000,
                  title: "You created an event.",
                  content: `${name} (${dayjs(startDate).format("ddd @ h:mm A")})`,
                });
              })
              .catch(() => {
                setErr("Event creation failed. Please try again.");
              })
              .finally(() => {
                setLoading(false);
              });
          }}
          confirmButton={{
            content: "Confirm",
            loading,
          }}
          cancelButton="Cancel"
          content={(
            <NewEventModal
              attendees={attendees}
              setAttendees={setAttendees}
              date={date}
              setDate={setDate}
              start={start}
              setStart={setStart}
              end={end}
              setEnd={setEnd}
              isAllDay={isAllDay}
              setIsAllDay={setIsAllDay}
              dialogTitle={isCampusPlace ? (
                <CampusPlaceEventTitle
                  place={place as CampusToCollaborate}
                  date={date}
                  start={start}
                  end={end}
                  isAllDay={isAllDay}
                />
              ) : (
                <VenueEventTitle
                  place={place as VenueToCollaborate}
                />
              )}
              subject={subject}
              setSubject={setSubject}
              message={message}
              setMessage={setMessage}
              err={err}
            />
          )}
          header="New event"
          headerAction={{
            icon: <CloseIcon />,
            title: "Close",
            onClick: () => {
              setOpen(false);
              clearNewEventModal();
            },
          }}
        />
      </Provider>
    </>
  );
};

export default CollaborationPlaceDetails;
