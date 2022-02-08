// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { SyntheticEvent, useEffect, useState } from "react";
import {
  Box, Image, Flex, Button, Menu, MenuProps, ComponentSlotStyle, Text, Loader,
} from "@fluentui/react-northstar";
import * as microsoftTeams from "@microsoft/teams-js";
import {
  StarIcon,
} from "@fluentui/react-icons-northstar";
import { logEvent } from "../../../utilities/LogWrapper";
import VenueToCollaborate from "../../../types/VenueToCollaborate";
import YelpStars from "../../workspace/components/yelp/YelpStars";
import {
  USER_INTERACTION, UI_SECTION, UISections, DESCRIPTION, IMPORTANT_ACTION, ImportantActions,
} from "../../../types/LoggerTypes";
import VenueReviews from "./VenueReviews";
import VenueDetails from "../../../types/VenueDetails";
import VenueDetailsDisplay from "./VenueDetailsDisplay";
import { useConvergeSettingsContextProvider } from "../../../providers/ConvergeSettingsProvider";
import VenuePlacePanelStyles from "../styles/VenuePlacePanelStyles";
import { useApiProvider } from "../../../providers/ApiProvider";

interface Props {
  setOpen: (open: boolean) => void;
  dismissPanel: () => void;
  place: VenueToCollaborate;
}

enum VenueDetailsTabs {
  Details,
  Reviews,
}

const PlacePanel: React.FC<Props> = (props) => {
  const { searchService } = useApiProvider();
  const {
    convergeSettings,
    setConvergeSettings,
  } = useConvergeSettingsContextProvider();
  const {
    setOpen,
    dismissPanel,
    place,
  } = props;
  const classes = VenuePlacePanelStyles();
  const [activeTab, setActiveTab] = useState(VenueDetailsTabs.Details);
  const [venueDetails, setVenueDetails] = useState<VenueDetails | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    searchService.getVenueDetails(place.venueId)
      .then(
        (response) => setVenueDetails(
          response,
        ),
      ).finally(() => setLoading(false));
  }, [place.venueId]);

  const onActiveIndexChange = (
    e:SyntheticEvent<HTMLElement, Event>,
    menuProps?: MenuProps,
  ) => {
    let descriptionValue = "";
    switch (menuProps?.activeIndex) {
      case VenueDetailsTabs.Details:
        setActiveTab(VenueDetailsTabs.Details);
        descriptionValue = "details";
        break;
      case VenueDetailsTabs.Reviews:
        setActiveTab(VenueDetailsTabs.Reviews);
        descriptionValue = "reviews";
        break;
      default:
        break;
    }
    logEvent(USER_INTERACTION, [
      { name: UI_SECTION, value: UISections.PlaceDetails },
      { name: DESCRIPTION, value: `venue_details_change_${descriptionValue}` },
    ]);
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

  if (loading) {
    return <Loader />;
  }

  const goToYelpReviews = () => {
    microsoftTeams.executeDeepLink(
      `${place.urlReference}`,
    );
  };

  return (
    <Box className={classes.root}>
      <Box className={classes.imgGrid}>
        {venueDetails?.photos?.slice(0, 3)?.map((imgUrl, index) => (
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
      <Box className={classes.iconContainer}>
        <Flex hAlign="end">
          <Button
            circular
            iconOnly
            onClick={() => {
              let favoriteVenuesToCollaborate = convergeSettings?.favoriteVenuesToCollaborate
              || [];
              const isFavorite = favoriteVenuesToCollaborate.includes(place.venueId);
              if (isFavorite) {
                favoriteVenuesToCollaborate = favoriteVenuesToCollaborate
                  .filter((c) => c !== place.venueId);
              } else {
                favoriteVenuesToCollaborate = favoriteVenuesToCollaborate
                  .concat([place.venueId]);
              }
              const newSettings = {
                ...convergeSettings,
                favoriteVenuesToCollaborate,
              };
              setConvergeSettings(newSettings)
                .then(() => {
                  if (!isFavorite) {
                    logEvent(USER_INTERACTION, [{
                      name: IMPORTANT_ACTION, value: ImportantActions.AddVenueAsFavorite,
                    }]);
                  }
                });
              logEvent(USER_INTERACTION, [
                { name: UI_SECTION, value: UISections.PlaceDetails },
                { name: DESCRIPTION, value: "favorite_yelp_place" },
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
                      display: convergeSettings?.favoriteVenuesToCollaborate?.includes(place.venueId) ? "unset" : "none",
                    },
                  },
                }}
              />
            )}
          />
        </Flex>
      </Box>
      <Flex column gap="gap.smaller" className={classes.displayContainer}>
        <Text weight="bold" size="large" content={place.venueName} />
        <Flex className={classes.floor} gap="gap.smaller">
          {place.categories && (
            <span>
              {place.categories.map((c, i) => {
                let result = "";
                result += c;
                if (i !== (place.categories?.length || 0) - 1) {
                  result += ", ";
                }
                return result;
              })}
            </span>
          )}
          {place.price && (
            <>
              <span>|</span>
              <span>
                {place.price}
              </span>
            </>
          )}
          {place.city && (
            <>
              <span>|</span>
              <span>
                {place.city}
              </span>
            </>
          )}
        </Flex>
        <Flex gap="gap.medium" vAlign="center">
          {place.rating && (
            <span>
              <YelpStars rating={place.rating} />
            </span>
          )}
          <Button
            text
            content={`${place.reviewCount} Yelp reviews`}
            onClick={() => {
              goToYelpReviews();
              logEvent(USER_INTERACTION, [
                { name: UI_SECTION, value: UISections.YelpReviews },
                { name: DESCRIPTION, value: "go_to_yelp_reviews" },
              ]);
            }}
            styles={{
              "& > span": {
                lineHeight: "35px",
              },
            }}
          />
        </Flex>
        <Flex>
          <Button
            className={classes.actions}
            content="Create Event"
            primary
            onClick={() => {
              setOpen(true);
              dismissPanel();
              logEvent(USER_INTERACTION, [
                { name: UI_SECTION, value: UISections.PlaceDetails },
                { name: DESCRIPTION, value: "open_event_create_panel_venue" },
              ]);
            }}
          />
          <Button
            className={classes.actions}
            content="Website"
            onClick={() => {
              goToYelpReviews();
              logEvent(USER_INTERACTION, [
                { name: UI_SECTION, value: UISections.PlaceDetails },
                { name: DESCRIPTION, value: "goToYelpReviews" },
              ]);
            }}
          />
        </Flex>
      </Flex>
      <Menu
        className={classes.menu}
        defaultActiveIndex={0}
        items={[
          {
            key: VenueDetailsTabs.Details,
            content: "Details",
            styles: {
              ...menuItemStyles,
              color: activeTab === VenueDetailsTabs.Details ? "#242424" : "#717070",
              fontWeight: activeTab === VenueDetailsTabs.Details ? "bold" : "normal",
            },
          },
          {
            key: VenueDetailsTabs.Reviews,
            content: "Reviews",
            styles: {
              ...menuItemStyles,
              color: activeTab === VenueDetailsTabs.Reviews ? "#242424" : "#717070",
              fontWeight: activeTab === VenueDetailsTabs.Reviews ? "bold" : "normal",
            },
          },
        ]}
        underlined
        primary
        onActiveIndexChange={onActiveIndexChange}
      />
      {activeTab === VenueDetailsTabs.Details && (
        <>
          {venueDetails ? (
            <VenueDetailsDisplay
              place={place}
              details={venueDetails}
            />
          ) : (<Loader />)}
        </>
      )}
      {activeTab === VenueDetailsTabs.Reviews && (
        <VenueReviews place={place} />
      )}
    </Box>
  );
};

export default PlacePanel;
