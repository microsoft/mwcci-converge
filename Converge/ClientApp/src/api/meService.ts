// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as MicrosoftGraph from "@microsoft/microsoft-graph-types";
import ConvergeSettings from "../types/ConvergeSettings";
import AutoWrapperResponse from "../types/AutoWrapperResponse";
import UserPredictedLocationRequest from "../types/UserPredictedLocationRequest";
import BuildingBasicInfo from "../types/BuildingBasicInfo";
import ExchangePlace from "../types/ExchangePlace";
import AuthenticationService from "./AuthenticationService";

export default class MeService {
  private authenticationService: AuthenticationService;

  constructor(authenticationService: AuthenticationService) {
    this.authenticationService = authenticationService;
  }

  getSettings = async (): Promise<ConvergeSettings | null> => {
    const axios = await this.authenticationService.getAxiosClient();
    const request = await axios.get<AutoWrapperResponse<ConvergeSettings>>(
      "/api/v1.0/me/convergeSettings",
    );
    if (request.status === 204) {
      return null;
    }
    return request.data.result;
  };

  setSettings = async (settings: ConvergeSettings): Promise<void> => {
    const axios = await this.authenticationService.getAxiosClient();
    const request = axios.post("/api/v1.0/me/convergeSettings", settings);
    return (await request).data.result;
  };

  setupNewUser = async (settings: ConvergeSettings): Promise<void> => {
    const axios = await this.authenticationService.getAxiosClient();
    const request = axios.post("/api/v1.0/me/setup", settings);
    return (await request).data.result;
  };

  getWorkgroup = async (): Promise<MicrosoftGraph.User[]> => {
    const axios = await this.authenticationService.getAxiosClient();
    const request = await axios.get<AutoWrapperResponse<MicrosoftGraph.User[]>>(
      "/api/v1.0/me/workgroup",
    );
    return request.data.result;
  };

  getPeople = async (): Promise<MicrosoftGraph.User[]> => {
    const axios = await this.authenticationService.getAxiosClient();
    const request = await axios.get<AutoWrapperResponse<MicrosoftGraph.User[]>>(
      "/api/v1.0/me/people",
    );
    return request.data.result;
  };

  getMyList = async (): Promise<MicrosoftGraph.User[]> => {
    const axios = await this.authenticationService.getAxiosClient();
    const request = await axios.get<AutoWrapperResponse<MicrosoftGraph.User[]>>(
      "/api/v1.0/me/list",
    );
    return request.data.result;
  };

  updateMyPredictedLocation = async (
    request: UserPredictedLocationRequest,
  ): Promise<void> => {
    const axios = await this.authenticationService.getAxiosClient();
    const response = await axios.put("/api/v1.0/me/updatePredictedLocation", request);
    return response.data.result;
  };

  getMyRecommendation = async (
    year: number,
    month: number,
    day: number,
  ): Promise<string> => {
    const axios = await this.authenticationService.getAxiosClient();
    const request = await axios.get<AutoWrapperResponse<string>>(
      "/api/v1.0/me/recommendation",
      { params: { year, month, day } },
    );
    return request.data.result;
  };

  getConvergeCalendar = async (
  ): Promise<MicrosoftGraph.Calendar | null> => {
    const axios = await this.authenticationService.getAxiosClient();
    const request = await axios.get<AutoWrapperResponse<MicrosoftGraph.Calendar>>("/api/v1.0/me/convergeCalendar");
    if (request.status === 204) {
      return null;
    }
    return request.data.result;
  };

  getRecentBuildingsBasicDetails = async (
  ): Promise<BuildingBasicInfo[]> => {
    const axios = await this.authenticationService.getAxiosClient();
    const request = await axios.get<AutoWrapperResponse<BuildingBasicInfo[]>>("/api/v1.0/me/recentBuildings");
    return request.data.result;
  };

  getFavoritePlaces = async (
  ): Promise<ExchangePlace[]> => {
    const axios = await this.authenticationService.getAxiosClient();
    const request = await axios.get<AutoWrapperResponse<ExchangePlace[]>>("/api/v1.0/me/favoriteCampusesDetails");
    return request.data.result;
  };
}
