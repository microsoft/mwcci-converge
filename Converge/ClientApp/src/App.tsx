// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from "react";
import { initializeIcons } from "@uifabric/icons";
import { BrowserRouter as Router, Route } from "react-router-dom";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import customParseFormat from "dayjs/plugin/customParseFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import TeamsThemeProvider from "./providers/TeamsThemeProvider";
import Home from "./tabs/home";
import Collaborate from "./tabs/collaborate";
import Workspace from "./tabs/workspace";
import ConvergeSettingsProvider from "./providers/ConvergeSettingsProvider";
import "./app.css";
import { SearchContextProvider } from "./providers/SearchProvider";
import { AppSettingProvider } from "./providers/AppSettingsProvider";
import { TeamsContextProvider } from "./providers/TeamsContextProvider";
import ContextLoader from "./ContextLoader";
import AppBanner from "./utilities/AppBanner";

initializeIcons();
dayjs.extend(duration);
dayjs.extend(utc);
dayjs.extend(customParseFormat);
dayjs.extend(relativeTime);
dayjs.extend(timezone);

const App: React.FC = () => (
  <div style={{ background: "#f5f5f5" }}>
    <AppSettingProvider>
      <TeamsContextProvider>
        <TeamsThemeProvider>
          <ContextLoader>
            <ConvergeSettingsProvider>
              <AppBanner />
              <Router>
                <Route
                  exact
                  path="/tab"
                  component={Home}
                />
                <Route
                  exact
                  path="/collaborate"
                  render={() => (
                    <SearchContextProvider>
                      <Collaborate />
                    </SearchContextProvider>
                  )}
                />
                <Route exact path="/workspace" component={Workspace} />
              </Router>
            </ConvergeSettingsProvider>
          </ContextLoader>
        </TeamsThemeProvider>
      </TeamsContextProvider>
    </AppSettingProvider>
  </div>
);

export default App;
