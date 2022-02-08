// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { useBoolean } from "@fluentui/react-hooks";
import {
  Box,
  Button,
  ErrorIcon, Loader, Text,
} from "@fluentui/react-northstar";
import CampusToCollaborate from "../../../types/CampusToCollaborate";
import CollaborationPlaceDetails from "./CollaborationPlaceDetails";
import VenueToCollaborate from "../../../types/VenueToCollaborate";
import RecommendedToCollaborateStyles from "../styles/RecommendedToCollaborateStyles";
import { useTeamsContext } from "../../../providers/TeamsContextProvider";
import {
  DESCRIPTION, UISections, UI_SECTION, USER_INTERACTION,
} from "../../../types/LoggerTypes";
import { logEvent } from "../../../utilities/LogWrapper";
import { useApiProvider } from "../../../providers/ApiProvider";
import CollaborationPlaceResultsPaged from "./CollaborationPlaceResultsPaged";
import { getCampusSearchNextRange } from "../../../providers/SearchProvider";

interface Props {
  setMapPlaces: (places: (CampusToCollaborate | VenueToCollaborate)[]) => void;
  placesLoading: boolean;
  setPlacesLoading: (placesLoading: boolean) => void;
}

const RecommendedToCollaborate: React.FC<Props> = (props) => {
  const {
    setMapPlaces,
    placesLoading,
    setPlacesLoading,
  } = props;
  const { searchService } = useApiProvider();
  const { teamsContext } = useTeamsContext();
  const classes = RecommendedToCollaborateStyles();
  const [open, setOpen] = useState<boolean>(false);
  const [isError, setIsError] = React.useState(false);
  const [upn, setUserPrincipalName] = React.useState("");
  const [selectedPlace, setSelectedPlace] = useState<
    CampusToCollaborate | VenueToCollaborate | undefined
  >(undefined);
  const [isOpen, { setTrue: openPanel, setFalse: dismissPanel }] = useBoolean(false);
  const [placesToCollaborate, setPlacesToCollaborate] = useState<CampusToCollaborate[]>([]);
  const [recommendationsRadius, setRecommendationsRadius] = useState<number>(10);

  const getRecommendedPlaces = () => {
    setPlacesLoading(true);
    searchService.searchCampusesToCollaborate({
      teamMembers: teamsContext?.userPrincipalName ? [teamsContext.userPrincipalName] : [upn],
      startTime: dayjs().utc().add(5, "minutes").toDate(),
      endTime: dayjs().utc().add(35, "minutes").toDate(),
      capacitySortOrder: "Asc",
      placeType: "space",
      distanceFromSource: recommendationsRadius,
    })
      .then((data) => {
        if (!data?.campusesToCollaborateList?.length) {
          const newSearchRange = getCampusSearchNextRange(recommendationsRadius);
          if (newSearchRange !== recommendationsRadius) {
            setRecommendationsRadius(newSearchRange);
          } else {
            setPlacesToCollaborate(data.campusesToCollaborateList);
            setMapPlaces(data.campusesToCollaborateList);
          }
        } else {
          setPlacesToCollaborate(data.campusesToCollaborateList);
          setMapPlaces(data.campusesToCollaborateList);
        }
      }).catch(() => setIsError(true))
      .finally(() => setPlacesLoading(false));
  };

  useEffect(() => {
    if (teamsContext?.userPrincipalName) {
      setUserPrincipalName(teamsContext.userPrincipalName);
      getRecommendedPlaces();
    }
  }, [recommendationsRadius]);

  const moreRecommendationsSearch = () => {
    const newSearchRange = getCampusSearchNextRange(recommendationsRadius);
    if (newSearchRange !== recommendationsRadius) {
      setRecommendationsRadius(newSearchRange);
    }
  };

  const getRecommendations = () => {
    setIsError(false);
    setPlacesLoading(true);
    getRecommendedPlaces();
  };

  return (placesLoading ? <Loader /> : (
    <div className={classes.recommendations}>
      {!isError && placesToCollaborate.length === 0
      && <Text content="No results in the recommended Places. " className={!isError ? classes.noResult : classes.isError} />}
      {isError
        && (
          <Box className={classes.errBox}>
            <Box className={classes.errBoxCtr}>
              <ErrorIcon className={classes.errIcon} />
              <Text content="Cannot load your recommended Places. " color="red" className={isError ? classes.isError : classes.noResult} />
              <Button
                content="Try again"
                text
                onClick={() => {
                  getRecommendations();
                  logEvent(USER_INTERACTION, [
                    { name: UI_SECTION, value: UISections.RecommendedToCollaborate },
                    { name: DESCRIPTION, value: "getRecommendations" },
                  ]);
                }}
                color="red"
                className={classes.tryAgainBtn}
              />
            </Box>
          </Box>
        )}
      <CollaborationPlaceResultsPaged
        places={placesToCollaborate}
        openPanel={openPanel}
        setSelectedPlace={setSelectedPlace}
        forceVenueShowMore
        recommendationSearchRadius={recommendationsRadius}
        moreRecommendationsfetcher={moreRecommendationsSearch}
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
  ));
};

export default RecommendedToCollaborate;
