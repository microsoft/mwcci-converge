// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { createContext, useContext, useReducer } from "react";
import * as MicrosoftGraph from "@microsoft/microsoft-graph-types";
import {
  getMyList, getPeople, getWorkgroup,
} from "../api/meService";
import { searchUsers, searchUsersByPage } from "../api/userService";
import TimeLimit from "../types/TimeLimit";
import { logEvent } from "../utilities/LogWrapper";
import {
  DESCRIPTION, OVERLAP_PERCENTAGE, USER_INTERACTION, ViralityMeasures, VIRALITY_MEASURE,
} from "../types/LoggerTypes";
import QueryOption from "../types/QueryOption";

export enum TeammateList {
  Suggested = "Suggested",
  MyOrganization = "My Organization",
  MyList = "My List",
  All = "All",
}

export interface Teammate {
  user: MicrosoftGraph.User,
  location?: string,
  availableTimes?: TimeLimit[],
}

const UPDATE_LOCATION = "UPDATE_LOCATION";
const TEAMMATES_REQUEST = "TEAMMATES_REQUEST";
const TEAMMATES_RESPONSE = "TEAMMATES_RESPONSE";
const TEAMMATES_ERROR = "TEAMMATES_ERROR";
const UPDATE_LIST = "UPDATE_LIST";
const UPDATE_DATE = "UPDATE_DATE";
const UPDATE_SEARCH_STRING = "UPDATE_SEARCH_STRING";
const UPDATE_SEARCH_QUERY_OPTIONS = "UPDATE_SEARCH_QUERY_OPTIONS";
const SET_TEAMMATE_LOCATION = "SET_TEAMMATE_LOCATION";
const SET_MORE_TEAMMATES_LOADING = "SET_TEAMMATE_LOADING";

interface UpdateTeammateLocationAction {
  type: typeof UPDATE_LOCATION,
  payload: string[],
}

interface UpdateDateAction {
  type: typeof UPDATE_DATE,
  payload: Date,
}

interface GetTeammatesRequestAction {
  type: typeof TEAMMATES_REQUEST,
}

interface GetTeammatesResponseAction {
  type: typeof TEAMMATES_RESPONSE,
  payload: Teammate[],
}

interface GetTeammatesErrorAction {
  type: typeof TEAMMATES_ERROR
}

interface UpdateListAction {
  type: typeof UPDATE_LIST,
  payload: TeammateList,
}

interface UpdateSearchString {
  type: typeof UPDATE_SEARCH_STRING,
  payload?: string,
}

interface UpdateSearchQueryOptions {
  type: typeof UPDATE_SEARCH_QUERY_OPTIONS,
  payload?: QueryOption[],
}

interface SetTeammateLocationAction {
  type: typeof SET_TEAMMATE_LOCATION,
  payload: { id: string, location: string }
}

interface SetMoreTeammateLoadingAction {
  type: typeof SET_MORE_TEAMMATES_LOADING,
  payload: boolean,
}

type ITeammateAction = UpdateTeammateLocationAction
 | GetTeammatesRequestAction
 | GetTeammatesResponseAction
 | GetTeammatesErrorAction
 | UpdateListAction
 | UpdateDateAction
 | UpdateSearchString
 | UpdateSearchQueryOptions
 | SetTeammateLocationAction
 | SetMoreTeammateLoadingAction;

type ITeammateState = {
  list: TeammateList;
  locations: string[];
  getFilteredTeammates: (teammates: Teammate[]) => Teammate[];
  teammates: Teammate[];
  teammatesError?: string;
  date: Date;
  searchString?: string;
  searchQueryOptions?: QueryOption[];
  teammatesLoading: boolean;
  moreTeammatesLoading: boolean;
};

type ITeammateFilterModel = {
  state: ITeammateState;
  updateLocations: (locations: string[]) => void;
  updateList: (list: TeammateList) => void;
  updateDate: (date: Date) => void;
  getTeammates: (list: TeammateList, date: Date, searchString?: string) => void;
  updateSearchString: (searchString?: string) => void;
  updateSearchQueryOptions:(searchQueryOptions?: QueryOption[]) => void;
  searchMoreTeammates:(
    searchString?: string,
    searchQueryOptions?: QueryOption[],
    presetTeammates?: Teammate[],
    ) => void;
  setTeammateLocation: (id: string, location: string) => void;
  setMoreTeammatesLoading: (buttonLoading: boolean) => void;
};

const initialState: ITeammateState = {
  teammates: [],
  locations: [],
  teammatesLoading: false,
  list: TeammateList.MyList,
  date: new Date(),
  getFilteredTeammates: (teammates: Teammate[]) => teammates,
  searchQueryOptions: [],
  moreTeammatesLoading: false,
};

const getFilterMethod = (state: ITeammateState) => {
  let locationFilter = (teammates: Teammate[]) => teammates;
  if (state.locations.length) {
    locationFilter = (teammates: Teammate[]) => teammates
      .filter((t) => t.location && state.locations?.includes(t.location));
  }
  let searchStringFilter = (teammates: Teammate[]) => teammates;
  if (state.searchString && state.list !== TeammateList.All) {
    searchStringFilter = (teammates: Teammate[]) => teammates
      .filter((t) => {
        if (!t.user.displayName) {
          return false;
        }
        const searchString = state.searchString?.toLowerCase() || "";
        return t.user.displayName.toLowerCase().indexOf(searchString) > -1;
      });
  }
  return (teammates: Teammate[]) => searchStringFilter(locationFilter(teammates));
};

const Context = createContext({} as ITeammateFilterModel);

const reducer = (state: ITeammateState, action: ITeammateAction): ITeammateState => {
  switch (action.type) {
    case UPDATE_LOCATION: {
      const newState = { ...state, locations: action.payload };
      return {
        ...newState,
        getFilteredTeammates: getFilterMethod(newState),
      };
    }
    case TEAMMATES_REQUEST: {
      const newState = { ...state, teammatesLoading: true };
      return {
        ...newState,
        getFilteredTeammates: getFilterMethod(newState),
      };
    }
    case TEAMMATES_RESPONSE: {
      const newState = { ...state, teammatesLoading: false, teammates: action.payload };
      return {
        ...newState,
        getFilteredTeammates: getFilterMethod(newState),
      };
    }
    case TEAMMATES_ERROR: {
      const newState = {
        ...state, teammatesLoading: false, teammates: [], teammatesError: "Something went wrong",
      };
      return {
        ...newState,
        getFilteredTeammates: getFilterMethod(newState),
      };
    }
    case UPDATE_LIST: {
      const newState = { ...state, list: action.payload };
      return {
        ...newState,
        getFilteredTeammates: getFilterMethod(newState),
      };
    }
    case UPDATE_DATE: {
      const newState = { ...state, date: action.payload };
      return {
        ...newState,
        getFilteredTeammates: getFilterMethod(newState),
      };
    }
    case UPDATE_SEARCH_STRING: {
      const newState = {
        ...state,
        searchString: action.payload,
        teammates: [],
        searchQueryOptions: [],
      };
      return {
        ...newState,
        getFilteredTeammates: getFilterMethod(newState),
      };
    }
    case UPDATE_SEARCH_QUERY_OPTIONS: {
      const newState = { ...state, searchQueryOptions: action.payload };
      return {
        ...newState,
        getFilteredTeammates: getFilterMethod(newState),
      };
    }
    case SET_MORE_TEAMMATES_LOADING: {
      const newState = {
        ...state,
        moreTeammatesLoading: action.payload,
      };
      return {
        ...newState,
        getFilteredTeammates: getFilterMethod(newState),
      };
    }
    case SET_TEAMMATE_LOCATION: {
      const newState = {
        ...state,
        teammates: state.teammates.map((t) => {
          const newTeammate = { ...t };
          if (t.user.id === action.payload.id) {
            newTeammate.location = action.payload.location;
          }
          return newTeammate;
        }),
      };
      if (newState.teammates.length && newState.teammates.every((t) => t.location)) {
        const convergeTeammates = newState.teammates.filter((teammate) => teammate.location !== "Unknown");
        logEvent(USER_INTERACTION, [
          { name: VIRALITY_MEASURE, value: ViralityMeasures.ConvergeUserOverlapPercentage },
          { name: DESCRIPTION, value: `${state.list}_converge_overlap` },
          {
            name: OVERLAP_PERCENTAGE,
            value: ((convergeTeammates.length / newState.teammates.length) * 100).toString(),
          },
        ]);
      }

      return newState;
    }
    default:
      return state;
  }
};

const TeammateFilterProvider: React.FC = ({ children }) => {
  const [state, dispatch] = useReducer(
    reducer,
    initialState,
  );

  const updateLocations = (location: string[]) => {
    dispatch({ type: UPDATE_LOCATION, payload: location });
  };

  const getTeammates = (list: TeammateList, date: Date, searchString?: string) => {
    dispatch({ type: TEAMMATES_REQUEST });
    let requestMethod;
    switch (list) {
      case TeammateList.Suggested:
        requestMethod = getPeople;
        break;
      case TeammateList.MyList:
        requestMethod = getMyList;
        break;
      case TeammateList.MyOrganization:
        requestMethod = getWorkgroup;
        break;
      case TeammateList.All:
        requestMethod = searchUsers;
        break;
      default:
        throw new Error("Invalid list type requested.");
    }
    requestMethod(searchString).then(async (teammates) => {
      const payload = await Promise.all(teammates.map(async (teammate) => ({
        user: teammate,
      })));
      dispatch({ type: TEAMMATES_RESPONSE, payload });
    })
      .catch(() => dispatch({ type: TEAMMATES_ERROR }));
  };

  const setMoreTeammatesLoading = (buttonLoading: boolean) => {
    dispatch({ type: SET_MORE_TEAMMATES_LOADING, payload: buttonLoading });
  };

  const searchMoreTeammates = (
    searchString?: string,
    qOptions?: QueryOption[],
    teammatesPreset?: Teammate[],
  ) => {
    setMoreTeammatesLoading(true);
    searchUsersByPage(searchString, qOptions).then(async (data) => {
      const payload = await Promise.all(data.users.map(async (teammate) => ({
        user: teammate,
      })));
      if (!teammatesPreset) dispatch({ type: TEAMMATES_RESPONSE, payload });
      else dispatch({ type: TEAMMATES_RESPONSE, payload: teammatesPreset.concat(payload) });
      dispatch({ type: UPDATE_SEARCH_QUERY_OPTIONS, payload: data.queryOptions });
      setMoreTeammatesLoading(false);
    })
      .catch(() => {
        dispatch({ type: TEAMMATES_ERROR });
        setMoreTeammatesLoading(false);
      });
  };

  const updateSearchString = (searchString?: string) => {
    dispatch({ type: UPDATE_SEARCH_STRING, payload: searchString });
    if (state.list === TeammateList.All) {
      const qOptions: QueryOption[] | undefined = undefined;
      const resetTeam: Teammate[] | undefined = undefined;
      searchMoreTeammates(searchString, qOptions, resetTeam);
    }
  };

  const updateList = (list: TeammateList) => {
    dispatch({ type: UPDATE_LIST, payload: list });
    if (list !== TeammateList.All) {
      getTeammates(list, state.date, state.searchString);
    } else {
      updateSearchString(state.searchString);
    }
  };

  const updateDate = (date: Date) => {
    dispatch({ type: UPDATE_DATE, payload: date });
    getTeammates(state.list, date, state.searchString);
  };

  const updateSearchQueryOptions = (queryOptions?: QueryOption[]) => {
    dispatch({ type: UPDATE_SEARCH_QUERY_OPTIONS, payload: queryOptions });
  };

  const setTeammateLocation = (id: string, location: string) => {
    dispatch({ type: SET_TEAMMATE_LOCATION, payload: { id, location } });
  };

  return (
    <Context.Provider value={{
      state,
      updateLocations,
      getTeammates,
      updateList,
      updateDate,
      updateSearchString,
      updateSearchQueryOptions,
      searchMoreTeammates,
      setTeammateLocation,
      setMoreTeammatesLoading,
    }}
    >
      {children}
    </Context.Provider>
  );
};

const useTeammateProvider = (): ITeammateFilterModel => useContext(Context);

export { TeammateFilterProvider, useTeammateProvider };
