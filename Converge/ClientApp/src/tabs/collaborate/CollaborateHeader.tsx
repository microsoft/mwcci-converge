// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from "react";
import {
  Box, Button, Flex, Form,
} from "@fluentui/react-northstar";
import { Icon } from "office-ui-fabric-react";
import { User } from "@microsoft/microsoft-graph-types";
import TeammatesFilter from "./components/TeammatesFilter";
import CollabDateTimeFilter from "./components/CollabDateTimeFilter";
import VenueFilter from "./components/VenueFilter";
import MeetFilter from "./MeetFilter";
import { useSearchContextProvider } from "../../providers/SearchProvider";
import {
  DESCRIPTION, UISections, UI_SECTION, USER_INTERACTION,
} from "../../types/LoggerTypes";
import CollaborateHeaderStyles from "./styles/CollaborateHeaderStyles";
import { logEvent } from "../../utilities/LogWrapper";

interface Props {
  usersMissingCoordinates: User[];
}

const CollaborateHeader: React.FC<Props> = ({ usersMissingCoordinates }) => {
  const {
    searchPlacesToCollaborate,
    state,
  } = useSearchContextProvider();

  const classes = CollaborateHeaderStyles();

  return (
    <Box className={classes.root}>
      <Form>
        <Flex
          wrap
          gap="gap.small"
          styles={{
            padding: "0 1em 1.4em 0",
            maxWidth: "1560px",
            "@media (max-width: 1366px)": {
              "& > div": {
                margin: "1em",
              },
            },
          }}
        >
          <TeammatesFilter usersMissingCoordinates={usersMissingCoordinates} />
          <CollabDateTimeFilter />
          <VenueFilter />
          <MeetFilter />
          <Button
            iconOnly
            circular
            text
            icon={<Icon iconName="refresh" />}
            onClick={() => {
              searchPlacesToCollaborate(true);
              logEvent(USER_INTERACTION, [
                { name: UI_SECTION, value: UISections.CollaborationTab },
                { name: DESCRIPTION, value: "collaborate_search" },
              ]);
            }}
            style={{ padding: "0 20px" }}
            loading={state.placesLoading}
            disabled={state.venueType === undefined}
          />
        </Flex>
      </Form>
    </Box>
  );
};

export default CollaborateHeader;
