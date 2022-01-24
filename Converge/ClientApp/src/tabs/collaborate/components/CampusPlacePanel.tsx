// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useEffect, useMemo, useState } from "react";
import {
  Box, Image, Flex, Button, Divider, Text,
} from "@fluentui/react-northstar";
import {
  StarIcon,
} from "@fluentui/react-icons-northstar";
import { Icon } from "office-ui-fabric-react";
import { logEvent } from "../../../utilities/LogWrapper";
import CampusToCollaborate from "../../../types/CampusToCollaborate";
import PlaceAmmenities from "../../workspace/components/PlaceAmmenities";
import { setSettings } from "../../../api/meService";
import {
  ImportantActions, IMPORTANT_ACTION, UISections, UI_SECTION, USER_INTERACTION,
} from "../../../types/LoggerTypes";
import ImagePlaceholder from "../../../utilities/ImagePlaceholder";
import { useConvergeSettingsContextProvider } from "../../../providers/ConvergeSettingsProvider";
import CampusPlacePanelStyles from "../styles/CampusPlacePanelStyles";
import { getPlacePhotos, PlacePhotosResult } from "../../../api/buildingService";

interface Props {
  setOpen: (open: boolean) => void;
  dismissPanel: () => void;
  place: CampusToCollaborate;
}

const CampusPlacePanel: React.FC<Props> = (props) => {
  const {
    convergeSettings,
    setConvergeSettings,
  } = useConvergeSettingsContextProvider();
  const {
    setOpen,
    dismissPanel,
    place,
  } = props;
  const classes = CampusPlacePanelStyles();

  const [placePhotos, setPlacePhotos] = useState<PlacePhotosResult | undefined>(undefined);

  const images = useMemo<string[]>(() => {
    const img: string[] = [];
    const cover = placePhotos?.coverPhoto?.url;
    const floorPlan = placePhotos?.floorPlan?.url;
    if (cover) {
      img.push(cover);
    }
    if (floorPlan) {
      img.push(floorPlan);
    }
    return img;
  }, [placePhotos]);

  useEffect(() => {
    if (place.sharePointID) {
      getPlacePhotos(place.sharePointID)
        .then(setPlacePhotos);
    }
  }, [place.sharePointID]);

  return (
    <Box className={classes.root}>
      {
        !images.length
          ? <ImagePlaceholder width="100%" height="160px" />
          : (
            <Box className={classes.imgGrid}>
              {images.slice(0, 3)?.map((imgUrl, index) => (
                <>
                  {imgUrl && (
                  <Box
                    styles={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      overflow: "hidden",
                      objectFit: "cover",
                      gridArea: `index${index}`,
                    }}
                    className={`index${index}`}
                    key={imgUrl}
                  >
                    <Image
                      src={imgUrl}
                      styles={{
                        position: "absolute",
                        objectFit: "cover",
                        left: index === 0 ? 0 : "50%",
                        top: index === 2 ? "80px" : 0,
                        width: index === 0 ? "100%" : "50%",
                        maxHeight: index === 0 ? "160px" : "80px",
                      }}
                    />
                  </Box>
                  )}
                </>

              ))}
            </Box>
          )
      }

      <Box className={classes.iconContainer}>
        <Flex hAlign="end">
          <Button
            circular
            iconOnly
            onClick={() => {
              let favoriteCampusesToCollaborate = convergeSettings?.favoriteCampusesToCollaborate
                || [];
              const isFavorite = favoriteCampusesToCollaborate.includes(place.identity);
              if (isFavorite) {
                favoriteCampusesToCollaborate = favoriteCampusesToCollaborate
                  .filter((c) => c !== place.identity);
              } else {
                favoriteCampusesToCollaborate = favoriteCampusesToCollaborate
                  .concat([place.identity]);
              }
              const newSettings = {
                ...convergeSettings,
                favoriteCampusesToCollaborate,
              };
              setConvergeSettings(newSettings);
              setSettings(newSettings)
                .then(() => {
                  if (!isFavorite) {
                    logEvent(USER_INTERACTION, [
                      { name: IMPORTANT_ACTION, value: ImportantActions.AddVenueAsFavorite },
                    ]);
                  }
                });
              logEvent(USER_INTERACTION, [
                { name: UI_SECTION, value: UISections.PlaceDetails },
                { name: "description", value: "favorite_campus_place" },
              ]);
            }}
            icon={(
              <StarIcon
                size="medium"
                outline
                circular
                className={classes.icons}
                styles={{
                  "> svg": {
                    "> path.ui-icon__filled": {
                      display: convergeSettings?.favoriteCampusesToCollaborate?.includes(place.identity) ? "unset" : "none",
                    },
                  },
                }}
              />
          )}
          />
        </Flex>
      </Box>
      <Flex column className={classes.detailsContainer}>
        <Box className={classes.displayContainer}>
          <Text weight="bold" size="large" content={place.displayName} />
          <Flex className={classes.floor} gap="gap.smaller">
            <span>
              {place.building}
            </span>
            {place.floor && (
            <>
              <span>|</span>
              <span>
                Floor
                {" "}
                {place.floor}
              </span>
            </>
            )}
          </Flex>
          <Flex>
            <Button
              className={classes.actions}
              content="Create Event"
              onClick={() => {
                setOpen(true);
                dismissPanel();
                logEvent(USER_INTERACTION, [
                  { name: UI_SECTION, value: UISections.PlaceDetails },
                  { name: "description", value: "open_event_create_panel_campus" },
                ]);
              }}
              primary
            />
          </Flex>
        </Box>
        <Divider />
        <Box className={classes.contact}>
          <ul>
            <li>
              <Icon iconName="CityNext2" />
              At:
              {" "}
              {place.building}
            </li>
            <li>
              <Icon iconName="POI" />
              {place.street}
              {" "}
              {place.city}
              {" "}
              {place.state}
              {" "}
              {place.postalCode}
            </li>
            {place.phone && (
            <li>
              <Icon iconName="Phone" />
              <span className={classes.iconColor}>{place.phone}</span>
            </li>
            )}
          </ul>
        </Box>
        <Divider />
        {(place.tags?.filter((t) => t !== "isFlexibleSeating")?.length > 0
          || place.audioDeviceName
          || place.displayDeviceName
          || place.videoDeviceName
          || place.isWheelChairAccessible)
          && (
          <>
            <Text weight="bold" size="small" content="Ammenities and more" className={classes.ammenitiesTitle} />
            <PlaceAmmenities place={place} />
            <Divider />
          </>
          )}
      </Flex>
    </Box>
  );
};

export default CampusPlacePanel;
