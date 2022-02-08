// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as microsoftTeams from "@microsoft/teams-js";
import { AxiosInstance } from "axios";
import { setup } from "axios-cache-adapter";

export default class AuthenticationService {
  private getSSOToken = (): Promise<string> => new Promise<string>((resolve, reject) => {
    microsoftTeams.authentication.getAuthToken({
      successCallback: resolve,
      failureCallback: reject,
    });
  })

  private api: AxiosInstance;

  constructor() {
    this.api = setup({
      cache: {
        maxAge: 0,
      },
    });
    this.api.defaults.headers.common["Content-Type"] = "application/json";
  }

  getAxiosClient = async (): Promise<AxiosInstance> => {
    const accessToken = await this.getSSOToken();
    this.api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    return this.api;
  }
}
