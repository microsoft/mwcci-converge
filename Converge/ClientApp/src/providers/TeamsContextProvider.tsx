// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, {
  createContext, useContext, useEffect, useState,
} from "react";
import * as microsoftTeams from "@microsoft/teams-js";
import { logEvent, setup } from "../utilities/LogWrapper";
import { ImportantActions, IMPORTANT_ACTION, USER_INTERACTION } from "../types/LoggerTypes";
import usePromise from "../hooks/usePromise";
import { useAppSettingsProvider } from "./AppSettingsProvider";

interface TeamsContextState {
  userPrincipalName?: string;
  subEntityId?: string;
}

interface TeamsContextModel {
  teamsContextLoading: boolean;
  teamsContext?: TeamsContextState | null;
  teamsContextError?: unknown;
}

const Context = createContext<TeamsContextModel>({
  teamsContextLoading: true,
  teamsContext: null,
  teamsContextError: null,
});

const TeamsContextProvider: React.FC = ({ children }) => {
  const {
    appSettings,
  } = useAppSettingsProvider();

  const [initializing, setInitializing] = useState<boolean>(true);

  const [
    teamsContextLoading,
    teamsContext,
    teamsContextError,
    waitFor,
  ] = usePromise<TeamsContextState>(undefined, true);

  function initTeams() {
    return new Promise<void>((callback) => {
      microsoftTeams.initialize(callback);
    }).then(() => {
      setInitializing(false);
    });
  }

  function loadTeamsContext() {
    return new Promise<microsoftTeams.Context>((callback) => {
      microsoftTeams.getContext(callback);
    }).then((context) => ({
      userPrincipalName: context.userPrincipalName,
      subEntityId: context.subEntityId,
    }) as TeamsContextState);
  }

  async function getTeamsContext() {
    if (appSettings && !initializing) {
      await new Promise<void>((callback) => {
        microsoftTeams.getContext((context) => {
          setup(context, appSettings);
          logEvent(USER_INTERACTION, [
            { name: IMPORTANT_ACTION, value: ImportantActions.View },
          ]);
          callback();
        });
      });
    }
    waitFor(loadTeamsContext());
  }

  useEffect(() => {
    initTeams();
  }, []);

  useEffect(() => {
    getTeamsContext();
  }, [appSettings, initializing]);

  return (
    <Context.Provider value={{
      teamsContextLoading: teamsContextLoading && initializing,
      teamsContext,
      teamsContextError,
    }}
    >
      { children }
    </Context.Provider>
  );
};

const useTeamsContext = (): TeamsContextModel => useContext(Context);

export { TeamsContextProvider, useTeamsContext };
