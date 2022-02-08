// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  ErrorIcon, Flex, Loader, Text,
} from "@fluentui/react-northstar";
import { useBoolean } from "@fluentui/react-hooks";
import dayjs from "dayjs";
import CampusToCollaborate from "../../../types/CampusToCollaborate";
import VenueToCollaborate from "../../../types/VenueToCollaborate";
import CollaborationPlaceResults from "./CollaborationPlaceResults";
import CollaborationPlaceDetails from "./CollaborationPlaceDetails";
import VenueDetails from "../../../types/VenueDetails";
import { useConvergeSettingsContextProvider } from "../../../providers/ConvergeSettingsProvider";
import FavoritesToCollaborateStyles from "../styles/FavoritesToCollaborateStyles";
import {
  DESCRIPTION, UISections, UI_SECTION, USER_INTERACTION,
} from "../../../types/LoggerTypes";
import { logEvent } from "../../../utilities/LogWrapper";
import { useApiProvider } from "../../../providers/ApiProvider";

interface Props {
  setMapPlaces: (places: (CampusToCollaborate | VenueToCollaborate)[]) => void;
  placesLoading: boolean;
  setPlacesLoading: (placesLoading: boolean) => void;
}

function createVenueToCollaborate(v: VenueDetails): VenueToCollaborate {
  return {
    city: v.location?.city,
    countryOrRegion: v.location?.countryOrRegion,
    postalCode: v.location?.zipCode,
    state: v.location?.state,
    street: v.location?.address1,
    venueId: v.venueId,
    venueName: v.venueName,
    latitude: v.latitude,
    longitude: v.longitude,
    phoneNumber: v.phoneNumber,
    urlReference: v.urlReference,
    imageUrl: v.imageUrl,
    rating: v.rating,
    reviewCount: v.reviewCount,
    price: v.price,
    categories: v.categories,
    transactions: v.transactions,
  };
}

const FavoritesToCollaborate: React.FC<Props> = (props) => {
  const {
    searchService,
    buildingService,
  } = useApiProvider();
  const classes = FavoritesToCollaborateStyles();
  const [open, setOpen] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [selectedPlace, setSelectedPlace] = useState<
    CampusToCollaborate | VenueToCollaborate | undefined
  >(undefined);
  const {
    convergeSettings,
  } = useConvergeSettingsContextProvider();
  const [isOpen, { setTrue: openPanel, setFalse: dismissPanel }] = useBoolean(false);

  const [venues, setVenues] = useState<(CampusToCollaborate | VenueToCollaborate)[]>([]);
  const {
    setMapPlaces,
    placesLoading,
    setPlacesLoading,
  } = props;

  const getFavorites = async () => {
    setPlacesLoading(true);
    const venuesToCollaborate: (CampusToCollaborate | VenueToCollaborate)[] = [];
    if (convergeSettings?.favoriteCampusesToCollaborate) {
      const placeDetails = await Promise.all(
        convergeSettings.favoriteCampusesToCollaborate
          .map((v) => buildingService.getPlaceDetails(v, { start: new Date(), end: dayjs().utc().add(30, "minute").toDate() })
            .catch(() => {
              setIsError(true);
              const isErrorPlace = 0 as unknown as CampusToCollaborate;
              return isErrorPlace;
            })),
      );
      venuesToCollaborate.push(...placeDetails.filter((details) => !!details));
    }
    if (convergeSettings?.favoriteVenuesToCollaborate) {
      const venueDetails = await Promise.all(
        convergeSettings.favoriteVenuesToCollaborate.map((v) => searchService.getVenueDetails(v)
          .catch(() => {
            setIsError(true);
            const isErrorVenue = 0 as unknown as VenueToCollaborate;
            return isErrorVenue;
          })),
      );
      const favoriteVenues = venueDetails.map((v) => createVenueToCollaborate(v));
      venuesToCollaborate.push(...favoriteVenues);
    }
    setVenues(venuesToCollaborate);
    setMapPlaces(venuesToCollaborate);
    setPlacesLoading(false);
  };

  useEffect(() => {
    getFavorites();
  }, [
    convergeSettings?.favoriteCampusesToCollaborate,
    convergeSettings?.favoriteVenuesToCollaborate,
  ]);

  const isEmpty = venues.length === 0;
  return (
    <>
      {isError
        && (
          <Box styles={{ paddingLeft: "4rem" }}>
            <Box styles={{ marginTop: "4rem" }}>
              <ErrorIcon className={classes.errIcon} />
              <Text
                content="Cannot load your favorite Places. "
                color="red"
                className={classes.errText}
              />
              <Button
                content="Try again"
                text
                onClick={() => {
                  getFavorites();
                  logEvent(USER_INTERACTION, [
                    { name: UI_SECTION, value: UISections.FavoritesToCollaborate },
                    { name: DESCRIPTION, value: "getFavorites" },
                  ]);
                }}
                color="red"
                className={classes.tryAgainBtn}
              />
            </Box>
          </Box>
        )}
      {!isError && placesLoading && <Loader />}
      {!isError && !placesLoading && isEmpty && (
        <Flex vAlign="center" hAlign="center" className={classes.emptyMessage}>
          <Text content="Add your favorite places to work/meet-up and see them here" />
        </Flex>
      )}
      {!placesLoading && !isError && !isEmpty && (
        <div className={classes.recommendations}>
          <CollaborationPlaceResults
            places={venues}
            openPanel={openPanel}
            setSelectedPlace={setSelectedPlace}
          />
          {selectedPlace && (
            <CollaborationPlaceDetails
              isOpen={isOpen}
              dismissPanel={dismissPanel}
              setOpen={setOpen}
              open={open}
              place={selectedPlace}
            />
          )}
        </div>
      )}
    </>
  );
};

export default FavoritesToCollaborate;
