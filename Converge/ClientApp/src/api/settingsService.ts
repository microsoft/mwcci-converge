// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import AutoWrapperResponse from "../types/AutoWrapperResponse";
import AppSettings from "../types/Settings";
import AuthenticationService from "./AuthenticationService";

export default class SettingsService {
  private authenticationService: AuthenticationService;

  constructor(authenticationService: AuthenticationService) {
    this.authenticationService = authenticationService;
  }

  getAppSettings = async (): Promise<AppSettings> => {
    const axios = await this.authenticationService.getAxiosClient();
    const request = await axios.get<AutoWrapperResponse<AppSettings>>("/api/v1.0/settings/appSettings");
    return request.data.result;
  };
}
