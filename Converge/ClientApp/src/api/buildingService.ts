// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import AutoWrapperResponse from "../types/AutoWrapperResponse";
import BuildingBasicInfo from "../types/BuildingBasicInfo";
import BuildingSearchInfo from "../types/BuildingSearchInfo";
import CampusToCollaborate from "../types/CampusToCollaborate";
import { PhotoType, PlaceType } from "../types/ExchangePlace";
import ExchangePlacePhoto from "../types/ExchangePlacePhoto";
import { IExchangePlacesResponse } from "../types/IExchangePlacesResponse";
import Schedule from "../types/Schedule";
import UpcomingBuildingsResponse from "../types/UpcomingBuildingsResponse";
import AuthenticationService from "./AuthenticationService";
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

interface PlaceDetailsQueryParams {
  start: Date,
  end: Date,
}

export interface PlacePhotosResult {
  sharePointId: string;
  photos: ExchangePlacePhoto[];
  coverPhoto?: ExchangePlacePhoto;
  floorPlan?: ExchangePlacePhoto;
  allOtherPhotos: ExchangePlacePhoto[];
}

export default class BuildingService {
  private authenticationService: AuthenticationService

  private generatePlacePhotosResult = (
    sharePointId: string, photos:
    ExchangePlacePhoto[],
  ): PlacePhotosResult => {
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

  constructor(authenticationService: AuthenticationService) {
    this.authenticationService = authenticationService;
  }

  getBuildingPlaces = async (
    buildingUpn: string,
    placeType: PlaceType,
    params?: IGetBuildingPlacesRequestParams,
  ): Promise<IExchangePlacesResponse> => {
    const axios = await this.authenticationService.getAxiosClient();
    const type = placeType === PlaceType.Room ? "room" : "space";
    const request = await axios.get<AutoWrapperResponse<IExchangePlacesResponse>>(
      `/api/v1.0/buildings/${buildingUpn}/${type}s`, {
        params,
      },
    );
    return request.data.result;
  };

  getBuildingsByDistance = async (
    sourceGeoCoordinates?:string,
    distanceFromSource?:number,
  ): Promise<UpcomingBuildingsResponse> => {
    const axios = await this.authenticationService.getAxiosClient();
    const request = await axios.get<AutoWrapperResponse<UpcomingBuildingsResponse>>(
      "/api/v1.0/buildings/sortByDistance", {
        params: {
          sourceGeoCoordinates,
          distanceFromSource,
        },
      },
    );
    return request.data.result;
  };

  getBuildingByDisplayName = async (
    buildingDisplayName?:string,
  ): Promise<BuildingBasicInfo> => {
    const axios = await this.authenticationService.getAxiosClient();
    const request = await axios.get<AutoWrapperResponse<BuildingBasicInfo>>(
      `/api/v1.0/buildings/buildingByName/${buildingDisplayName}`, {
      },
    );
    return request.data.result;
  };

  getBuildingsByName = async (): Promise<UpcomingBuildingsResponse> => {
    const axios = await this.authenticationService.getAxiosClient();
    const request = await axios.get<AutoWrapperResponse<UpcomingBuildingsResponse>>(
      "/api/v1.0/buildings/sortByName",
    );
    return request.data.result;
  };

  getSearchForBuildings = async (searchString:string|undefined)
  : Promise<BuildingSearchInfo> => {
    const axios = await this.authenticationService.getAxiosClient();
    const request = await axios.get<AutoWrapperResponse<BuildingSearchInfo>>(
      `/api/v1.0/buildings/searchForBuildings/${searchString}`, {
        params: {
          searchString,
        },
      },
    );
    return request.data.result;
  };

  getBuildingSchedule = async (
    id: string, start: string, end: string,
  ): Promise<Schedule> => {
    const axios = await this.authenticationService.getAxiosClient();
    const request = await axios.get<AutoWrapperResponse<Schedule>>(`/api/v1.0/buildings/${id}/schedule`, {
      params: {
        start,
        end,
      },
    });
    return request.data.result;
  };

  getPlaceDetails = async (
    id: string,
    {
      start,
      end,
    }: PlaceDetailsQueryParams,
  ): Promise<CampusToCollaborate> => {
    const axios = await this.authenticationService.getAxiosClient();
    const request = await axios.get<AutoWrapperResponse<CampusToCollaborate>>(`/api/v1.0/places/${id}/details`, {
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

  getPlacePhotos = async (
    sharePointId: string,
  ): Promise<PlacePhotosResult> => {
    const axios = await this.authenticationService.getAxiosClient();
    const request = await axios.get<AutoWrapperResponse<ExchangePlacePhoto[]>>(`/api/v1.0/places/${sharePointId}/photos`, {
      cache: {
        maxAge: Constants.TWO_HOURS_IN_MILLISECONDS,
      },
    });
    return this.generatePlacePhotosResult(sharePointId, request.data.result);
  }
}
