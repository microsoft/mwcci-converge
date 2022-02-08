// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from "react";
import {
  FormField, FormLabel,
} from "@fluentui/react-northstar";
import { makeStyles } from "@fluentui/react-theme-provider";
import { useProvider as PlaceProvider } from "../../../providers/PlaceFilterProvider";
import { logEvent } from "../../../utilities/LogWrapper";
import {
  UI_SECTION, UISections, USER_INTERACTION, DESCRIPTION,
} from "../../../types/LoggerTypes";
import PopupMenuWrapper from "../../../utilities/popupMenuWrapper";
import BuildingBasicInfo from "../../../types/BuildingBasicInfo";

const LocationFilterStyles = makeStyles(() => ({
  label: {
    fontSize: "12px",
    marginBottom: "8px !important",
  },
}));

interface Props {
  buildings: BuildingBasicInfo[];
}

const LocationFilter: React.FC<Props> = (props) => {
  const { state, updateLocation } = PlaceProvider();
  const { buildings } = props;
  const classes = LocationFilterStyles();

  const handleDropdownChange = (bldg: string | undefined) => {
    logEvent(USER_INTERACTION, [
      { name: UI_SECTION, value: UISections.WorkspaceHome },
      { name: DESCRIPTION, value: `selected_building_change_${bldg}` },
    ]);
    const selectedBuilding = buildings.find((b) => b.displayName === bldg);
    updateLocation(selectedBuilding?.identity);
  };

  return (
    <FormField>
      <FormLabel htmlFor="location" id="location" className={classes.label}>
        Location
      </FormLabel>
      <PopupMenuWrapper
        headerTitle="Recent buildings"
        handleDropdownChange={handleDropdownChange}
        buildingList={buildings.map((b) => b.displayName)}
        locationBuildingName=""
        width="320px"
        marginContent="2.6rem"
        value={buildings.find((b) => b.identity === state.location)?.displayName}
        placeholderTitle="Select a building"
        buttonTitle="Show more"
        otherOptionsList={[]}
        maxHeight="260px"

      />
    </FormField>
  );
};

export default LocationFilter;
