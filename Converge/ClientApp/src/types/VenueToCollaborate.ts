// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import BaseVenue from "./BaseVenue";

interface VenueToCollaborate extends BaseVenue {
  venueAddress?: string;
  distanceInMetres?: number;
  isClosed?: boolean;
  city?: string;
  countryOrRegion?: string;
  postalCode?: string;
  state?: string;
  street?: string;
}

export default VenueToCollaborate;
