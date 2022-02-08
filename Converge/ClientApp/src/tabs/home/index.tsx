// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from "react";
import { Box } from "@fluentui/react-northstar";
import BookWorkspace from "./BookWorkspace";
import ConnectTeammates from "./ConnectTeammates";
import Welcome from "./Welcome";
import { TeammateFilterProvider } from "../../providers/TeammateFilterProvider";
import { PlaceContextProvider } from "../../providers/PlaceFilterProvider";
import NPSDialog from "./components/NPSDialog";
import UnknownZipcodeAlert from "./UnknownZipcodeAlert";
import { useConvergeSettingsContextProvider } from "../../providers/ConvergeSettingsProvider";

const Home: React.FC = () => {
  const {
    convergeSettings,
  } = useConvergeSettingsContextProvider();

  return (
    <>
      {convergeSettings?.isConvergeUser ? (
        <>
          {!convergeSettings?.zipCode && (
            <UnknownZipcodeAlert />
          )}
          <Box
            styles={{
              display: "grid",
              padding: "1em 1.5em",
              gridTemplateColumns: "1fr 1fr 1fr 362px",
              gridTemplateAreas:
                "'ConnectTeammates ConnectTeammates ConnectTeammates BookWorkspace'",
              "@media (max-width: 1366px)": {
                "grid-template-columns": "1fr",
                "grid-template-areas": `'ConnectTeammates'
       'BookWorkspace'`,
              },
              gridGap: "8px",
            }}
          >
            <TeammateFilterProvider>
              <ConnectTeammates
                key="ConnectTeammates"
              />
            </TeammateFilterProvider>
            <PlaceContextProvider>
              <BookWorkspace key="BookWorkspace" />
            </PlaceContextProvider>
            <NPSDialog />
          </Box>
        </>
      ) : (
        <Welcome />
      )}
    </>
  );
};

export default Home;
