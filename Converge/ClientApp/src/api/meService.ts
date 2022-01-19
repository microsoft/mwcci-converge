// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as MicrosoftGraph from "@microsoft/microsoft-graph-types";
import ConvergeSettings from "../types/ConvergeSettings";
import AutoWrapperResponse from "../types/AutoWrapperResponse";
import UserPredictedLocationRequest from "../types/UserPredictedLocationRequest";
import getAxiosClient from "./AuthenticationService";
import BuildingBasicInfo from "../types/BuildingBasicInfo";
import ExchangePlace from "../types/ExchangePlace";

const getSettings = async (): Promise<ConvergeSettings | null> => {
  const axios = await getAxiosClient();
  const request = await axios.get<AutoWrapperResponse<ConvergeSettings>>(
    "/api/me/convergeSettings",
  );
  if (request.status === 204) {
    return null;
  }
  return request.data.result;
};

export const setSettings = async (settings: ConvergeSettings): Promise<void> => {
  const axios = await getAxiosClient();
  const request = axios.post("/api/me/convergeSettings", settings);
  return (await request).data.result;
};

export const setupNewUser = async (settings: ConvergeSettings): Promise<void> => {
  const axios = await getAxiosClient();
  const request = axios.post("/api/me/setup", settings);
  return (await request).data.result;
};

export const getWorkgroup = async (): Promise<MicrosoftGraph.User[]> => {
  const axios = await getAxiosClient();
  const request = await axios.get<AutoWrapperResponse<MicrosoftGraph.User[]>>(
    "/api/me/workgroup",
  );
  return request.data.result;
};

export const getPeople = async (): Promise<MicrosoftGraph.User[]> => {
  const axios = await getAxiosClient();
  const request = await axios.get<AutoWrapperResponse<MicrosoftGraph.User[]>>(
    "/api/me/people",
  );
  return request.data.result;
};

export const getMyList = async (): Promise<MicrosoftGraph.User[]> => {
  const axios = await getAxiosClient();
  const request = await axios.get<AutoWrapperResponse<MicrosoftGraph.User[]>>(
    "/api/me/list",
  );
  return request.data.result;
};

export const updateMyPredictedLocation = async (
  request: UserPredictedLocationRequest,
): Promise<void> => {
  const axios = await getAxiosClient();
  const response = await axios.put("/api/me/updatePredictedLocation", request);
  return response.data.result;
};

export const getMyRecommendation = async (
  year: number,
  month: number,
  day: number,
): Promise<string> => {
  const axios = await getAxiosClient();
  const request = await axios.get<AutoWrapperResponse<string>>(
    "/api/me/recommendation",
    { params: { year, month, day } },
  );
  return request.data.result;
};

export const getConvergeCalendar = async (
): Promise<MicrosoftGraph.Calendar | null> => {
  const axios = await getAxiosClient();
  const request = await axios.get<AutoWrapperResponse<MicrosoftGraph.Calendar>>("/api/me/convergeCalendar");
  if (request.status === 204) {
    return null;
  }
  return request.data.result;
};

export const getRecentBuildingsBasicDetails = async (
): Promise<BuildingBasicInfo[]> => {
  const axios = await getAxiosClient();
  const request = await axios.get<AutoWrapperResponse<BuildingBasicInfo[]>>("/api/me/recentBuildings");
  return request.data.result;
};

export const getFavoritePlaces = async (
): Promise<ExchangePlace[]> => {
  const axios = await getAxiosClient();
  const request = await axios.get<AutoWrapperResponse<ExchangePlace[]>>("/api/me/favoriteCampusesDetails");
  return request.data.result;
};

export default getSettings;
