// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from "react";
import { useAppSettingsProvider } from "./providers/AppSettingsProvider";
import { useTeamsContext } from "./providers/TeamsContextProvider";
import Await from "./utilities/Await";

const ContextLoader: React.FC = ({ children }) => {
  const { appSettingsLoading } = useAppSettingsProvider();
  const { teamsContextLoading } = useTeamsContext();
  return (
    <Await loading={appSettingsLoading || teamsContextLoading}>
      {children}
    </Await>
  );
};

export default ContextLoader;
