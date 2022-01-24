// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as microsoftTeams from "@microsoft/teams-js";
import { AxiosInstance } from "axios";
import { setup } from "axios-cache-adapter";

async function getSSOToken(): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    microsoftTeams.authentication.getAuthToken({
      successCallback: resolve,
      failureCallback: reject,
    });
  });
}

let api: AxiosInstance;

const getAxiosClient = async (): Promise<AxiosInstance> => {
  const accessToken = await getSSOToken();
  if (!api) {
    // Allow callers to configure caching on a per-endpoint basis
    api = setup({
      cache: {
        maxAge: 0,
      },
    });
    api.defaults.headers.common["Content-Type"] = "application/json";
  }
  api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

  return api;
};

export default getAxiosClient;
