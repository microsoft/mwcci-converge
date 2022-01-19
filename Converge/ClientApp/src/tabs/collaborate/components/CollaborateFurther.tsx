// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useEffect, useState } from "react";
import {
  Box, Button, Text,
} from "@fluentui/react-northstar";
import {
  CloseIcon, ErrorIcon,
} from "@fluentui/react-icons-northstar";
import { useBoolean } from "@fluentui/react-hooks";
import {
  DESCRIPTION, UISections, UI_SECTION, USER_INTERACTION,
} from "../../../types/LoggerTypes";
import { getCollaborationVenueTypeString } from "../../../types/ExchangePlace";

import CampusToCollaborate from "../../../types/CampusToCollaborate";
import VenueToCollaborate from "../../../types/VenueToCollaborate";
import IsThisHelpful from "../../../utilities/IsThisHelpful";
import EmptyCollaborate from "./EmptyCollaborate";
import CollaborationPlaceDetails from "./CollaborationPlaceDetails";
import CollaborationPlaceResultsPaged from "./CollaborationPlaceResultsPaged";
import { useSearchContextProvider } from "../../../providers/SearchProvider";
import CollaborateFurtherStyles from "../styles/CollaborateFurtherStyles";
import CollaborationPlaceShimmer from "./CollaborationPlaceShimmer";
import { logEvent } from "../../../utilities/LogWrapper";

const CollaborateFurther: React.FC = () => {
  const {
    state,
    setMapPlaces,
    setPlacesLoading,
    clearPlaceSearch,
  } = useSearchContextProvider();
  const classes = CollaborateFurtherStyles();
  const [open, setOpen] = useState<boolean>(false);
  const [selectedPlace, setSelectedPlace] = useState<
    CampusToCollaborate | VenueToCollaborate | undefined
  >(undefined);
  const [isOpen, { setTrue: openPanel, setFalse: dismissPanel }] = useBoolean(false);

  useEffect(() => {
    if (state.placesLoading) {
      dismissPanel();
    }
  }, [state.placesLoading]);

  const refreshPageFoodAndDrink = async () => {
    window.location.reload();
  };

  const places: (CampusToCollaborate | VenueToCollaborate)[] = state.placesToCollaborate;
  return (
    <Box className={classes.root}>
      {!state.placesLoading && state.placesToCollaborate.length === 0
      && state.searchPlacesError !== undefined ? (
        <Box>
          <Box className={classes.title}>
            <Text
              as="span"
              weight="bold"
              size="large"
              color="#242424"
            >
              {state.venueType ? getCollaborationVenueTypeString(state.venueType) : "Workspace"}
            </Text>
            <Button
              icon={<CloseIcon size="large" color="#000" />}
              text
              iconOnly
              title="Clear search"
              onClick={() => {
                clearPlaceSearch();
                logEvent(USER_INTERACTION, [
                  { name: "ButtonClick", value: UISections.CollaborateFurther },
                  { name: "description", value: "clearPlaceSearch" },
                ]);
              }}
            />
          </Box>
          <Box className={classes.sortContainer}>
            <Text as="span" className={classes.results} color="#000">
              {state.placesToCollaborate.length}
              {" "}
              results
            </Text>
          </Box>
          <Box styles={{ paddingTop: "5rem" }}>
            <ErrorIcon styles={{ paddingLeft: "5rem" }} />
            <Text content="Something went wrong." error styles={{ paddingLeft: "0.5rem" }} />
            {" "}
            <Button
              content="Try again"
              text
              onClick={() => {
                refreshPageFoodAndDrink();
                logEvent(USER_INTERACTION, [
                  { name: "ButtonClick", value: UISections.CollaborateFurther },
                  { name: "description", value: "refreshPageFoodAndDrink" },
                ]);
              }}
              color="red"
              className={classes.tryAgainBtn}
            />
          </Box>
        </Box>
        ) : (
          <>
            {" "}
            {state.placesLoading && <CollaborationPlaceShimmer numRows={6} />}
            {!state.placesLoading
          && state.placesToCollaborate.length === 0 && (
          <>
            <EmptyCollaborate
              setMapPlaces={setMapPlaces}
              setPlacesLoading={setPlacesLoading}
              placesLoading={state.emptyStatePlacesLoading}
            />
          </>
            )}
          </>
        )}

      {!state.placesLoading
      && state.placesToCollaborate.length > 0 && (
        <>
          <Box className={classes.title}>
            <Text
              as="span"
              weight="bold"
              size="large"
              color="#242424"
            >
              {state.venueType ? getCollaborationVenueTypeString(state.venueType) : ""}
            </Text>
            <Button
              icon={<CloseIcon size="large" color="#000" />}
              text
              iconOnly
              title="Clear search"
              onClick={() => {
                clearPlaceSearch();
                logEvent(USER_INTERACTION, [
                  { name: UI_SECTION, value: UISections.CollaborateFurther },
                  { name: DESCRIPTION, value: "clearPlaceSearch" },
                ]);
              }}
            />

          </Box>
          <CollaborationPlaceResultsPaged
            places={places}
            openPanel={openPanel}
            setSelectedPlace={setSelectedPlace}
          />
          <IsThisHelpful logId="fde874ad" sectionName={UISections.CollaborationTab} />
          {selectedPlace && (
            <CollaborationPlaceDetails
              isOpen={isOpen}
              dismissPanel={dismissPanel}
              setOpen={setOpen}
              open={open}
              place={selectedPlace}
            />
          )}
        </>
      )}
    </Box>
  );
};

export default CollaborateFurther;
