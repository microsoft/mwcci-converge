// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { SyntheticEvent } from "react";
import {
  FormField, FormLabel, Menu, MenuProps,
} from "@fluentui/react-northstar";
import { PlaceType } from "../../../types/ExchangePlace";
import { useProvider as PlaceProvider } from "../../../providers/PlaceFilterProvider";
import { logEvent } from "../../../utilities/LogWrapper";
import { USER_INTERACTION, UISections, UI_SECTION } from "../../../types/LoggerTypes";

interface Props {
  getPlaceType: (placeType:PlaceType) => void
}
const PlaceTypeFilter: React.FC<Props> = (props) => {
  const { updatePlaceType, state } = PlaceProvider();

  const onActiveIndexChange = (
    e: SyntheticEvent<HTMLElement, Event>,
    menuProps?: MenuProps,
  ) => {
    let description = "";
    switch (menuProps?.activeIndex) {
      case PlaceType.Space:
        description = "space";
        updatePlaceType(PlaceType.Space);
        props.getPlaceType(PlaceType.Space);
        break;
      case PlaceType.Room:
        description = "room";
        updatePlaceType(PlaceType.Room);
        props.getPlaceType(PlaceType.Room);
        break;
      default:
        break;
    }
    logEvent(USER_INTERACTION, [
      { name: UI_SECTION, value: UISections.PlaceSearch },
      { name: description, value: `place_menu_change_${description}` },
    ]);
  };
  return (
    <FormField>
      <FormLabel htmlFor="location" id="location" styles={{ fontSize: "12px", margin: "0 0 8px 0" }}>
        Type
      </FormLabel>
      <Menu
        defaultActiveIndex={0}
        activeIndex={state.place}
        onActiveIndexChange={onActiveIndexChange}
        items={[
          {
            key: PlaceType.Space,
            content: "Workspace",
          },
          {
            key: PlaceType.Room,
            content: "Meeting room",
          },
        ]}
        styles={{
          "& .ui-menu__itemwrapper": {
            width: "116px",
            height: "32px",
          },
          "& .ui-menu__item": {
            padding: "10px 0",
            textAlign: "center",
          },
        }}
        primary
      />
    </FormField>
  );
};

export default PlaceTypeFilter;
