// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useEffect } from "react";
import {
  Image, Text, Flex, FlexItem, StarIcon, Box,
} from "@fluentui/react-northstar";
import { Icon } from "office-ui-fabric-react";
import CampusToCollaborate from "../../../types/CampusToCollaborate";
import { getAmmenities } from "./PlaceAmmenities";
import ImagePlaceholder from "../../../utilities/ImagePlaceholder";
import {
  DESCRIPTION, UISections, UI_SECTION, USER_INTERACTION,
} from "../../../types/LoggerTypes";
import { useConvergeSettingsContextProvider } from "../../../providers/ConvergeSettingsProvider";
import CollaborationCampusPlaceCardStyles from "../styles/CollaborationCampusPlaceCardStyles";
import { usePlacePhotos } from "../../../providers/PlacePhotosProvider";
import { logEvent } from "../../../utilities/LogWrapper";

type Props = {
  placeToCollaborate: CampusToCollaborate,
  onPlaceClick: () => void,
};

const CollaborationCampusPlaceCard:React.FC<Props> = (props) => {
  const { placeToCollaborate, onPlaceClick } = props;
  const { convergeSettings } = useConvergeSettingsContextProvider();
  const classes = CollaborationCampusPlaceCardStyles();
  const ammenities = getAmmenities(placeToCollaborate);
  const [
    placePhotosLoading,
    placePhotos,
    placePhotosError,
    getPlacePhotos,
  ] = usePlacePhotos();
  const photoUrl = placePhotos?.[0].coverPhoto?.url;

  useEffect(() => {
    if (placeToCollaborate.sharePointID) {
      getPlacePhotos([placeToCollaborate.sharePointID]);
    }
  }, [placeToCollaborate.sharePointID]);

  return (
    <Flex
      onClick={() => {
        onPlaceClick();
        logEvent(USER_INTERACTION, [
          { name: UI_SECTION, value: UISections.CollaborationTab },
          { name: DESCRIPTION, value: "open_campus_place_details" },
        ]);
      }}
      className={classes.root}
      key={placeToCollaborate.displayName}
      gap="gap.medium"
    >
      {
        !photoUrl || placePhotosLoading || placePhotosError
          ? <ImagePlaceholder width="120px" height="120px" />
          : (
            <Box className={classes.imgWrapper}>
              <Image
                className={classes.imageContainer}
                src={photoUrl}
              />
            </Box>
          )
      }
      <Flex.Item grow>
        <Flex space="between" gap="gap.small" vAlign="start">
          <Flex column gap="gap.smaller" style={{ height: "100%" }}>
            <Flex space="between">
              <Text
                content={placeToCollaborate.displayName}
                className={classes.displayName}
                title={placeToCollaborate.displayName}
                weight="semibold"
                size="large"
              />
              {convergeSettings?.favoriteCampusesToCollaborate?.includes(
                placeToCollaborate.identity,
              ) && (
                <Flex className={classes.starIcon}>
                  <StarIcon size="small" />
                </Flex>
              )}
            </Flex>
            <Flex gap="gap.smaller" className={classes.details}>
              <span>
                {placeToCollaborate.building}
              </span>
              {placeToCollaborate.floor && (
              <>
                <span>|</span>
                <span>
                  Floor
                  {" "}
                  {placeToCollaborate.floor}
                </span>
              </>
              )}
              {placeToCollaborate.capacity && (
              <>
                <span>|</span>
                <Icon iconName="contact" />
                <span>
                  {placeToCollaborate.capacity}
                  {" "}
                  total
                </span>
              </>
              )}
            </Flex>
            <div className={classes.details}>
              {ammenities.length > 0 && (
              <>
                <span>
                  Includes:
                </span>
                {" "}
                {ammenities.map((a, i) => (
                  <span key={a}>
                    <span>{a}</span>
                    {i !== ammenities.length - 1 && (
                    <>
                      <span>,</span>
                      {" "}
                    </>
                    )}
                  </span>
                ))}
              </>
              )}
            </div>
            <FlexItem push>
              <div className={classes.availability}>
                <Icon iconName="contact" />
                {" "}
                {placeToCollaborate.availableSlots}
                {" "}
                seats available
              </div>
            </FlexItem>
          </Flex>
        </Flex>
      </Flex.Item>
    </Flex>
  );
};

export default CollaborationCampusPlaceCard;
