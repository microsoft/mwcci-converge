// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useEffect, useState } from "react";
import BuildingService from "../api/buildingService";
import ExchangePlace, { PlaceType } from "../types/ExchangePlace";
import { IExchangePlacesResponse } from "../types/IExchangePlacesResponse";
import usePromise, { ILoadingState, IPromiseError } from "./usePromise";

interface BuildingPlacesFilterOptions {
  hasAudio?: boolean,
  hasVideo?: boolean,
  hasDisplay?: boolean,
  isWheelchairAccessible?: boolean,
}

interface IUseBuildingWorkspacesHookReturnType {
  placesLoading: ILoadingState,
  places: ExchangePlace[],
  placesError: IPromiseError<unknown>,
  requestBuildingPlaces: (
    placeType: PlaceType,
    itemsPerPage: number,
    filterOptions: BuildingPlacesFilterOptions,
    skipTokens?:string|undefined|null,
    clearList?: boolean,
  ) => Promise<IExchangePlacesResponse>,
  clearList: () => void,
  hasMore: boolean
}

function useBuildingPlaces(
  buildingService: BuildingService,
  buildingUpn?: string,
): IUseBuildingWorkspacesHookReturnType {
  const [
    placesLoading,
    placesResult,
    placesError,
    waitFor,
  ] = usePromise<IExchangePlacesResponse>(undefined, true);

  const [places, setPlaces] = useState<ExchangePlace[]>([]);

  const requestBuildingPlaces = (
    placeType: PlaceType,
    itemsPerPage: number,
    filterOptions?: BuildingPlacesFilterOptions,
    skipTokens?:string|undefined|null,
    clearList?: boolean,
  ) => {
    if (clearList) {
      setPlaces([]);
    }
    if (buildingUpn && placeType !== undefined) {
      const result = buildingService.getBuildingPlaces(
        buildingUpn,
        placeType,
        {
          topCount: itemsPerPage,
          skipToken: skipTokens,
          ...filterOptions,
        },
      );
      waitFor(result);
      return result;
    }
    setPlaces([]);
    const result = { exchangePlacesList: [], skipToken: "" };
    waitFor(Promise.resolve(result));
    return Promise.resolve(result);
  };

  const clearList = () => {
    setPlaces([]);
    waitFor(Promise.resolve({
      exchangePlacesList: [],
      skipToken: "",
    }));
  };

  // Add new items to the list everytime a new request is sent.
  useEffect(() => {
    setPlaces([
      ...places,
      ...(placesResult?.exchangePlacesList ?? []),
    ]);
  }, [placesResult]);

  return {
    placesLoading,
    places,
    placesError,
    requestBuildingPlaces,
    clearList,
    hasMore: !!placesResult?.skipToken,
  };
}

export default useBuildingPlaces;
