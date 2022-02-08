// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React, {
  createContext, useContext, useState,
} from "react";
import AuthenticationService from "../api/AuthenticationService";
import BuildingService from "../api/buildingService";
import CalendarService from "../api/calendarService";
import MeService from "../api/meService";
import PlaceService from "../api/placeService";
import RouteService from "../api/routeService";
import SearchService from "../api/searchService";
import SettingsService from "../api/settingsService";
import UserService from "../api/userService";

interface ApiModel {
  buildingService: BuildingService;
  calendarService: CalendarService;
  meService: MeService;
  placeService: PlaceService;
  routeService: RouteService;
  searchService: SearchService;
  settingsService: SettingsService;
  userService: UserService;
}

const Context = createContext({} as ApiModel);

const ApiProvider: React.FC = (props) => {
  const { children } = props;
  const authenticationService = new AuthenticationService();
  const [buildingService] = useState<BuildingService>(new BuildingService(authenticationService));
  const [calendarService] = useState<CalendarService>(new CalendarService(authenticationService));
  const [meService] = useState<MeService>(new MeService(authenticationService));
  const [placeService] = useState<PlaceService>(new PlaceService(authenticationService));
  const [routeService] = useState<RouteService>(new RouteService(authenticationService));
  const [searchService] = useState<SearchService>(new SearchService(authenticationService));
  const [settingsService] = useState<SettingsService>(new SettingsService(authenticationService));
  const [userService] = useState<UserService>(new UserService(authenticationService));

  return (
    <Context.Provider
      value={{
        buildingService,
        calendarService,
        meService,
        placeService,
        routeService,
        searchService,
        settingsService,
        userService,
      }}
    >
      {children}
    </Context.Provider>
  );
};

const useApiProvider = (): ApiModel => useContext(Context);
export { ApiProvider, useApiProvider };
