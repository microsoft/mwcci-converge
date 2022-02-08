// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import AutoWrapperResponse from "../types/AutoWrapperResponse";
import RouteResponse from "../types/RouteResponse";
import AuthenticationService from "./AuthenticationService";

export default class RouteService {
  private authenticationService: AuthenticationService;

  constructor(authenticationService: AuthenticationService) {
    this.authenticationService = authenticationService;
  }

  getRoute = async (start: string, end: string): Promise<RouteResponse> => {
    const axios = await this.authenticationService.getAxiosClient();
    const request = await axios.get<AutoWrapperResponse<RouteResponse>>(
      "/api/v1.0/route/travelTime",
      { params: { start, end } },
    );
    return request.data.result;
  };
}
