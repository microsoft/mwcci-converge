// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as MicrosoftGraph from "@microsoft/microsoft-graph-types";
import AutoWrapperResponse from "../types/AutoWrapperResponse";
import UserCoordinatesResponse from "../types/UserCoordinatesResponse";
import MultiUserAvailableTimesResponse from "../types/MultiUserAvailableTimesResponse";
import UserProfile from "../types/UserProfile";
import AuthenticationService from "./AuthenticationService";
import UserCoordianates from "../types/UserCoordinates";
import createCachedQuery, { CachedQuery } from "../utilities/CachedQuery";
import QueryOption from "../types/QueryOption";
import UserSearchPagedResponse from "../types/UserSearchPagedResponse";

interface UserPhotoResult {
  id: string;
  userPhoto: string | null;
}

type CachedUserPhotoQuery = CachedQuery<UserPhotoResult>;

interface UserCoordinateQueryParams {
  year: number,
  month: number,
  day: number
}

type CachedUserCoordinateQuery = CachedQuery<UserCoordianates, UserCoordinateQueryParams>;

export default class UserService {
  private authenticationService: AuthenticationService;

  private generateUserPhotoStoreKey = (
    result: UserPhotoResult,
  ): string => result.id;

  private generateUserPhotoRetrievalKey = (search: string): string => search;

  private generateUserCoordinateStoreKey = (
    user: UserCoordianates,
    {
      day,
      month,
      year,
    }: UserCoordinateQueryParams,
  ) => `${user.userPrincipalName}-${year}/${month}/${day}`;

  private generateUserCoordinateRetrievalKey = (search: string, {
    day,
    month,
    year,
  }: UserCoordinateQueryParams) => `${search}-${year}/${month}/${day}`;

  constructor(authenticationService: AuthenticationService) {
    this.authenticationService = authenticationService;
  }

  getCollaborator = async (userPrincipalName: string): Promise<MicrosoftGraph.User> => {
    const axios = await this.authenticationService.getAxiosClient();
    const response = await axios.get<AutoWrapperResponse<MicrosoftGraph.User>>(`/api/users/${userPrincipalName}`);
    return response.data.result;
  };

  getUserPhoto = async (id: string): Promise<UserPhotoResult> => {
    const axios = await this.authenticationService.getAxiosClient();
    const request = await fetch(`/api/users/${id}/photo`, {
      headers: { Authorization: axios.defaults.headers.common.Authorization },
    });
    if (request.status === 200) {
      const photoBlob = await request.blob();
      if (photoBlob.size !== 0) {
        // Create URL to to allow image to be used.
        const photoUrl = URL.createObjectURL(photoBlob);
        return {
          id,
          userPhoto: photoUrl,
        };
      }
      return {
        id,
        userPhoto: null,
      };
    }
    return request.json();
  };

  /**
   * Function that returns a cached getUserCoordinates function.
   * @returns A cached user photo query
   */
  createUserPhotoService = (): CachedUserPhotoQuery => createCachedQuery<UserPhotoResult>(
    this.generateUserPhotoStoreKey,
    this.generateUserPhotoRetrievalKey,
    (ids: string[]) => this.getUserPhoto(ids[0])
      .then((result) => [result]),
  )

  getUserProfile = async (id?: string): Promise<UserProfile> => {
    const axios = await this.authenticationService.getAxiosClient();
    const request = await axios.get<AutoWrapperResponse<UserProfile>>(`/api/users/${id}/userProfile`, {
      headers: { Authorization: axios.defaults.headers.common.Authorization },
    });
    return request.data.result;
  };

  getPresence = async (
    id: string,
  ): Promise<MicrosoftGraph.Presence> => {
    const axios = await this.authenticationService.getAxiosClient();
    const request = await axios.get<AutoWrapperResponse<MicrosoftGraph.Presence>>(
      `/api/users/${id}/presence`,
    );
    return request.data.result;
  };

  getLocation = async (
    id: string,
    year: number,
    month: number,
    day: number,
  ): Promise<string> => {
    const axios = await this.authenticationService.getAxiosClient();
    const request = await axios.get<AutoWrapperResponse<string>>(`/api/users/${id}/location`, {
      params: { year, month, day },
    });
    return request.data.result;
  };

  getMultiUserAvailabilityTimes = async (
    userPrincipalNames: string[],
    year: number,
    month: number,
    day: number,
    scheduleFrom?: Date,
    scheduleTo?: Date,
  ): Promise<MultiUserAvailableTimesResponse> => {
    const axios = await this.authenticationService.getAxiosClient();
    const request = await axios.post<AutoWrapperResponse<MultiUserAvailableTimesResponse>>("/api/users/multi/availableTimes", {
      year, month, day, usersUpnList: userPrincipalNames, scheduleFrom, scheduleTo,
    });
    return request.data.result;
  };

  searchUsers = async (
    searchQuery?: string,
    options?: QueryOption[],
  ): Promise<UserSearchPagedResponse> => {
    const axios = await this.authenticationService.getAxiosClient();
    if (!searchQuery) {
      return { users: [], queryOptions: [] };
    }
    const request = await axios.get<AutoWrapperResponse<UserSearchPagedResponse>>("/api/users/search", {
      params: {
        searchString: searchQuery,
        QueryOptions: JSON.stringify(options),
      },
    });
    return request.data.result;
  };

  getUserCoordinates = async (
    users: string[],
    {
      year,
      month,
      day,
    }: UserCoordinateQueryParams,
  ): Promise<UserCoordianates[]> => {
    const axios = await this.authenticationService.getAxiosClient();
    const request = await axios.post<AutoWrapperResponse<UserCoordinatesResponse>>("/api/users/coordinates", {
      year, month, day, usersUpnList: users,
    });
    return request.data.result.userCoordinatesList;
  };

  /**
   * Function that returns a cached getUserCoordinates function.
   * @returns A cached user coordinate query.
   */
  createUserCoordinateService = ():
   CachedUserCoordinateQuery => createCachedQuery<UserCoordianates, UserCoordinateQueryParams>(
     this.generateUserCoordinateStoreKey,
     this.generateUserCoordinateRetrievalKey,
     this.getUserCoordinates,
   )
}
