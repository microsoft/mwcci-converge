// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as MicrosoftGraph from "@microsoft/microsoft-graph-types";
import EventRecipient from "./EventRecipient";

interface CalendarEventRequest {
  start: Date;
  end: Date;
  attendees: EventRecipient[];
  location?: MicrosoftGraph.Location;
  title?: string;
  body?: string;
  isAllDay?: boolean;
  showAs?: MicrosoftGraph.FreeBusyStatus;
}

export default CalendarEventRequest;
