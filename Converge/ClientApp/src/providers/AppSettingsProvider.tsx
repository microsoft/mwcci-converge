// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { createContext, useContext, useEffect } from "react";
import Settings from "../types/Settings";
import getAppSettings from "../api/settingsService";
import usePromise from "../hooks/usePromise";

interface SettingModel {
  appSettingsLoading: boolean;
  appSettings?: Settings | null;
  appSettingsError?: unknown;
}

const Context = createContext({} as SettingModel);

const AppSettingProvider: React.FC = ({ children }) => {
  const [
    appSettingsLoading,
    appSettings,
    appSettingsError,
    waitFor,
  ] = usePromise<Settings>(undefined, true);

  const getSettings = () => waitFor(getAppSettings());

  useEffect(() => {
    getSettings();
  }, []);

  return (
    <Context.Provider value={{
      appSettingsLoading,
      appSettings,
      appSettingsError,
    }}
    >
      {children}
    </Context.Provider>
  );
};

const useAppSettingsProvider = (): SettingModel => useContext(Context);
export { AppSettingProvider, useAppSettingsProvider };
