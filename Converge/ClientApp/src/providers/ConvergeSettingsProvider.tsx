// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Alert, Button, Flex, Loader, Text,
} from "@fluentui/react-northstar";
import { GeoCoordinates } from "@microsoft/microsoft-graph-types";
import React, {
  useContext, useEffect, useReducer, useState,
} from "react";
import BuildingBasicInfo from "../types/BuildingBasicInfo";
import ConvergeSettings from "../types/ConvergeSettings";
import UpcomingBuildingsResponse from "../types/UpcomingBuildingsResponse";
import ExchangePlace from "../types/ExchangePlace";
import {
  USER_INTERACTION, UI_SECTION, UISections, DESCRIPTION,
} from "../types/LoggerTypes";
import { logEvent } from "../utilities/LogWrapper";
import { useApiProvider } from "./ApiProvider";

type IBuildingState = {
  buildingsList: BuildingBasicInfo[];
  buildingListLoading: boolean;
  buildingsByRadiusDistance: number,
  loadMoreBuildingsByDistance: boolean,
  buildingsListError: boolean;
  dropDownBuildingsList:BuildingBasicInfo[]
  searchString?: string;
  buildingsLoadingMessage?: string;
  recentBuildings: BuildingBasicInfo[];
}

interface IConvergeContext {
  state: IBuildingState;
  convergeSettings: ConvergeSettings | null,
  getConvergeSettings: () => Promise<void>,
  favoriteCampuses: ExchangePlace[],
  getFavoriteCampuses: () => Promise<void>,
  setConvergeSettings: (convergeSettings: ConvergeSettings) => Promise<void>,
  setupNewUser: (convergeSettings: ConvergeSettings) => Promise<void>,
  loadBuildingsByDistance: (geoCoordinates: GeoCoordinates) => void;
  loadBuildingsByName: () => void;
  setBuildingListLoading: (currentState: boolean) => void;
  setBuildingsByDistanceRadius: (upcomingReservationDistance: number) => void;
  setBuildingsListError: (currentState: boolean) => void;
  updateSearchString: (searchString?: string) => void;
  searchMoreBuildings:(
    searchString?: string,
    presetBuildings?: string[],
    ) => void;
  getRecentBuildings: () => Promise<void>;
}

const ConvergeSettingsContext = React.createContext<IConvergeContext>(
  { } as IConvergeContext,
);

const GET_CONVERGE_SETTINGS_REQUEST = "GET_CONVERGE_SETTINGS_REQUEST";
const GET_CONVERGE_SETTINGS_RESPONSE = "GET_CONVERGE_SETTINGS_RESPONSE";
const SET_CONVERGE_SETTINGS_REQUEST = "SET_CONVERGE_SETTINGS_REQUEST";
const SETUP_NEW_USER_RESPONSE = "SETUP_NEW_USER_RESPONSE";

interface GetConvergeSettingsRequestAction {
  type: typeof GET_CONVERGE_SETTINGS_REQUEST;
}

interface GetConvergeSettingsResponseAction {
  type: typeof GET_CONVERGE_SETTINGS_RESPONSE;
  convergeSettings: ConvergeSettings | null;
}

interface SetConvergeSettingsRequestAction {
  type: typeof SET_CONVERGE_SETTINGS_REQUEST;
  convergeSettings: ConvergeSettings;
}

interface SetupNewUserResponseAction {
  type: typeof SETUP_NEW_USER_RESPONSE;
  convergeSettings: ConvergeSettings;
}

type ConvergeSettingsAction =
  GetConvergeSettingsRequestAction |
  GetConvergeSettingsResponseAction |
  SetConvergeSettingsRequestAction |
  SetupNewUserResponseAction;

function convergeSettingsReducer(
  state: ConvergeSettings | null,
  action: ConvergeSettingsAction,
): ConvergeSettings | null {
  switch (action.type) {
    case GET_CONVERGE_SETTINGS_REQUEST:
      return {};
    case GET_CONVERGE_SETTINGS_RESPONSE:
      return {
        ...state,
        ...action.convergeSettings,
      };
    case SET_CONVERGE_SETTINGS_REQUEST:
      return {
        ...state,
        ...action.convergeSettings,
      };
    case SETUP_NEW_USER_RESPONSE:
      return {
        ...state,
        ...action.convergeSettings,
      };
    default:
      return state;
  }
}

const UPDATE_BUILDINGS_LIST = "UPDATE_BUILDINGS_LIST";
const UPDATE_BUILDINGS_LIST_LOADING = "UPDATE_BUILDINGS_LIST_LOADING";
const SET_BUILDINGS_DISTANCE = "SET_BUILDINGS_DISTANCE";
const LOAD_MORE_BUILDINGS = "LOAD_MORE_BUILDINGS";
const UPDATE_BUILDINGS_LIST_ERROR = "UPDATE_BUILDINGS_LIST_ERROR";
const UPDATE_SEARCH_STRING = "UPDATE_SEARCH_STRING";
const UPDATE_SEARCH_BUILDINGS_LIST = "UPDATE_SEARCH_BUILDINGS_LIST";
const BUILDINGS_LOADING_MESSAGE = "BUILDINGS_LOADING_MESSAGE";
const UPDATE_RECENT_BUILDINGS = "UPDATE_RECENT_BUILDINGS";

interface loadBuildingsByDistanceAction {
  type: typeof UPDATE_BUILDINGS_LIST,
  payload: UpcomingBuildingsResponse;
}

interface UpdateBuildingsListLoadingAction {
  type: typeof UPDATE_BUILDINGS_LIST_LOADING,
  payload: boolean;
}

interface SetUpcomingBuildingDistanceAction {
  type: typeof SET_BUILDINGS_DISTANCE,
  payload: number,
}

interface LoadMoreBuildingsAction {
  type: typeof LOAD_MORE_BUILDINGS,
  payload: UpcomingBuildingsResponse,
}

interface UpdateBuildingsListErrorAction {
  type: typeof UPDATE_BUILDINGS_LIST_ERROR,
  payload: boolean;
}

interface UpdateSearchString {
  type: typeof UPDATE_SEARCH_STRING,
  payload?: string,
}

interface UpdateSearchBuildingListAction {
  type: typeof UPDATE_SEARCH_BUILDINGS_LIST,
  payload: BuildingBasicInfo[],
}

interface UpdateBuildingsLoadingMessageAction {
    type: typeof BUILDINGS_LOADING_MESSAGE,
    payload: string | undefined;
}

interface UpdateRecentBuildingsAction {
  type: typeof UPDATE_RECENT_BUILDINGS,
  payload: BuildingBasicInfo[],
}

type IBuildingAction = loadBuildingsByDistanceAction
| UpdateBuildingsListLoadingAction
| SetUpcomingBuildingDistanceAction
| LoadMoreBuildingsAction
| UpdateBuildingsListErrorAction
| UpdateSearchString
| UpdateSearchBuildingListAction
| UpdateBuildingsLoadingMessageAction
| UpdateRecentBuildingsAction;

const GET_FAVORITE_CAMPUSES_REQUEST = "GET_FAVORITE_CAMPUSES_REQUEST";
const GET_FAVORITE_CAMPUSES_RESPONSE = "GET_FAVORITE_CAMPUSES_RESPONSE";

interface GetFavoriteCampusesRequestAction {
  type: typeof GET_FAVORITE_CAMPUSES_REQUEST;
}

interface GetFavoriteCampusesResponseAction {
  type: typeof GET_FAVORITE_CAMPUSES_RESPONSE;
  favoriteCampuses: ExchangePlace[];
}

type IPlaceAction = GetFavoriteCampusesRequestAction | GetFavoriteCampusesResponseAction;

const iState: IBuildingState = {
  buildingsList: [],
  buildingListLoading: false,
  buildingsByRadiusDistance: 10,
  loadMoreBuildingsByDistance: true,
  buildingsListError: false,
  dropDownBuildingsList: [],
  searchString: "",
  buildingsLoadingMessage: undefined,
  recentBuildings: [],
};

const reducer = (state: IBuildingState, action: IBuildingAction): IBuildingState => {
  switch (action.type) {
    case UPDATE_BUILDINGS_LIST: {
      const newState = {
        ...state,
        buildingsList: action.payload.buildingsList,
        loadMoreBuildingsByDistance: action.payload.loadMore,
        dropDownBuildingsList: action.payload.buildingsList,
      };
      return {
        ...newState,
      };
    }

    case UPDATE_BUILDINGS_LIST_LOADING: {
      const newState = {
        ...state,
        buildingListLoading: action.payload,
      };
      return {
        ...newState,
      };
    }

    case SET_BUILDINGS_DISTANCE: {
      const newState = {
        ...state,
        buildingsByRadiusDistance: action.payload,
      };
      return {
        ...newState,
      };
    }

    case LOAD_MORE_BUILDINGS: {
      const newState = {
        ...state,
        buildingsList: action.payload.buildingsList,
        loadMoreBuildingsByDistance: action.payload.loadMore,
        dropDownBuildingsList: action.payload.buildingsList,
      };
      return {
        ...newState,
      };
    }

    case UPDATE_BUILDINGS_LIST_ERROR: {
      const newState = {
        ...state,
        buildingsListError: action.payload,
      };
      return {
        ...newState,
      };
    }

    case UPDATE_SEARCH_STRING: {
      const newState = {
        ...state,
        searchString: action.payload,
      };
      return {
        ...newState,
      };
    }

    case UPDATE_SEARCH_BUILDINGS_LIST: {
      const newState = {
        ...state,
        buildingsList: action.payload,
      };
      return {
        ...newState,
      };
    }

    case BUILDINGS_LOADING_MESSAGE: {
      return {
        ...state,
        buildingsLoadingMessage: action.payload,
      };
    }

    case UPDATE_RECENT_BUILDINGS: {
      const newState = {
        ...state,
        recentBuildings: action.payload,
      };
      return {
        ...newState,
      };
    }

    default:
      return state;
  }
};

function favoriteCampusesReducer(state: ExchangePlace[], action: IPlaceAction): ExchangePlace[] {
  switch (action.type) {
    case GET_FAVORITE_CAMPUSES_REQUEST:
      return state;
    case GET_FAVORITE_CAMPUSES_RESPONSE:
      return action.favoriteCampuses;
    default:
      return [];
  }
}

const ConvergeSettingsProvider: React.FC = ({ children }) => {
  const {
    buildingService,
    meService,
  } = useApiProvider();
  const [convergeSettings, convergeSettingsDispatch] = useReducer<
    ConvergeSettings | null, ConvergeSettingsAction>(
      convergeSettingsReducer,
      { },
    );

  const [state, dispatch] = useReducer(
    reducer,
    { ...iState },
  );

  const [favoriteCampuses, favoriteCampusesDispatch] = useReducer<ExchangePlace[], IPlaceAction>(
    favoriteCampusesReducer, [],
  );

  const getConvergeSettings = (): Promise<void> => {
    convergeSettingsDispatch({ type: GET_CONVERGE_SETTINGS_REQUEST });
    return meService.getSettings()
      .then((settings) => {
        convergeSettingsDispatch(
          { type: GET_CONVERGE_SETTINGS_RESPONSE, convergeSettings: settings },
        );
      });
  };

  const setConvergeSettings = (settings: ConvergeSettings): Promise<void> => meService
    .setSettings(settings)
    .then(() => convergeSettingsDispatch({
      type: SET_CONVERGE_SETTINGS_REQUEST,
      convergeSettings: settings,
    }));

  const setupNewUserWrapper = (settings: ConvergeSettings): Promise<void> => meService
    .setupNewUser(settings)
    .then(() => {
      convergeSettingsDispatch({ type: SETUP_NEW_USER_RESPONSE, convergeSettings: settings });
    });

  const getFavoriteCampusesWrapper = (): Promise<void> => {
    favoriteCampusesDispatch({ type: GET_FAVORITE_CAMPUSES_REQUEST });
    return meService.getFavoritePlaces()
      .then((favs) => {
        favoriteCampusesDispatch({ type: GET_FAVORITE_CAMPUSES_RESPONSE, favoriteCampuses: favs });
      });
  };

  const setBuildingListLoading = (isLoading: boolean) => {
    dispatch({
      type: UPDATE_BUILDINGS_LIST_LOADING,
      payload: isLoading,
    });
  };

  const setBuildingsListError = (isError: boolean) => {
    dispatch({
      type: UPDATE_BUILDINGS_LIST_ERROR,
      payload: isError,
    });
  };

  const setBuildingsByDistanceRadius = (distance: number) => {
    dispatch({ type: SET_BUILDINGS_DISTANCE, payload: distance });
  };

  const setBuildingsLoadingMessage = (message?: string) => {
    dispatch({ type: BUILDINGS_LOADING_MESSAGE, payload: message });
  };

  const loadBuildingsByDistance = (geoCoordinates: GeoCoordinates) => {
    setBuildingListLoading(true);
    setBuildingsLoadingMessage("No nearby results, expanding search.");
    buildingService.getBuildingsByDistance(`${geoCoordinates.latitude},${geoCoordinates.longitude}`, 10)
      .then((response) => {
        if (response.buildingsList.length === 0 && state.buildingsByRadiusDistance < 1000) {
          setBuildingsByDistanceRadius(state.buildingsByRadiusDistance * 10);
        } else if (response.buildingsList.length === 0 && state.buildingsByRadiusDistance < 4000) {
          setBuildingsByDistanceRadius(state.buildingsByRadiusDistance + 1000);
        }
        dispatch({ type: UPDATE_BUILDINGS_LIST, payload: response });
      })
      .finally(() => {
        setBuildingListLoading(false);
        setBuildingsLoadingMessage(undefined);
      })
      .catch(() => setBuildingsListError(true));
  };

  const loadBuildingsByName = () => {
    setBuildingListLoading(true);
    buildingService.getBuildingsByName()
      .then((response) => {
        dispatch({ type: UPDATE_BUILDINGS_LIST, payload: response });
      })
      .finally(() => setBuildingListLoading(false))
      .catch(() => setBuildingsListError(true));
  };

  const loadMoreBuildingsByDistance = (geoCoordinates: GeoCoordinates, distance: number) => {
    setBuildingListLoading(true);
    buildingService.getBuildingsByDistance(`${geoCoordinates.latitude},${geoCoordinates.longitude}`, distance)
      .then((response) => {
        dispatch({ type: UPDATE_BUILDINGS_LIST, payload: response });
      })
      .finally(() => setBuildingListLoading(false))
      .catch(() => setBuildingsListError(true));
  };

  const searchMoreBuildings = (
    searchString?: string,
  ) => {
    setBuildingListLoading(true);
    buildingService.getSearchForBuildings(searchString).then((data) => {
      dispatch({
        type: UPDATE_SEARCH_BUILDINGS_LIST,
        payload: data.buildingInfoList,
      });
    }).finally(() => setBuildingListLoading(false))
      .catch(() => { setBuildingListLoading(false); setBuildingsListError(true); });
  };

  const updateSearchString = (searchString?: string|undefined) => {
    if (searchString === "") {
      dispatch({
        type: UPDATE_SEARCH_BUILDINGS_LIST,
        payload: state.dropDownBuildingsList,
      });
    } else {
      dispatch({ type: UPDATE_SEARCH_STRING, payload: searchString });
      searchMoreBuildings(searchString);
    }
  };

  const updateRecentBuildings = (recentBuildings: BuildingBasicInfo[]) => {
    dispatch({ type: UPDATE_RECENT_BUILDINGS, payload: recentBuildings });
  };

  const getRecentBuildings = () => meService
    .getRecentBuildingsBasicDetails()
    .then(updateRecentBuildings);

  useEffect(() => {
    if (state.buildingsByRadiusDistance !== 10 && convergeSettings?.geoCoordinates) {
      loadMoreBuildingsByDistance(convergeSettings.geoCoordinates, state.buildingsByRadiusDistance);
    }
  }, [state.buildingsByRadiusDistance]);

  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    getConvergeSettings()
      .catch(() => setIsError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ConvergeSettingsContext.Provider
      value={{
        state,
        convergeSettings,
        getConvergeSettings,
        setConvergeSettings,
        setupNewUser: setupNewUserWrapper,
        favoriteCampuses,
        getFavoriteCampuses: getFavoriteCampusesWrapper,
        setBuildingListLoading,
        loadBuildingsByDistance,
        loadBuildingsByName,
        setBuildingsByDistanceRadius,
        setBuildingsListError,
        searchMoreBuildings,
        updateSearchString,
        getRecentBuildings,
      }}
    >
      {loading && <Loader />}
      {!loading && isError && (
        <Alert
          danger
          styles={{ margin: "36px" }}
          content={(
            <Flex hAlign="center">
              <Text
                content="The application was unable to load."
                styles={{
                  minWidth: "0px !important",
                  paddingTop: "0.4rem",
                }}
              />
              <Button
                content={(
                  <Text
                    content="Try again"
                    styles={{
                      minWidth: "0px !important",
                      paddingTop: "0.4rem",
                      textAlign: "center",
                    }}
                  />
                  )}
                text
                onClick={() => {
                  logEvent(USER_INTERACTION, [
                    { name: UI_SECTION, value: UISections.ApplicationUnavailable },
                    { name: DESCRIPTION, value: "refreshHomePage" },
                  ]);
                  window.location.reload();
                }}
                color="red"
                styles={{
                  minWidth: "0px !important", paddingTop: "0.2rem", textDecoration: "UnderLine", color: "rgb(196, 49, 75)",
                }}
              />
            </Flex>
          )}
        />
      )}
      {!loading && !isError && children}
    </ConvergeSettingsContext.Provider>
  );
};

export const useConvergeSettingsContextProvider = (): IConvergeContext => useContext(
  ConvergeSettingsContext,
);

export default ConvergeSettingsProvider;
