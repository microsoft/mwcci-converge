// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useEffect, useState } from "react";
import { CloseIcon } from "@fluentui/react-icons-northstar";
import { Dialog } from "@fluentui/react-northstar";
import * as MicrosoftGraph from "@microsoft/microsoft-graph-types";
import dayjs, { Dayjs } from "dayjs";
import { logEvent } from "../../../utilities/LogWrapper";
import NewEventModal from "../../collaborate/components/NewEventModal";
import ExchangePlace from "../../../types/ExchangePlace";
import { useProvider as PlaceFilterProvider } from "../../../providers/PlaceFilterProvider";
import { createEvent } from "../../../api/calendarService";
import Notifications from "../../../utilities/ToastManager";
import CampusPlaceEventTitle from "./CampusPlaceEventTitle";
import {
  DESCRIPTION, UISections, UI_SECTION, USER_INTERACTION,
} from "../../../types/LoggerTypes";
import AddRecentBuildings from "../../../utilities/RecentBuildingsManager";
import { useConvergeSettingsContextProvider } from "../../../providers/ConvergeSettingsProvider";

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  place: ExchangePlace;
  start: Dayjs;
  end: Dayjs;
  setStart: (start: Dayjs) => void;
  setEnd: (end: Dayjs) => void;
  clearPlaceCard: () => Dayjs;
  getAvailability: () => void;
}

const NewConfRoomEvent:React.FC<Props> = (props) => {
  const {
    open,
    setOpen,
    place,
    start,
    end,
    setStart,
    setEnd,
    clearPlaceCard,
    getAvailability,
  } = props;
  const { createReservation } = PlaceFilterProvider();
  const [isAllDay, setIsAllDay] = useState<boolean>(false);
  const [subject, setSubject] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [attendees, setAttendees] = useState<MicrosoftGraph.User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [err, setErr] = useState<string | undefined>(undefined);
  const [date, setDate] = useState<Date>(start.toDate());
  const {
    convergeSettings,
    setConvergeSettings,
  } = useConvergeSettingsContextProvider();

  const handleDateChange = (
    d: Date,
  ) => {
    setDate(d);
    setStart(dayjs(`${dayjs(d).format("MM-DD-YYYY")} ${start.format("h:mm A")}`, "MM-DD-YYYY h:mm A"));
    setEnd(dayjs(`${dayjs(d).format("MM-DD-YYYY")} ${end.format("h:mm A")}`, "MM-DD-YYYY h:mm A"));
  };

  const clearEvent = () => {
    setIsAllDay(false);
    setSubject("");
    setMessage("");
    setAttendees([]);
    setErr(undefined);
    setDate(clearPlaceCard().toDate());
  };

  useEffect(() => {
    if (open) {
      setDate(start.toDate());
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      onCancel={() => {
        setOpen(false);
        clearEvent();
        logEvent(USER_INTERACTION, [
          { name: UI_SECTION, value: UISections.BookPlaceModal },
          { name: DESCRIPTION, value: "cancel_conf_room_create" },
        ]);
      }}
      onConfirm={() => {
        logEvent(USER_INTERACTION, [
          { name: UI_SECTION, value: UISections.BookPlaceModal },
          { name: DESCRIPTION, value: "confirm_conf_room_create" },
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
          attendees: attendees.map((a) => ({
            name: a.displayName,
            emailAddress: a.mail,
            type: "required" as MicrosoftGraph.AttendeeType,
          })).concat([{
            emailAddress: place.identity,
            name: place.displayName,
            type: "resource" as MicrosoftGraph.AttendeeType,
          }]),
          location: {
            displayName: place.displayName,
            address: {
              city: place.city,
              countryOrRegion: place.countryOrRegion,
              postalCode: place.postalCode,
              state: place.state,
              street: place.street,
            },
            locationUri: place.identity,
            locationType: "conferenceRoom",
          },
          title: subject,
          body: message,
        })
          .then((calendarEvent) => {
            clearEvent();
            setOpen(false);
            const newSettings = {
              ...convergeSettings,
              recentBuildingUpns: AddRecentBuildings(
                convergeSettings?.recentBuildingUpns,
                place.locality,
              ),
            };
            setConvergeSettings(newSettings);
            createReservation(calendarEvent);
            getAvailability();
            Notifications.show({
              duration: 5000,
              title: "You reserved a conference room.",
              content: `${place?.displayName} (${dayjs(startDate).format("ddd @ h:mm A")})`,
            });
          })
          .catch(() => {
            setErr("Something went wrong with your meeting room reservation. Please try again");
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
          start={start}
          setStart={setStart}
          setIsAllDay={setIsAllDay}
          end={end}
          setEnd={setEnd}
          date={date}
          setDate={handleDateChange}
          isAllDay={isAllDay}
          attendees={attendees}
          setAttendees={setAttendees}
          dialogTitle={(
            <CampusPlaceEventTitle
              place={place}
              date={date}
              start={start}
              end={end}
              isAllDay={isAllDay}
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
          clearEvent();
          setOpen(false);
          logEvent(USER_INTERACTION, [
            { name: UI_SECTION, value: UISections.BookPlaceModal },
            { name: DESCRIPTION, value: "close_conf_room_create" },
          ]);
        },
      }}
    />
  );
};

export default NewConfRoomEvent;
