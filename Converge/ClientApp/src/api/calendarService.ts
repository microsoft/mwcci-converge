// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import AutoWrapperResponse from "../types/AutoWrapperResponse";
import CalendarEvent from "../types/CalendarEvent";
import CalendarEventRequest from "../types/CalendarEventRequest";
import {
  ImportantActions, IMPORTANT_ACTION, USER_INTERACTION,
} from "../types/LoggerTypes";
import UpcomingReservationsResponse from "../types/UpcomingReservationsResponse";
import WorkingStartEnd from "../types/WorkingStartEnd";
import { logEvent } from "../utilities/LogWrapper";
import getAxiosClient from "./AuthenticationService";

export const getWorkingHours = async (): Promise<WorkingStartEnd> => {
  const axios = await getAxiosClient();
  const response = await axios.get<AutoWrapperResponse<WorkingStartEnd>>("/api/calendar/mailboxSettings/workingHours");
  return response.data.result;
};

export const getUpcomingReservations = async (
  startDateTime: string, endDateTime: string, top?:number, skip?:number,
): Promise<UpcomingReservationsResponse> => {
  const axios = await getAxiosClient();
  const response = await axios.get<AutoWrapperResponse<UpcomingReservationsResponse>>("/api/calendar/upcomingReservations", {
    params: {
      startDateTime, endDateTime, top, skip,
    },
  });
  return response.data.result;
};

export const deleteEvent = async (eventId: string, messageComment: string): Promise<void> => {
  const axios = await getAxiosClient();
  await axios.get(`/api/calendar/events/${eventId}/deleteEvent`, {
    params: {
      messageComment,
    },
  });
  logEvent(USER_INTERACTION, [
    { name: IMPORTANT_ACTION, value: ImportantActions.EventCancelled },
  ]);
};

export const createEvent = async (newEvent: CalendarEventRequest) : Promise<CalendarEvent> => {
  const axios = await getAxiosClient();
  const response = await axios.post<AutoWrapperResponse<CalendarEvent>>("/api/calendar/event", newEvent);
  logEvent(USER_INTERACTION, [
    { name: IMPORTANT_ACTION, value: ImportantActions.EventCreated },
  ]);
  return response.data.result;
};
