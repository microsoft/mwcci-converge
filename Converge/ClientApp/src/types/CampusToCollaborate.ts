// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import ExchangePlace from "./ExchangePlace";

interface CampusToCollaborate extends ExchangePlace{
  geoCoordinates?: string;
  availableSlots: number;
}

export default CampusToCollaborate;
