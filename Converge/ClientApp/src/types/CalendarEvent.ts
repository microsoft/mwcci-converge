// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as MicrosoftGraph from "@microsoft/microsoft-graph-types";

interface CalendarEvent {
  isAllDay?: boolean;
  isFocusTime: boolean;
  start: MicrosoftGraph.DateTimeTimeZone;
  end: MicrosoftGraph.DateTimeTimeZone;
  attendees: MicrosoftGraph.Attendee[];
  isWorkspaceBooking?: boolean;
  location: MicrosoftGraph.Location;
  buildingName?: string;
  id: string;
}

export default CalendarEvent;
