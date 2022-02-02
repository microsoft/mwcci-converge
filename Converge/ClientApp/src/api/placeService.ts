// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import AutoWrapperResponse from "../types/AutoWrapperResponse";
import AuthenticationService from "./AuthenticationService";

export default class PlaceService {
  private authenticationService: AuthenticationService;

  constructor(authenticationService: AuthenticationService) {
    this.authenticationService = authenticationService;
  }

  getPlaceMaxReserved = async (
    id: string, start: string, end: string,
  ): Promise<number> => {
    const axios = await this.authenticationService.getAxiosClient();
    const request = await axios.get<AutoWrapperResponse<number>>(`/api/v1.0/places/${id}/maxReserved`, {
      params: {
        start,
        end,
      },
    });
    return request.data.result;
  };

  getRoomAvailability = async (
    id: string, start: string, end: string,
  ): Promise<boolean> => {
    const axios = await this.authenticationService.getAxiosClient();
    const request = await axios.get<AutoWrapperResponse<boolean>>(`/api/v1.0/places/${id}/availability`, {
      params: {
        start,
        end,
      },
    });
    return request.data.result;
  };
}
