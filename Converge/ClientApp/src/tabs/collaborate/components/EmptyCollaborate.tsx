// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  ComponentSlotStyle,
  Menu,
  MenuProps,
} from "@fluentui/react-northstar";
import React, { SyntheticEvent, useState, useEffect } from "react";
import { logEvent } from "../../../utilities/LogWrapper";
import CampusToCollaborate from "../../../types/CampusToCollaborate";

import {
  USER_INTERACTION, UI_SECTION, UISections, DESCRIPTION,
} from "../../../types/LoggerTypes";
import VenueToCollaborate from "../../../types/VenueToCollaborate";
import FavoritesToCollaborate from "./FavoritesToCollaborate";
import RecommendedToCollaborate from "./RecommendedToCollaborate";
import DisplayBox from "../../home/DisplayBox";
import EnterZipcode from "../../../utilities/EnterZipCodeDialog";
import { useConvergeSettingsContextProvider } from "../../../providers/ConvergeSettingsProvider";
import EmptyCollaborateStyles from "../styles/EmptyCollaborateStyles";

enum EmptyStateTabs {
  Favorites,
  Recommended,
}

interface Props {
  setMapPlaces: (places: (CampusToCollaborate|VenueToCollaborate)[]) => void;
  placesLoading: boolean;
  setPlacesLoading: (placesLoading: boolean) => void;
}

type IWidget = {
  id: string;
  title: string;
}

const EmptyCollaborate: React.FC<Props> = (props) => {
  const {
    convergeSettings,
  } = useConvergeSettingsContextProvider();
  const {
    setMapPlaces,
    setPlacesLoading,
    placesLoading,
  } = props;
  const classes = EmptyCollaborateStyles();
  const [activeTab, setActiveTab] = useState(EmptyStateTabs.Favorites);
  const [open, setOpen] = React.useState<boolean>(false);
  const [widget, setWidget] = React.useState<IWidget[]>([]);

  const onActiveIndexChange = (
    e:SyntheticEvent<HTMLElement, Event>,
    menuProps?: MenuProps,
  ) => {
    switch (menuProps?.activeIndex) {
      case EmptyStateTabs.Favorites:
        setActiveTab(EmptyStateTabs.Favorites);
        logEvent(USER_INTERACTION, [
          { name: UI_SECTION, value: UISections.CollaborationTab },
          { name: DESCRIPTION, value: "menu_change_favorite_places" },
        ]);
        break;
      case EmptyStateTabs.Recommended:
        setActiveTab(EmptyStateTabs.Recommended);
        logEvent(USER_INTERACTION, [
          { name: UI_SECTION, value: UISections.CollaborationTab },
          { name: DESCRIPTION, value: "menu_change_recommended_places" },
        ]);
        break;
      default:
        break;
    }
  };

  const menuItemStyles: ComponentSlotStyle = {
    width: "150px",
    textAlign: "center",
    fontSize: "14px",
    borderBottomWidth: "2px",
    paddingBottom: "4px",
    ":hover": {
      borderBottomWidth: "2px",
      paddingBottom: "4px",
    },
  };

  useEffect(() => {
    const widgetActions = !convergeSettings?.zipCode
      ? [
        {
          id: "action_1",
          title: "Add a zipcode",
        },
      ]
      : [
        {
          id: "action_2",
          title: `Change my zipcode (${convergeSettings.zipCode})`,
        },
      ];
    setWidget(widgetActions);
  }, [convergeSettings?.zipCode]);

  const updateWidgetActions = (zip: string) => {
    const widgetActions = [
      {
        id: "action_2",
        title: `Change my zipcode (${zip})`,
      },
    ];
    setWidget(widgetActions);
  };

  const openEnterZipCodeDialog = () => {
    setOpen(true);
  };

  return (
    <>
      <DisplayBox
        headerContent="Connect with teammates"
        descriptionContent="Get things done by collaborating with your team in-person"
        gridArea="CollaborateFurther"
        overflowX="hidden"
        showCallOut
        widgetActions={widget}
        handleCalloutItemClick={openEnterZipCodeDialog}
        color="#F5F5F5"
        withOutBoxShadow
      >
        <Menu
          className={classes.menu}
          defaultActiveIndex={0}
          items={[
            {
              key: EmptyStateTabs.Favorites,
              content: "Favorites",
              styles: {
                ...menuItemStyles,
                color: activeTab === EmptyStateTabs.Favorites ? "#242424" : "#717070",
                fontWeight: activeTab === EmptyStateTabs.Favorites ? "bold" : "normal",
              },
            },
            {
              key: EmptyStateTabs.Recommended,
              content: "Recommended",
              styles: {
                ...menuItemStyles,
                color: activeTab === EmptyStateTabs.Recommended ? "#242424" : "#717070",
                fontWeight: activeTab === EmptyStateTabs.Recommended ? "bold" : "normal",
              },
            },
          ]}
          underlined
          primary
          onActiveIndexChange={onActiveIndexChange}
          styles={{ marginTop: "2em" }}
        />
        {activeTab === EmptyStateTabs.Favorites && (
        <FavoritesToCollaborate
          setMapPlaces={setMapPlaces}
          placesLoading={placesLoading}
          setPlacesLoading={setPlacesLoading}
        />
        )}
        {activeTab === EmptyStateTabs.Recommended && (
        <RecommendedToCollaborate
          setMapPlaces={setMapPlaces}
          placesLoading={placesLoading}
          setPlacesLoading={setPlacesLoading}
        />
        )}
      </DisplayBox>
      <EnterZipcode open={open} setOpen={setOpen} updateWidgetActions={updateWidgetActions} />
    </>
  );
};

export default EmptyCollaborate;
