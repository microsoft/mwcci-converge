// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useEffect, useState } from "react";
import { Grid, Loader } from "@fluentui/react-northstar";
import Reservations from "./Reservations";
import Places from "./Places";
import { PlaceContextProvider } from "../../providers/PlaceFilterProvider";
import { useConvergeSettingsContextProvider } from "../../providers/ConvergeSettingsProvider";

const Workspace: React.FC = () => {
  const {
    getFavoriteCampuses,
    favoriteCampuses,
    convergeSettings,
  } = useConvergeSettingsContextProvider();
  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  useEffect(() => {
    setLoading(true);
    getFavoriteCampuses()
      .catch(() => setIsError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    getFavoriteCampuses();
  }, [convergeSettings?.favoriteCampusesToCollaborate]);

  if (loading) {
    return <Loader />;
  }

  return (
    <PlaceContextProvider>
      <Grid
        styles={{
          padding: "1em 1.5em",
          gridTemplateColumns: "1fr 1fr 1fr 362px",
          gridTemplateAreas:
    "'Workspaces Workspaces Workspaces Reservations'",
          "@media (max-width: 1366px)": {
            width: "100%",
            gridTemplateColumns: "1fr",
            "grid-template-areas": `'Workspaces'
      'Reservations'`,
          },
          gridGap: "8px",
        }}
        content={[<Places key="workspaces" favoriteCampuses={favoriteCampuses} isError={isError} />,
          <Reservations key="reservations" />]}
      />
    </PlaceContextProvider>
  );
};

export default Workspace;
