// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { User } from "@microsoft/microsoft-graph-types";
import { Dayjs } from "dayjs";
import React, { createContext, useContext, useEffect } from "react";
import CampusesToCollaborateRequest from "../types/CampusesToCollaborateRequest";
import CampusesToCollaborateResponse from "../types/CampusesToCollaborateResponse";
import CampusToCollaborate from "../types/CampusToCollaborate";
import { CollaborationVenueType, getCollaborationVenueTypeString } from "../types/ExchangePlace";
import VenuesToCollaborateResponse from "../types/VenuesToCollaborateResponse";
import VenueToCollaborate from "../types/VenueToCollaborate";
import useEnhancedReducer from "../utilities/enhancedReducer";
import { useApiProvider } from "./ApiProvider";
import { getDefaultTime } from "./PlaceFilterProvider";

const SET_START_TIME = "SET_START_TIME";
const SET_END_TIME = "SET_END_TIME";
const SET_VENUE_TYPE = "SET_VENUE_TYPE";
const SET_SELECTED_USERS = "SET_SELECTED_USERS";
const SET_MEET_USERS = "SET_MEET_USERS";
const SEARCH_PLACES_REQUEST = "SEARCH_PLACES_REQUEST";
const SEARCH_PLACES_RESPONSE = "SEARCH_PLACES_RESPONSE";
const SEARCH_PLACES_ERROR = "SEARCH_PLACES_ERROR";
const SET_MAP_PLACES = "SET_MAP_PLACES";
const SET_PLACES_LOADING = "SET_PLACES_LOADING";
const CLEAR_PLACES_SEARCH = "CLEAR_PLACES_SEARCH";
const SET_START_AND_END_TIME = "SET_START_AND_END_TIME";
const SET_LOGIN_USER = "SET_LOGIN_USER";
const SET_VENUE_SKIP = "SET_VENUE_SKIP";
const SEARCH_PLACES_LOAD_MORE_RESPONSE = "SEARCH_PLACES_LOAD_MORE_RESPONSE";
const SEARCH_PLACES_LOAD_MORE_REQUEST = "SEARCH_PLACES_LOAD_MORE_REQUEST";
const SET_CAMPUS_SEARCH_RANGE = "SET_CAMPUS_SEARCH_RANGE";

interface SetStartTimeAction {
  type: typeof SET_START_TIME;
  payload: Dayjs;
}

interface SetEndTimeAction {
  type: typeof SET_END_TIME;
  payload: Dayjs;
}

interface SetVenueTypeAction {
  type: typeof SET_VENUE_TYPE;
  payload: CollaborationVenueType;
}

interface SetSelectedUsersAction {
  type: typeof SET_SELECTED_USERS;
  payload: User[];
}

interface SetMeetUsersAction {
  type: typeof SET_MEET_USERS;
  payload: string[];
}

interface SetLoginUserAction {
  type: typeof SET_LOGIN_USER;
  payload: string;
}

interface SearchPlacesRequestAction {
  type: typeof SEARCH_PLACES_REQUEST;
}

interface SearchPlacesResponseAction {
  type: typeof SEARCH_PLACES_RESPONSE;
  payload: (CampusToCollaborate|VenueToCollaborate)[];
}

interface SearchPlacesErrorAction {
  type: typeof SEARCH_PLACES_ERROR;
}

interface SetMapPlacesAction {
  type: typeof SET_MAP_PLACES;
  payload: (CampusToCollaborate|VenueToCollaborate)[];
}

interface SetPlacesLoadingAction {
  type: typeof SET_PLACES_LOADING;
  payload: boolean;
}

interface ClearPlaceSearch {
  type: typeof CLEAR_PLACES_SEARCH;
}

interface SetStartAndEndTimeAction {
  type: typeof SET_START_AND_END_TIME;
  payload: { startTime: Dayjs, endTime: Dayjs }
}

interface SetVenueSkipAction {
  type: typeof SET_VENUE_SKIP;
  payload: number;
}

interface LoadMorePlacesResponseAction {
  type: typeof SEARCH_PLACES_LOAD_MORE_RESPONSE;
  payload: (CampusToCollaborate|VenueToCollaborate)[];
}

interface LoadMorePlacesRequestAction {
  type: typeof SEARCH_PLACES_LOAD_MORE_REQUEST;
}

interface SetCampusSearchRangeAction {
  type: typeof SET_CAMPUS_SEARCH_RANGE;
  payload: number;
}

type ISearchAction =
  SetStartTimeAction
  | SetEndTimeAction
  | SetVenueTypeAction
  | SetSelectedUsersAction
  | SetMeetUsersAction
  | SearchPlacesRequestAction
  | SearchPlacesResponseAction
  | SearchPlacesErrorAction
  | SetMapPlacesAction
  | SetPlacesLoadingAction
  | SetLoginUserAction
  | ClearPlaceSearch
  | SetStartAndEndTimeAction
  | SetVenueSkipAction
  | LoadMorePlacesResponseAction
  | LoadMorePlacesRequestAction
  | SetCampusSearchRangeAction;

interface ISearchState {
  placesToCollaborate: (CampusToCollaborate|VenueToCollaborate)[];
  mapPlaces: (CampusToCollaborate|VenueToCollaborate)[];
  startTime: Dayjs;
  endTime: Dayjs;
  venueType: CollaborationVenueType | undefined;
  selectedUsers: User[];
  loginUser:string;
  meetUsers: string[];
  searchPlacesError?: string;
  placesLoading: boolean;
  emptyStatePlacesLoading: boolean;
  venueSkip: number;
  loadMorePlacesLoading: boolean;
  campusSearchRangeInMiles: number;
}

interface ISearchProviderModel {
  state: ISearchState;
  setStartTime: (startTime: Dayjs) => void;
  setEndTime: (endTime: Dayjs) => void;
  setVenueType: (venueType: CollaborationVenueType) => void;
  setSelectedUsers: (users: User[]) => void;
  setMeetUsers: (meetUsers: string[]) => void;
  searchPlacesToCollaborate: (force?: boolean, specificRange?: number) => void;
  setLoginUser:(loginUser:string) => void;
  setMapPlaces: (mapPlaces: (CampusToCollaborate|VenueToCollaborate)[]) => void;
  setPlacesLoading: (placesLoading: boolean) => void;
  clearPlaceSearch: () => void;
  setStartAndEndTime: (startTime: Dayjs, endTime: Dayjs) => void;
  setVenueSkip: (skip: number) => void;
  setCampusSearchRange: (range: number) => void;
}

const iState: ISearchState = {
  placesToCollaborate: [],
  startTime: getDefaultTime(),
  endTime: getDefaultTime().add(30, "minutes"),
  venueType: undefined,
  selectedUsers: [],
  meetUsers: [],
  searchPlacesError: undefined,
  placesLoading: false,
  mapPlaces: [],
  emptyStatePlacesLoading: false,
  loginUser: "",
  venueSkip: 0,
  loadMorePlacesLoading: false,
  campusSearchRangeInMiles: 10,
};

const Context = createContext({} as ISearchProviderModel);

const reducer = (state: ISearchState, action: ISearchAction): ISearchState => {
  switch (action.type) {
    case SET_START_TIME:
      return {
        ...state,
        startTime: action.payload,
      };
    case SET_END_TIME:
      return {
        ...state,
        endTime: action.payload,
      };
    case SET_START_AND_END_TIME:
      return {
        ...state,
        startTime: action.payload.startTime,
        endTime: action.payload.endTime,
      };
    case SET_VENUE_TYPE:
      return {
        ...state,
        venueType: action.payload,
      };
    case SET_SELECTED_USERS:
      return {
        ...state,
        selectedUsers: action.payload,
      };
    case SET_MEET_USERS:
      return {
        ...state,
        meetUsers: action.payload,
      };
    case SET_LOGIN_USER:
      return {
        ...state,
        loginUser: action.payload,
      };
    case SEARCH_PLACES_REQUEST:
      return {
        ...state,
        placesToCollaborate: [],
        placesLoading: true,
      };
    case SEARCH_PLACES_RESPONSE:
      return {
        ...state,
        placesToCollaborate: action.payload,
        mapPlaces: action.payload,
        placesLoading: false,
      };
    case SEARCH_PLACES_ERROR:
      return {
        ...state,
        placesLoading: false,
        searchPlacesError: "We were unable to retrieve your results. Please try again.",
      };
    case SET_MAP_PLACES:
      return {
        ...state,
        mapPlaces: action.payload,
      };
    case SET_PLACES_LOADING:
      return {
        ...state,
        emptyStatePlacesLoading: action.payload,
      };
    case CLEAR_PLACES_SEARCH:
      return {
        ...state,
        placesToCollaborate: [],
        venueType: CollaborationVenueType.Workspace,
        placesLoading: false,
        campusSearchRangeInMiles: 10,
      };
    case SET_VENUE_SKIP:
      return {
        ...state,
        venueSkip: action.payload,
      };
    case SEARCH_PLACES_LOAD_MORE_REQUEST:
      return {
        ...state,
        loadMorePlacesLoading: true,
      };
    case SEARCH_PLACES_LOAD_MORE_RESPONSE:
      return {
        ...state,
        placesToCollaborate: state.placesToCollaborate.concat(action.payload),
        mapPlaces: state.placesToCollaborate.concat(action.payload),
        loadMorePlacesLoading: false,
      };
    case SET_CAMPUS_SEARCH_RANGE:
      return {
        ...state,
        campusSearchRangeInMiles: action.payload,
      };
    default:
      return state;
  }
};

export const getCampusSearchNextRange = (currentRange: number, reset?: boolean) : number => {
  let newRange = 0;
  if (reset) {
    newRange = 10;
  }
  if (currentRange <= 4000) {
    if (currentRange < 1000) {
      newRange = currentRange * 10;
    } else {
      newRange = currentRange + 1000;
    }
  }
  if (newRange !== 0) {
    return newRange;
  }
  return currentRange;
};

const SearchContextProvider: React.FC = ({ children }) => {
  const { searchService } = useApiProvider();
  const [state, dispatch, getState] = useEnhancedReducer(
    reducer,
    { ...iState },
  );

  const setPlacesLoading = (placesLoading: boolean) => {
    dispatch({ type: SET_PLACES_LOADING, payload: placesLoading });
  };

  const searchPlaces = (
    searchState: ISearchState,
    specificRange?: number,
  ): Promise<CampusesToCollaborateResponse | VenuesToCollaborateResponse> => {
    const userList: string[] = [];
    userList.push(searchState.loginUser);
    searchState.selectedUsers.forEach((user) => {
      if (user.userPrincipalName) {
        userList.push(user.userPrincipalName);
      }
    });
    if (
      searchState.venueType === CollaborationVenueType.Workspace
        || searchState.venueType === CollaborationVenueType.ConferenceRoom
    ) {
      const request:CampusesToCollaborateRequest = {
        capacitySortOrder: "Asc",
        teamMembers: userList,
        endTime: searchState.endTime.utc().toDate(),
        startTime: searchState.startTime.utc().toDate(),
        placeType: searchState.venueType === CollaborationVenueType.Workspace ? "space" : "room",
        // If multiple meetUsers, it will use location in between.
        closeToUser: searchState.meetUsers.length > 1 ? "" : searchState.meetUsers[0],
        distanceFromSource: specificRange ?? searchState.campusSearchRangeInMiles,
      };
      return searchService.searchCampusesToCollaborate(request);
    }
    return searchService.searchVenuesToCollaborate({
      teamMembers: userList,
      venueType: getCollaborationVenueTypeString(searchState.venueType as CollaborationVenueType),
      endTime: searchState.endTime.utc().toDate(),
      startTime: searchState.startTime.utc().toDate(),
      // If multiple meetUsers, it will use location in between.
      closeToUser: searchState.meetUsers.length > 1 ? "" : searchState.meetUsers[0],
      skip: searchState.venueSkip,
      limit: 30,
    });
  };

  const setCampusSearchRange = (range: number) => {
    dispatch({
      type: SET_CAMPUS_SEARCH_RANGE,
      payload: range,
    });
  };

  const searchPlacesToCollaborate = (force?: boolean, specificRange?: number) => {
    const newState = getState();

    const shouldSearch = !(newState.venueType === undefined) || force;

    if (shouldSearch) {
      dispatch({ type: SEARCH_PLACES_REQUEST });
      searchPlaces(newState, specificRange)
        .then((response) => {
          if ((response as CampusesToCollaborateResponse)
            ?.campusesToCollaborateList
            ?.length === 0
          ) {
            const currentRange = specificRange || state.campusSearchRangeInMiles;
            if (currentRange < 4000) {
              const nextRange = getCampusSearchNextRange(currentRange);
              setCampusSearchRange(nextRange);
              searchPlacesToCollaborate(true, nextRange);
            } else {
              const payload = (response as CampusesToCollaborateResponse).campusesToCollaborateList
                || (response as VenuesToCollaborateResponse).venuesToCollaborateList;
              dispatch({ type: SEARCH_PLACES_RESPONSE, payload });
            }
          } else {
            const payload = (response as CampusesToCollaborateResponse).campusesToCollaborateList
              || (response as VenuesToCollaborateResponse).venuesToCollaborateList;
            dispatch({ type: SEARCH_PLACES_RESPONSE, payload });
          }
        })
        .catch(() => dispatch({ type: SEARCH_PLACES_ERROR }))
        .finally(() => setPlacesLoading(false));
    }
  };

  const loadMorePlacesToCollaborate = () => {
    const newState = getState();
    dispatch({ type: SEARCH_PLACES_LOAD_MORE_REQUEST });
    searchPlaces(newState)
      .then((response) => {
        const payload = (response as CampusesToCollaborateResponse).campusesToCollaborateList
            || (response as VenuesToCollaborateResponse).venuesToCollaborateList;
        dispatch({ type: SEARCH_PLACES_LOAD_MORE_RESPONSE, payload });
      })
      .catch(() => dispatch({ type: SEARCH_PLACES_ERROR }));
  };

  const setMeetUsers = (meetUsers: string[]) => {
    dispatch({ type: SET_MEET_USERS, payload: meetUsers });
  };

  const setLoginUser = (loginUser: string) => {
    dispatch({ type: SET_LOGIN_USER, payload: loginUser });
  };

  const setMapPlaces = (mapPlaces: (CampusToCollaborate|VenueToCollaborate)[]) => {
    dispatch({ type: SET_MAP_PLACES, payload: mapPlaces });
  };

  const clearPlaceSearch = () => {
    dispatch({ type: CLEAR_PLACES_SEARCH });
  };

  const setStartTime = (startTime: Dayjs) => {
    dispatch({ type: SET_START_TIME, payload: startTime });
  };

  const setEndTime = (endTime: Dayjs) => {
    dispatch({ type: SET_END_TIME, payload: endTime });
  };

  const setVenueType = (venueType: CollaborationVenueType) => {
    dispatch({ type: SET_VENUE_TYPE, payload: venueType });
    dispatch({ type: SET_CAMPUS_SEARCH_RANGE, payload: 10 });
  };

  const setSelectedUsers = (selectedUsers: User[]) => {
    dispatch({ type: SET_SELECTED_USERS, payload: selectedUsers });
  };

  const setStartAndEndTime = (startTime: Dayjs, endTime: Dayjs) => {
    dispatch({ type: SET_START_AND_END_TIME, payload: { endTime, startTime } });
  };

  const setVenueSkip = (skip: number) => {
    dispatch({ type: SET_VENUE_SKIP, payload: skip });
  };

  useEffect(() => {
    // Reset pagination on a new search
    setVenueSkip(0);
    searchPlacesToCollaborate();
  }, [
    state.meetUsers,
    state.loginUser,
    state.startTime,
    state.endTime,
    state.venueType,
  ]);

  useEffect(() => {
    if (state.venueSkip !== 0) {
      loadMorePlacesToCollaborate();
    }
  }, [state.venueSkip]);

  return (
    <Context.Provider
      value={{
        state,
        setStartTime,
        setEndTime,
        setVenueType,
        setSelectedUsers,
        setMeetUsers,
        setLoginUser,
        searchPlacesToCollaborate,
        setMapPlaces,
        setPlacesLoading,
        clearPlaceSearch,
        setStartAndEndTime,
        setVenueSkip,
        setCampusSearchRange,
      }}
    >
      {children}
    </Context.Provider>
  );
};

const useSearchContextProvider = (): ISearchProviderModel => useContext(Context);

export { SearchContextProvider, useSearchContextProvider };
