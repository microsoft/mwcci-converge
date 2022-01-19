// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import CalendarEvent from "./CalendarEvent";

interface UpcomingReservationsResponse {
  reservations: CalendarEvent[],
  loadMore: boolean,
}

export default UpcomingReservationsResponse;
