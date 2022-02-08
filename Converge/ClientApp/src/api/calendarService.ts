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
import AuthenticationService from "./AuthenticationService";

export default class CalendarService {
  private authenticationService: AuthenticationService

  constructor(authenticationService: AuthenticationService) {
    this.authenticationService = authenticationService;
  }

  getWorkingHours = async (): Promise<WorkingStartEnd> => {
    const axios = await this.authenticationService.getAxiosClient();
    const response = await axios.get<AutoWrapperResponse<WorkingStartEnd>>("/api/v1.0/calendar/mailboxSettings/workingHours");
    return response.data.result;
  };

  getUpcomingReservations = async (
    startDateTime: string, endDateTime: string, top?:number, skip?:number,
  ): Promise<UpcomingReservationsResponse> => {
    const axios = await this.authenticationService.getAxiosClient();
    const response = await axios.get<AutoWrapperResponse<UpcomingReservationsResponse>>("/api/v1.0/calendar/upcomingReservations", {
      params: {
        startDateTime, endDateTime, top, skip,
      },
    });
    return response.data.result;
  };

  deleteEvent = async (eventId: string, messageComment: string): Promise<void> => {
    const axios = await this.authenticationService.getAxiosClient();
    await axios.get(`/api/v1.0/calendar/events/${eventId}/deleteEvent`, {
      params: {
        messageComment,
      },
    });
    logEvent(USER_INTERACTION, [
      { name: IMPORTANT_ACTION, value: ImportantActions.EventCancelled },
    ]);
  };

  createEvent = async (newEvent: CalendarEventRequest) : Promise<CalendarEvent> => {
    const axios = await this.authenticationService.getAxiosClient();
    const response = await axios.post<AutoWrapperResponse<CalendarEvent>>("/api/v1.0/calendar/event", newEvent);
    logEvent(USER_INTERACTION, [
      { name: IMPORTANT_ACTION, value: ImportantActions.EventCreated },
    ]);
    return response.data.result;
  };
}
