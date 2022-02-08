// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import ExchangePlace from "./ExchangePlace";

export interface IExchangePlacesResponse {
  exchangePlacesList: ExchangePlace[];
  skipToken: string;
}
