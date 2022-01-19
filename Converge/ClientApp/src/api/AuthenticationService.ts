// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as microsoftTeams from "@microsoft/teams-js";
import axios, { AxiosStatic } from "axios";

async function getSSOToken(): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    microsoftTeams.authentication.getAuthToken({
      successCallback: resolve,
      failureCallback: reject,
    });
  });
}

const getAxiosClient = async (): Promise<AxiosStatic> => {
  const accessToken = await getSSOToken();

  axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  axios.defaults.headers.common["Content-Type"] = "application/json";

  return axios;
};

export default getAxiosClient;
