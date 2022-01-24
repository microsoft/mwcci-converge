// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import AutoWrapperResponse from "../types/AutoWrapperResponse";
import BuildingSearchInfo from "../types/BuildingSearchInfo";
import CampusToCollaborate from "../types/CampusToCollaborate";
import ExchangePlace, { PhotoType, PlaceType } from "../types/ExchangePlace";
import ExchangePlacePhoto from "../types/ExchangePlacePhoto";
import Schedule from "../types/Schedule";
import UpcomingBuildingsResponse from "../types/UpcomingBuildingsResponse";
import getAxiosClient from "./AuthenticationService";
import Constants from "../utilities/Constants";

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
export const getPlaceDetails = async (
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
    cache: {
      maxAge: Constants.TWO_HOURS_IN_MILLISECONDS,
    },
  });
  return request.data.result;
};

export interface PlacePhotosResult {
  sharePointId: string;
  photos: ExchangePlacePhoto[];
  coverPhoto?: ExchangePlacePhoto;
  floorPlan?: ExchangePlacePhoto;
  allOtherPhotos: ExchangePlacePhoto[];
}

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

export const getPlacePhotos = async (
  sharePointId: string,
): Promise<PlacePhotosResult> => {
  const axios = await getAxiosClient();
  const request = await axios.get<AutoWrapperResponse<ExchangePlacePhoto[]>>(`/api/places/${sharePointId}/photos`, {
    cache: {
      maxAge: Constants.TWO_HOURS_IN_MILLISECONDS,
    },
  });
  return generateResultObject(sharePointId, request.data.result);
};
