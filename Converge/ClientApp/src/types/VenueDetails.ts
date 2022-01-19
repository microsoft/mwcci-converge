// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import BaseVenue from "./BaseVenue";
import YelpLocation from "./YelpLocation";
import OperationHoursForWeek from "./OperationHoursForWeek";

interface VenueDetails extends BaseVenue {
  alias?: string;
  isClaimed?: boolean;
  isClosed?: boolean;
  location?: YelpLocation;
  photos?: string[];
  operatingHours?: OperationHoursForWeek;
}

export default VenueDetails;
