// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import AutoWrapperResponse from "../types/AutoWrapperResponse";
import AppSettings from "../types/Settings";
import getAxiosClient from "./AuthenticationService";

const getAppSettings = async (): Promise<AppSettings> => {
  const axios = await getAxiosClient();
  const request = await axios.get<AutoWrapperResponse<AppSettings>>("/api/settings/appSettings");
  return request.data.result;
};

export default getAppSettings;
