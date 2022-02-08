// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from "react";
import {
  Box, Button, Flex, Loader, Text,
} from "@fluentui/react-northstar";
import { logEvent } from "../../../utilities/LogWrapper";
import CollaborationCampusPlaceCard from "../../workspace/components/CollaborationCampusPlaceCard";
import CollaborationPlacesRepeatingBox from "../../workspace/components/CollaborationPlacesRepeatingBox";
import CampusToCollaborate from "../../../types/CampusToCollaborate";
import VenueToCollaborate from "../../../types/VenueToCollaborate";
import CollaborationVenuePlaceCard from "../../workspace/components/CollaborationVenuePlaceCards";
import {
  DESCRIPTION, UISections, UI_SECTION, USER_INTERACTION,
} from "../../../types/LoggerTypes";
import CollaborationPlaceResultsStyles from "../styles/CollaborationPlaceResultsStyles";
import { useSearchContextProvider } from "../../../providers/SearchProvider";
import { CollaborationVenueType } from "../../../types/ExchangePlace";

interface Props {
    places: (CampusToCollaborate | VenueToCollaborate)[];
    openPanel: () => void;
    setSelectedPlace: (selectedPlace: CampusToCollaborate | VenueToCollaborate) => void;
}

const CollaborationPlaceResults: React.FC<Props> = (props) => {
  const {
    places, openPanel, setSelectedPlace,
  } = props;
  const classes = CollaborationPlaceResultsStyles();
  const {
    state,
    setVenueSkip,
  } = useSearchContextProvider();

  const loadMoreResults = () => {
    setVenueSkip(state.venueSkip + 30);
  };

  return (
    <Box className={classes.root}>
      <div>
        <CollaborationPlacesRepeatingBox>
          {places
            .map((place) => (
              <div
                key={
                  (place as VenueToCollaborate).venueId
                  || (place as CampusToCollaborate).identity
                }
                className={classes.lightTheme}
              >
                {(place as VenueToCollaborate).venueName ? (
                  <CollaborationVenuePlaceCard
                    placeToCollaborate={place as VenueToCollaborate}
                    onPlaceClick={() => {
                      openPanel();
                      setSelectedPlace(place);
                      logEvent(USER_INTERACTION, [
                        { name: UI_SECTION, value: UISections.CollaborateResults },
                        { name: DESCRIPTION, value: "open_place_details" },
                      ]);
                    }}
                  />
                ) : (
                  <CollaborationCampusPlaceCard
                    placeToCollaborate={place as CampusToCollaborate}
                    onPlaceClick={() => {
                      openPanel();
                      setSelectedPlace(place);
                      logEvent(USER_INTERACTION, [
                        { name: UI_SECTION, value: UISections.CollaborateResults },
                        { name: DESCRIPTION, value: "open_place_details" },
                      ]);
                    }}
                  />
                )}
              </div>
            ))}
        </CollaborationPlacesRepeatingBox>
        {(
          state.venueType === CollaborationVenueType.FoodAndDrink
          || state.venueType === CollaborationVenueType.ParksAndRecreation
        ) && (
          <Flex hAlign="center" vAlign="center" style={{ marginTop: "8px" }}>
            {state.loadMorePlacesLoading
               && (<Loader />)}
            {state.venueSkip < 1000 && !state.loadMorePlacesLoading && (
              <Button
                content="Show more"
                onClick={() => {
                  loadMoreResults();
                  logEvent(USER_INTERACTION, [
                    { name: UI_SECTION, value: UISections.CollaborateResults },
                    { name: DESCRIPTION, value: "loadMoreResults" },
                  ]);
                }}
              />
            )}
            {state.venueSkip > 1000 && !state.loadMorePlacesLoading && (
            <Text
              className={classes.textNoMore}
            >
              No more results
            </Text>
            )}
          </Flex>
        )}

      </div>
    </Box>
  );
};

export default CollaborationPlaceResults;
