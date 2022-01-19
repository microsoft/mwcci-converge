// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import AutoWrapperResponse from "../types/AutoWrapperResponse";
import BuildingSearchInfo from "../types/BuildingSearchInfo";
import CampusToCollaborate from "../types/CampusToCollaborate";
import ExchangePlace, { PhotoType, PlaceType } from "../types/ExchangePlace";
import ExchangePlacePhoto from "../types/ExchangePlacePhoto";
import Schedule from "../types/Schedule";
import UpcomingBuildingsResponse from "../types/UpcomingBuildingsResponse";
import createCachedQuery, { CachedQuery } from "../utilities/CachedQuery";
import getAxiosClient from "./AuthenticationService";

interface IGetBuildingPlacesRequestParams {
  topCount?: number;
  skipToken?: string | null | undefined;
  hasAudio?: boolean;
  hasVideo?: boolean;
  hasDisplay?: boolean;
  isAccessbile?: boolean;
  displayNameSearchString?: string;
}

export interface IExchangePlacesResponse {
  exchangePlacesList: ExchangePlace[];
  skipToken: string | null;
}

export const getBuildingPlaces = async (
  buildingUpn: string,
  placeType: PlaceType,
  params?: IGetBuildingPlacesRequestParams,
): Promise<IExchangePlacesResponse> => {
  const axios = await getAxiosClient();
  const type = placeType === PlaceType.Room ? "room" : "space";
  const request = await axios.get<AutoWrapperResponse<IExchangePlacesResponse>>(
    `/api/buildings/${buildingUpn}/${type}s`, {
      params,
    },
  );
  return request.data.result;
};

export const getBuildingsByDistance = async (
  sourceGeoCoordinates?:string,
  distanceFromSource?:number,
): Promise<UpcomingBuildingsResponse> => {
  const axios = await getAxiosClient();
  const request = await axios.get<AutoWrapperResponse<UpcomingBuildingsResponse>>(
    "/api/buildings/sortByDistance", {
      params: {
        sourceGeoCoordinates,
        distanceFromSource,
      },
    },
  );
  return request.data.result;
};

export const getBuildingsByName = async (): Promise<UpcomingBuildingsResponse> => {
  const axios = await getAxiosClient();
  const request = await axios.get<AutoWrapperResponse<UpcomingBuildingsResponse>>(
    "/api/buildings/sortByName",
  );
  return request.data.result;
};

export const getSearchForBuildings = async (searchString:string|undefined)
: Promise<BuildingSearchInfo> => {
  const axios = await getAxiosClient();
  const request = await axios.get<AutoWrapperResponse<BuildingSearchInfo>>(
    `/api/buildings/searchForBuildings/${searchString}`, {
      params: {
        searchString,
      },
    },
  );
  return request.data.result;
};

export const getBuildingSchedule = async (
  id: string, start: string, end: string,
): Promise<Schedule> => {
  const axios = await getAxiosClient();
  const request = await axios.get<AutoWrapperResponse<Schedule>>(`/api/buildings/${id}/schedule`, {
    params: {
      start,
      end,
    },
  });
  return request.data.result;
};

interface PlaceDetailsQueryParams {
  start: Date,
  end: Date,
}
const getPlaceDetails = async (
  id: string,
  {
    start,
    end,
  }: PlaceDetailsQueryParams,
): Promise<CampusToCollaborate> => {
  const axios = await getAxiosClient();
  const request = await axios.get<AutoWrapperResponse<CampusToCollaborate>>(`/api/places/${id}/details`, {
    params: {
      start,
      end,
    },
  });
  return request.data.result;
};

const createCacheTimestamp = (date: Date): string => `${date.getDate()}/${date.getMonth()}/${date.getFullYear()}T${date.getHours()}`;

export const generatePlaceDetailsStoreKey = (
  campus: CampusToCollaborate,
  {
    start,
    end,
  }: PlaceDetailsQueryParams,
): string => `${campus.identity}-${createCacheTimestamp(start)}/${createCacheTimestamp(end)}`;

export const generatePlaceDetailsRetrievalKey = (search: string, {
  start,
  end,
}: PlaceDetailsQueryParams): string => `${search}-${createCacheTimestamp(start)}/${createCacheTimestamp(end)}`;

type CachedPlaceDetailsQuery = CachedQuery<CampusToCollaborate, PlaceDetailsQueryParams>;

interface PlacePhotosResult {
  sharePointId: string;
  photos: ExchangePlacePhoto[];
  coverPhoto?: ExchangePlacePhoto;
  floorPlan?: ExchangePlacePhoto;
  allOtherPhotos: ExchangePlacePhoto[];
}

// Function that returns a cached getUserCoordinates function.
export function createCachedPlaceDetailsQuery(): CachedPlaceDetailsQuery {
  return createCachedQuery<CampusToCollaborate, PlaceDetailsQueryParams>(
    generatePlaceDetailsStoreKey,
    generatePlaceDetailsRetrievalKey,
    (entities: string[], params: PlaceDetailsQueryParams) => getPlaceDetails(entities[0], params)
      .then((item) => [item]),
  );
}

const getPlacePhotos = async (
  sharePointId: string,
): Promise<ExchangePlacePhoto[]> => {
  const axios = await getAxiosClient();
  const request = await axios.get<AutoWrapperResponse<ExchangePlacePhoto[]>>(`/api/places/${sharePointId}/photos`);
  return request.data.result;
};

const generatePlacePhotosStoreKey = (
  photos: PlacePhotosResult,
): string => photos.sharePointId;

const generatePlacePhotosRetrievalKey = (search: string): string => search;

type CachedPlacePhotosQuery = CachedQuery<PlacePhotosResult>;

function generateResultObject(
  sharePointId: string, photos:
  ExchangePlacePhoto[],
): PlacePhotosResult {
  const coverPhoto = photos.find((p) => p.photoType === PhotoType.Cover);
  const floorPlan = photos.find((p) => p.photoType === PhotoType.FloorPlan);
  const allOtherPhotos = photos.filter(
    (p) => p.photoType !== PhotoType.FloorPlan && p.photoType !== PhotoType.Cover,
  );

  return {
    sharePointId,
    photos,
    coverPhoto,
    floorPlan,
    allOtherPhotos,
  };
}

// Function that returns a cached getUserCoordinates function.
export function createCachedPlacePhotosQuery(): CachedPlacePhotosQuery {
  return createCachedQuery<PlacePhotosResult>(
    generatePlacePhotosStoreKey,
    generatePlacePhotosRetrievalKey,
    (entities: string[]) => getPlacePhotos(entities[0])
      // Add sharepointid to results for caching purposes.
      .then((photos) => generateResultObject(entities[0], photos))
      .then((item) => [item]),
  );
}
