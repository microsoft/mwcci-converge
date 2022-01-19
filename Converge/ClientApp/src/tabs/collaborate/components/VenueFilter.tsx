// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from "react";
import {
  FormField, Box, DropdownProps,
} from "@fluentui/react-northstar";
import { logEvent } from "../../../utilities/LogWrapper";
import {
  USER_INTERACTION, UISections, UI_SECTION, DESCRIPTION,
} from "../../../types/LoggerTypes";
import PrimaryDropdown from "../../../utilities/PrimaryDropdown";
import { useSearchContextProvider } from "../../../providers/SearchProvider";
import { CollaborationVenueType, getCollaborationVenueTypeString } from "../../../types/ExchangePlace";
import VenueFilterStyles from "../styles/VenueFilterStyles";

const PARKS_AND_REC = "Parks & Recreation";
const FOOD_AND_DRINK = "Food & Drink";
const WORKSPACE = "Workspace";
const CONFERENCE_ROOM = "Conference Room";

const TeammatesFilter: React.FC = () => {
  const {
    state,
    setVenueType,
  } = useSearchContextProvider();

  const classes = VenueFilterStyles();
  const venues = [
    WORKSPACE,
    CONFERENCE_ROOM,
    PARKS_AND_REC,
    FOOD_AND_DRINK,
  ];

  const dropdownChangeHandler = (
    event: React.MouseEvent | React.KeyboardEvent | null,
    data: DropdownProps,
  ) => {
    if (data?.value) {
      switch (data.value) {
        case WORKSPACE:
          setVenueType(CollaborationVenueType.Workspace);
          break;
        case CONFERENCE_ROOM:
          setVenueType(CollaborationVenueType.ConferenceRoom);
          break;
        case PARKS_AND_REC:
          setVenueType(CollaborationVenueType.ParksAndRecreation);
          break;
        case FOOD_AND_DRINK:
          setVenueType(CollaborationVenueType.FoodAndDrink);
          break;
        default:
          setVenueType(CollaborationVenueType.Workspace);
      }
    }
    logEvent(USER_INTERACTION, [
      { name: UI_SECTION, value: UISections.CollaborationTab },
      { name: DESCRIPTION, value: `venue_type_change_${data?.value}` },
    ]);
  };

  return (
    <FormField>
      <Box className={classes.root}>
        <PrimaryDropdown
          inverted
          placeholder="Select venue"
          items={venues}
          handleDropdownChange={dropdownChangeHandler}
          width="150px"
          value={state.venueType ? getCollaborationVenueTypeString(state.venueType) : undefined}
        />
      </Box>
    </FormField>
  );
};

export default TeammatesFilter;
