// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as MicrosoftGraph from "@microsoft/microsoft-graph-types";
import AutoWrapperResponse from "../types/AutoWrapperResponse";
import UserCoordinatesResponse from "../types/UserCoordinatesResponse";
import MultiUserAvailableTimesResponse from "../types/MultiUserAvailableTimesResponse";
import UserProfile from "../types/UserProfile";
import getAxiosClient from "./AuthenticationService";
import UserCoordianates from "../types/UserCoordinates";
import createCachedQuery, { CachedQuery } from "../utilities/CachedQuery";
import QueryOption from "../types/QueryOption";
import UserSearchPagedResponse from "../types/UserSearchPagedResponse";

const getCollaborator = async (userPrincipalName: string): Promise<MicrosoftGraph.User> => {
  const axios = await getAxiosClient();
  const response = await axios.get<AutoWrapperResponse<MicrosoftGraph.User>>(`/api/users/${userPrincipalName}`);
  return response.data.result;
};

export default getCollaborator;

interface UserPhotoResult {
  id: string;
  userPhoto: string | null;
}

const getUserPhoto = async (id: string): Promise<UserPhotoResult> => {
  const axios = await getAxiosClient();
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

const generateUserPhotoStoreKey = (
  result: UserPhotoResult,
): string => result.id;

const generateUserPhotoRetrievalKey = (search: string): string => search;

type CachedUserPhotoQuery = CachedQuery<UserPhotoResult>;

// Function that returns a cached getUserCoordinates function.
export function createUserPhotoService(): CachedUserPhotoQuery {
  return createCachedQuery<UserPhotoResult>(
    generateUserPhotoStoreKey,
    generateUserPhotoRetrievalKey,
    (ids: string[]) => getUserPhoto(ids[0])
      .then((result) => [result]),
  );
}

export const getUserProfile = async (id?: string): Promise<UserProfile> => {
  const axios = await getAxiosClient();
  const request = await axios.get<AutoWrapperResponse<UserProfile>>(`/api/users/${id}/userProfile`, {
    headers: { Authorization: axios.defaults.headers.common.Authorization },
  });
  return request.data.result;
};

export const getPresence = async (
  id: string,
): Promise<MicrosoftGraph.Presence> => {
  const axios = await getAxiosClient();
  const request = await axios.get<AutoWrapperResponse<MicrosoftGraph.Presence>>(
    `/api/users/${id}/presence`,
  );
  return request.data.result;
};

export const getLocation = async (
  id: string,
  year: number,
  month: number,
  day: number,
): Promise<string> => {
  const axios = await getAxiosClient();
  const request = await axios.get<AutoWrapperResponse<string>>(`/api/users/${id}/location`, {
    params: { year, month, day },
  });
  return request.data.result;
};

export const getMultiUserAvailabilityTimes = async (
  userPrincipalNames: string[],
  year: number,
  month: number,
  day: number,
  scheduleFrom?: Date,
  scheduleTo?: Date,
): Promise<MultiUserAvailableTimesResponse> => {
  const axios = await getAxiosClient();
  const request = await axios.post<AutoWrapperResponse<MultiUserAvailableTimesResponse>>("/api/users/multi/availableTimes", {
    year, month, day, usersUpnList: userPrincipalNames, scheduleFrom, scheduleTo,
  });
  return request.data.result;
};

export const searchUsers = async (
  searchString?: string,
): Promise<MicrosoftGraph.User[]> => {
  const axios = await getAxiosClient();
  if (!searchString) {
    return [];
  }
  const request = await axios.get<AutoWrapperResponse<MicrosoftGraph.User[]>>(`/api/users/search/${searchString}`);
  return request.data.result;
};

export const searchUsersByPage = async (
  searchQuery?: string,
  options?: QueryOption[],
): Promise<UserSearchPagedResponse> => {
  const axios = await getAxiosClient();
  if (!searchQuery) {
    return { users: [], queryOptions: [] };
  }
  const request = await axios.get<AutoWrapperResponse<UserSearchPagedResponse>>("/api/users/searchAndPage", {
    params: {
      searchString: searchQuery,
      QueryOptions: JSON.stringify(options),
    },
  });
  return request.data.result;
};

interface UserCoordinateQueryParams {
  year: number,
  month: number,
  day: number
}

const getUserCoordinates = async (
  users: string[],
  {
    year,
    month,
    day,
  }: UserCoordinateQueryParams,
): Promise<UserCoordianates[]> => {
  const axios = await getAxiosClient();
  const request = await axios.post<AutoWrapperResponse<UserCoordinatesResponse>>("/api/users/coordinates", {
    year, month, day, usersUpnList: users,
  });
  return request.data.result.userCoordinatesList;
};

const generateUserCoordinateStoreKey = (
  user: UserCoordianates,
  {
    day,
    month,
    year,
  }: UserCoordinateQueryParams,
) => `${user.userPrincipalName}-${year}/${month}/${day}`;

const generateUserCoordinateRetrievalKey = (search: string, {
  day,
  month,
  year,
}: UserCoordinateQueryParams) => `${search}-${year}/${month}/${day}`;

type CachedUserCoordinateQuery = CachedQuery<UserCoordianates, UserCoordinateQueryParams>;

// Function that returns a cached getUserCoordinates function.
export function createUserCoordinateService(): CachedUserCoordinateQuery {
  return createCachedQuery<UserCoordianates, UserCoordinateQueryParams>(
    generateUserCoordinateStoreKey,
    generateUserCoordinateRetrievalKey,
    getUserCoordinates,
  );
}
