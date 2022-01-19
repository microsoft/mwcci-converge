// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from "react";
import {
  Image, Text, Flex, Button, AcceptIcon, StarIcon, Box,
} from "@fluentui/react-northstar";
import VenueToCollaborate from "../../../types/VenueToCollaborate";
import YelpStars from "./yelp/YelpStars";
import ImagePlaceholder from "../../../utilities/ImagePlaceholder";
import TruncateText from "../../../utilities/TruncateText";
import {
  UI_SECTION, UISections, DESCRIPTION, USER_INTERACTION,
} from "../../../types/LoggerTypes";
import { useConvergeSettingsContextProvider } from "../../../providers/ConvergeSettingsProvider";
import CollaborationVenuePlaceCardStyles from "../styles/CollaborationVenuePlaceCardStyles";
import { logEvent } from "../../../utilities/LogWrapper";

type Props = {
  placeToCollaborate: VenueToCollaborate,
  onPlaceClick: () => void,
};

const CollaborationVenuePlaceCard:React.FC<Props> = (props) => {
  const { placeToCollaborate: place, onPlaceClick } = props;
  const { convergeSettings } = useConvergeSettingsContextProvider();
  const classes = CollaborationVenuePlaceCardStyles();

  return (
    <Flex
      onClick={() => {
        onPlaceClick();
        logEvent(USER_INTERACTION, [
          { name: UI_SECTION, value: UISections.PlaceDetails },
          { name: DESCRIPTION, value: "open_venue_place_details" },
        ]);
      }}
      className={classes.root}
      key={place.venueName}
      gap="gap.medium"
    >
      {
        !place?.imageUrl
          ? <ImagePlaceholder width="120px" height="120px" />
          : (
            <Box className={classes.imgWrapper}>
              <Image
                className={classes.imageContainer}
                src={place.imageUrl}
              />
            </Box>
          )
      }
      <Flex.Item>
        <Flex space="between" gap="gap.small" vAlign="start">
          <Flex column>
            <Flex>
              <Text
                content={place.venueName}
                className={classes.displayName}
                title={place.venueName}
                weight="semibold"
                size="large"
              />
              {convergeSettings?.favoriteVenuesToCollaborate?.includes(
                place.venueId,
              ) && (
                <Flex className={classes.starIcon}>
                  <StarIcon size="small" color="pink" />
                </Flex>
              )}
            </Flex>

            <Flex className={classes.building} gap="gap.smaller" vAlign="center">
              {(!!place.rating || place.rating === 0) && (
              <span>
                <YelpStars rating={place.rating} />
              </span>
              )}
              <Button
                text
                content={`${place.reviewCount} Yelp reviews`}
              />
            </Flex>
            <Flex className={classes.building} gap="gap.smaller">
              {place.categories && (
              <TruncateText width="45%" title={place.categories.join(", ")}>
                {place.categories.join(", ")}
              </TruncateText>
              )}
              {place.price && (
                <>
                  <span>|</span>
                  <span>{place.price}</span>
                </>
              )}
              {place.city && (
                <>
                  <span>|</span>
                  <span>{place.city}</span>
                </>
              )}
            </Flex>
            <Flex gap="gap.medium" className={`${classes.building} ${classes.transactionsRow}`}>
              {place.transactions?.slice(0, 2)?.map((t) => (
                <Flex gap="gap.smaller" key={t}>
                  <AcceptIcon className={classes.acceptIcon} />
                  <span>{`${t.slice(0, 1).toUpperCase()}${t.slice(1).replace("_", " ")}`}</span>
                </Flex>
              ))}
            </Flex>
          </Flex>
        </Flex>
      </Flex.Item>
    </Flex>
  );
};

export default CollaborationVenuePlaceCard;
