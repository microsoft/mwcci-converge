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
import { logEvent } from "../../utilities/LogWrapper";
import { useConvergeSettingsContextProvider } from "../../providers/ConvergeSettingsProvider";
import { ImportantActions, IMPORTANT_ACTION, USER_INTERACTION } from "../../types/LoggerTypes";

const Home: React.FC = () => {
  const {
    convergeSettings,
    setupNewUser,
  } = useConvergeSettingsContextProvider();

  const handleZipCodeSubmission = (zipCode: string): Promise<void> => setupNewUser({
    ...convergeSettings,
    isConvergeUser: true,
    zipCode,
  })
    .then(() => {
      if (zipCode && zipCode !== "") {
        logEvent(USER_INTERACTION, [
          { name: IMPORTANT_ACTION, value: ImportantActions.AddZipCode },
        ]);
      }
    });

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
        <Welcome onZipCodeSubmission={handleZipCodeSubmission} />
      )}
    </>
  );
};

export default Home;
