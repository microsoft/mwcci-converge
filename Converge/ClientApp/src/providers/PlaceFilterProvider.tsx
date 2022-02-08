// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import dayjs, { Dayjs } from "dayjs";
import React, {
  createContext, useContext, useEffect, useReducer,
} from "react";
import ExchangePlace, { PlaceType } from "../types/ExchangePlace";
import SortOptions from "../types/SortOptions";
import CalendarEvent from "../types/CalendarEvent";
import UpcomingReservationsResponse from "../types/UpcomingReservationsResponse";
import { useApiProvider } from "./ApiProvider";

const UPDATE_LOCATION = "UPDATE_LOCATION";
const UPDATE_START_DATE = "UPDATE_START_DATE";
const UPDATE_END_DATE = "UPDATE_END_DATE";
const UPDATE_PLACE_TYPE = "UPDATE_PLACE";
const UPDATE_PLACE_SORT = "UPDATE_PLACE_SORT";
const UPDATE_ATTRIBUTE_FILTER = "UPDATE_ATTRIBUTE_FILTER";
const UPDATE_UPCOMING_RESERVATIONS_LIST = "UPDATE_UPCOMING_RESERVATIONS_LIST";
const UPDATE_RESERVATIONS_LIST_LOADING = "UPDATE_RESERVATION_LIST_LOADING";
const UPDATE_RESERVATIONS_LIST_ERROR = "UPDATE_RESERVATION_LIST_ERROR";
const SET_UPCOMING_RESERVATION_START_DATE = "SET_UPCOMING_RESERVATION_START_DATE";
const SET_UPCOMING_RESERVATION_END_DATE = "SET_UPCOMING_RESERVATION_END_DATE";
const SET_UPCOMING_RESERVATION_SKIP = "SET_UPCOMING_RESERVATION_SKIP";
const CANCEL_RESERVATION = "CANCEL_RESERVATION";
const CREATE_RESERVATION = "CREATE_RESERVATION";
const LOAD_MORE_UPCOMING_RESERVATIONS = "LOAD_MORE_UPCOMING_RESERVATIONS";

export type PlaceAttributeKeys = "audioDeviceName" |
  "displayDeviceName" |
  "videoDeviceName" |
  "isWheelChairAccessible";

interface UpdateLocationAction {
  type: typeof UPDATE_LOCATION;
  payload: string | undefined;
}

interface UpdateStartDateAction {
  type: typeof UPDATE_START_DATE;
  payload: Dayjs;
}

interface UpdateEndDateAction {
  type: typeof UPDATE_END_DATE;
  payload: Dayjs;
}

interface UpdatePlaceTypeAction {
  type: typeof UPDATE_PLACE_TYPE;
  payload: PlaceType;
}

interface UpdatePlaceSortAction {
  type: typeof UPDATE_PLACE_SORT;
  payload: SortOptions;
}

interface UpdateAttributeFilterAction {
  type: typeof UPDATE_ATTRIBUTE_FILTER;
  payload: PlaceAttributeKeys[];
}

interface loadUpcomingReservationsAction {
  type: typeof UPDATE_UPCOMING_RESERVATIONS_LIST,
  payload: UpcomingReservationsResponse;
}

interface UpdateReservationsListLoadingAction {
  type: typeof UPDATE_RESERVATIONS_LIST_LOADING,
  payload: boolean;
}

interface UpdateReservationsListErrorAction {
  type: typeof UPDATE_RESERVATIONS_LIST_ERROR,
  payload: boolean;
}

interface SetUpcomingReservationsEndDateAction {
  type: typeof SET_UPCOMING_RESERVATION_END_DATE,
  payload: Dayjs,
}

interface SetUpcomingReservationsStartDateAction {
  type: typeof SET_UPCOMING_RESERVATION_START_DATE,
  payload: Dayjs,
}

interface SetUpcomingReservationSkipAction {
  type: typeof SET_UPCOMING_RESERVATION_SKIP,
  payload: number,
}

interface CancelReservationAction {
  type: typeof CANCEL_RESERVATION,
  payload: string,
}

interface CreateReservationAction {
  type: typeof CREATE_RESERVATION,
  payload: CalendarEvent,
}

interface LoadMoreReservationsAction {
  type: typeof LOAD_MORE_UPCOMING_RESERVATIONS,
  payload: UpcomingReservationsResponse,
}

type IPlaceAction =
  UpdateLocationAction |
  UpdateStartDateAction |
  UpdateEndDateAction |
  UpdatePlaceTypeAction |
  UpdatePlaceSortAction |
  UpdateAttributeFilterAction |
  loadUpcomingReservationsAction |
  UpdateReservationsListLoadingAction |
  UpdateReservationsListErrorAction |
  SetUpcomingReservationsEndDateAction |
  SetUpcomingReservationsStartDateAction |
  SetUpcomingReservationSkipAction |
  CancelReservationAction |
  CreateReservationAction |
  LoadMoreReservationsAction;

type IPlaceState = {
  location?: string;
  startDate: Dayjs;
  endDate: Dayjs;
  place: PlaceType;
  tagFilter: string[];
  attributeFilter: PlaceAttributeKeys[];
  getFilteredCustomPlaces: (places: ExchangePlace[]) => ExchangePlace[];
  sortBy: SortOptions;
  upcomingReservationsList: CalendarEvent[];
  reservationsListLoading: boolean;
  reservationsListError: boolean;
  upcomingReservationsStartDate: Dayjs,
  upcomingReservationsEndDate: Dayjs,
  upcomingReservationsSkip: number,
  loadMoreUpcomingReservations: boolean,
};

type IContextModel = {
  state: IPlaceState;
  updateStartDate: (date: Dayjs) => void;
  updateEndDate: (date: Dayjs) => void;
  updateLocation: (location?: string) => void;
  updatePlaceType: (place: PlaceType) => void;
  updateAttributeFilter: (attributes: PlaceAttributeKeys[]) => void;
  updatePlaceSortOptions: (placeSortOptions: SortOptions) => void;
  updateStartAndEndDate: (start: Dayjs, end: Dayjs) => void;
  setReservationsListLoading: (currentState: boolean) => void;
  setReservationsListError: (currentState: boolean) => void;
  setUpcomingReservationEndDate: (upcomingReservationEndDate: Dayjs) => void;
  setUpcomingReservationStartDate: (upcomingReservationStartDate: Dayjs) => void;
  setUpcomingReservationSkip: (upcomingReservationSkip: number) => void;
  cancelReservation: (id: string) => void;
  createReservation: (reservation: CalendarEvent) => void;
  loadUpcomingReservations: (start: Dayjs, end: Dayjs) => void;
};

const Context = createContext({} as IContextModel);

const getFilterMethodForAnyPlaceCollection = (state: IPlaceState) => {
  const duplicationFilter = (places: ExchangePlace[]) => places
    .filter((p, i, allplaces) => i === allplaces.findIndex((t) => (
      t.identity === p.identity
    )));

  const placeTypeFilter = (places: ExchangePlace[]) => places.filter((p) => p.type === state.place);

  let attributeFilter = (places: ExchangePlace[]) => places;
  if (state.attributeFilter.length > 0) {
    attributeFilter = (places: ExchangePlace[]) => places
      .filter((p) => state.attributeFilter.every((f) => !!p[f]));
  }
  const sortPlaces = (places: ExchangePlace[]) => places
    .sort((placeA, placeB) => {
      if (state.sortBy === SortOptions.Low) {
        if (placeA.capacity <= placeB.capacity) {
          return -1;
        }
        return 1;
      }
      if (state.sortBy === SortOptions.High) {
        if (placeA.capacity >= placeB.capacity) {
          return -1;
        }
        return 1;
      }
      return 0;
    });
  return (places: ExchangePlace[]) => attributeFilter(
    sortPlaces(placeTypeFilter(
      duplicationFilter(places),
    )),
  );
};

const reducer = (state: IPlaceState, action: IPlaceAction): IPlaceState => {
  switch (action.type) {
    case UPDATE_LOCATION: {
      const newState = { ...state, location: action.payload };
      return {
        ...newState,
        getFilteredCustomPlaces: getFilterMethodForAnyPlaceCollection(newState),
      };
    }

    case UPDATE_START_DATE: {
      const newState = { ...state, startDate: action.payload };
      return {
        ...newState,
        getFilteredCustomPlaces: getFilterMethodForAnyPlaceCollection(newState),
      };
    }

    case UPDATE_END_DATE: {
      const newState = { ...state, endDate: action.payload };
      return {
        ...newState,
        getFilteredCustomPlaces: getFilterMethodForAnyPlaceCollection(newState),
      };
    }

    case UPDATE_PLACE_TYPE: {
      const newState = { ...state, place: action.payload };
      return {
        ...newState,
        getFilteredCustomPlaces: getFilterMethodForAnyPlaceCollection(newState),
      };
    }

    case UPDATE_PLACE_SORT: {
      const newState = {
        ...state,
        sortBy: action.payload,
      };
      return {
        ...newState,
        getFilteredCustomPlaces: getFilterMethodForAnyPlaceCollection(newState),
      };
    }

    case UPDATE_ATTRIBUTE_FILTER: {
      const newState = {
        ...state,
        attributeFilter: action.payload,
      };
      return {
        ...newState,
        getFilteredCustomPlaces: getFilterMethodForAnyPlaceCollection(newState),
      };
    }

    case UPDATE_UPCOMING_RESERVATIONS_LIST: {
      const newState = {
        ...state,
        upcomingReservationsList: action.payload.reservations,
        loadMoreUpcomingReservations: action.payload.loadMore,
      };
      return {
        ...newState,
        getFilteredCustomPlaces: getFilterMethodForAnyPlaceCollection(newState),
      };
    }

    case UPDATE_RESERVATIONS_LIST_LOADING: {
      const newState = {
        ...state,
        reservationsListLoading: action.payload,
      };
      return {
        ...newState,
        getFilteredCustomPlaces: getFilterMethodForAnyPlaceCollection(newState),
      };
    }

    case UPDATE_RESERVATIONS_LIST_ERROR: {
      const newState = {
        ...state,
        reservationsListError: action.payload,
      };
      return {
        ...newState,
        getFilteredCustomPlaces: getFilterMethodForAnyPlaceCollection(newState),
      };
    }

    case SET_UPCOMING_RESERVATION_END_DATE: {
      const newState = {
        ...state,
        upcomingReservationsEndDate: action.payload,
      };
      return {
        ...newState,
      };
    }

    case SET_UPCOMING_RESERVATION_START_DATE: {
      const newState = {
        ...state,
        upcomingReservationsStartDate: action.payload,
      };
      return {
        ...newState,
      };
    }

    case SET_UPCOMING_RESERVATION_SKIP: {
      const newState = {
        ...state,
        upcomingReservationsSkip: action.payload,
      };
      return {
        ...newState,
      };
    }

    case CANCEL_RESERVATION: {
      return {
        ...state,
        upcomingReservationsList: state
          .upcomingReservationsList
          .filter((r) => r.id !== action.payload),
      };
    }

    case CREATE_RESERVATION: {
      const upcomingReservationsList: CalendarEvent[] = [];
      // Put it where it belongs chronologically
      let isInserted = false;
      state.upcomingReservationsList.forEach((reservation) => {
        if (
          !isInserted
          && dayjs(action.payload.start.dateTime)
            .isBefore(dayjs(reservation.start.dateTime))
        ) {
          upcomingReservationsList.push(action.payload);
          isInserted = true;
        }
        upcomingReservationsList.push(reservation);
      });
      return {
        ...state,
        upcomingReservationsList,
      };
    }

    case LOAD_MORE_UPCOMING_RESERVATIONS: {
      return {
        ...state,
        upcomingReservationsList: state
          .upcomingReservationsList
          .concat(action.payload.reservations),
        loadMoreUpcomingReservations: action.payload.loadMore,
      };
    }

    default:
      return state;
  }
};

export const getDefaultTime = (): Dayjs => {
  const now = dayjs();
  let hour = now.hour();
  let minute = now.minute();
  if (minute > 30) {
    hour += 1;
    minute = 0;
  } else {
    minute = 30;
  }
  const appointedTime = dayjs().startOf("day");
  const newDate = appointedTime.add(hour, "hour").add(minute, "minutes");
  const formattedAppointedTime = dayjs(newDate).format("MM-DD-YYYY h:mm A");
  return dayjs(formattedAppointedTime);
};

const iState: IPlaceState = {
  location: undefined,
  startDate: getDefaultTime(),
  endDate: getDefaultTime().add(30, "minutes"),
  place: PlaceType.Space,
  tagFilter: [],
  attributeFilter: [],
  getFilteredCustomPlaces: (places: ExchangePlace[]) => places,
  sortBy: SortOptions.High,
  upcomingReservationsList: [],
  reservationsListLoading: false,
  reservationsListError: false,
  upcomingReservationsStartDate: getDefaultTime(),
  upcomingReservationsEndDate: getDefaultTime().add(1, "week"),
  upcomingReservationsSkip: 0,
  loadMoreUpcomingReservations: true,
};

const PlaceContextProvider: React.FC = ({ children }) => {
  const { calendarService } = useApiProvider();
  const [state, dispatch] = useReducer(
    reducer,
    {
      ...iState,
      getFilteredCustomPlaces: getFilterMethodForAnyPlaceCollection(iState),
    },
  );

  const setReservationsListLoading = (isLoading: boolean) => {
    dispatch({
      type: UPDATE_RESERVATIONS_LIST_LOADING,
      payload: isLoading,
    });
  };

  const setReservationsListError = (isError: boolean) => {
    dispatch({
      type: UPDATE_RESERVATIONS_LIST_ERROR,
      payload: isError,
    });
  };

  const loadUpcomingReservations = (start: Dayjs, end: Dayjs) => {
    setReservationsListLoading(true);
    const resStartRange = dayjs.utc(start).toISOString();
    const resEndRange = dayjs.utc(end).toISOString();
    calendarService.getUpcomingReservations(resStartRange, resEndRange, 10, 0)
      .then((response) => {
        dispatch({
          type: UPDATE_UPCOMING_RESERVATIONS_LIST,
          payload: response,
        });
      })
      .finally(() => setReservationsListLoading(false))
      .catch(() => setReservationsListError(true));
  };

  const loadMoreUpcomingReservations = (skip: number) => {
    setReservationsListLoading(true);
    const resStartRange = dayjs.utc(state.upcomingReservationsStartDate).toISOString();
    const resEndRange = dayjs.utc(state.upcomingReservationsEndDate).toISOString();
    calendarService.getUpcomingReservations(resStartRange, resEndRange, 10, skip)
      .then((response) => {
        dispatch({
          type: LOAD_MORE_UPCOMING_RESERVATIONS,
          payload: response,
        });
      })
      .finally(() => setReservationsListLoading(false))
      .catch(() => setReservationsListError(true));
  };

  const updateStartDate = (date: Dayjs) => {
    dispatch({ type: UPDATE_START_DATE, payload: date });
  };

  const updateEndDate = (date: Dayjs) => {
    dispatch({ type: UPDATE_END_DATE, payload: date });
  };

  const updateStartAndEndDate = (start: Dayjs, end: Dayjs) => {
    dispatch({ type: UPDATE_END_DATE, payload: end });
    dispatch({ type: UPDATE_START_DATE, payload: start });
  };

  const updateLocation = (location?: string) => {
    dispatch({ type: UPDATE_LOCATION, payload: location });
  };

  const updatePlaceType = (place: PlaceType) => {
    dispatch({ type: UPDATE_PLACE_TYPE, payload: place });
  };

  const updatePlaceSort = (placeSort: SortOptions) => {
    dispatch({ type: UPDATE_PLACE_SORT, payload: placeSort });
  };

  const updateAttributeFilter = (attributeFilter: PlaceAttributeKeys[]) => {
    dispatch({ type: UPDATE_ATTRIBUTE_FILTER, payload: attributeFilter });
  };

  const setUpcomingReservationStartDate = (upcomingReservationStartDate: Dayjs) => {
    dispatch({ type: SET_UPCOMING_RESERVATION_START_DATE, payload: upcomingReservationStartDate });
  };

  const setUpcomingReservationEndDate = (upcomingReservationEndDate: Dayjs) => {
    dispatch({ type: SET_UPCOMING_RESERVATION_END_DATE, payload: upcomingReservationEndDate });
  };

  const setUpcomingReservationSkip = (skip: number) => {
    dispatch({ type: SET_UPCOMING_RESERVATION_SKIP, payload: skip });
  };

  const cancelReservation = (id: string) => {
    dispatch({ type: CANCEL_RESERVATION, payload: id });
  };

  const createReservation = (calendarEventRequest: CalendarEvent) => {
    dispatch({ type: CREATE_RESERVATION, payload: calendarEventRequest });
  };

  useEffect(() => {
    loadUpcomingReservations(
      state.upcomingReservationsStartDate,
      state.upcomingReservationsEndDate,
    );
    setUpcomingReservationSkip(0);
  }, [
    state.upcomingReservationsStartDate,
    state.upcomingReservationsEndDate,
  ]);

  useEffect(() => {
    if (state.upcomingReservationsSkip !== 0) {
      loadMoreUpcomingReservations(state.upcomingReservationsSkip);
    }
  }, [state.upcomingReservationsSkip]);

  return (
    <Context.Provider
      value={{
        state,
        updateLocation,
        updatePlaceType,
        updatePlaceSortOptions: updatePlaceSort,
        updateAttributeFilter,
        updateStartDate,
        updateEndDate,
        updateStartAndEndDate,
        setReservationsListLoading,
        setReservationsListError,
        setUpcomingReservationStartDate,
        setUpcomingReservationEndDate,
        setUpcomingReservationSkip,
        cancelReservation,
        createReservation,
        loadUpcomingReservations,
      }}
    >
      {children}
    </Context.Provider>
  );
};

const useProvider = (): IContextModel => useContext(Context);

export { PlaceContextProvider, useProvider };
