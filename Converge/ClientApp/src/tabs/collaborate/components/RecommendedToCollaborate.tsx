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
import CollaborationPlaceResults from "./CollaborationPlaceResults";
import VenueToCollaborate from "../../../types/VenueToCollaborate";
import RecommendedToCollaborateStyles from "../styles/RecommendedToCollaborateStyles";
import { useTeamsContext } from "../../../providers/TeamsContextProvider";
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
  useEffect(() => {
    if (teamsContext?.userPrincipalName) {
      setUserPrincipalName(teamsContext.userPrincipalName);
      setPlacesLoading(true);
      searchService.searchCampusesToCollaborate({
        teamMembers: [teamsContext.userPrincipalName],
        startTime: dayjs().utc().add(5, "minutes").toDate(),
        endTime: dayjs().utc().add(35, "minutes").toDate(),
        capacitySortOrder: "Asc",
        placeType: "space",
      })
        .then((data) => {
          setPlacesToCollaborate(data.campusesToCollaborateList);
          setMapPlaces(data.campusesToCollaborateList);
        }).catch(() => setIsError(true))
        .finally(() => setPlacesLoading(false));
    }
  }, []);

  const getRecommendations = () => {
    setIsError(false);
    setPlacesLoading(true);
    searchService.searchCampusesToCollaborate({
      teamMembers: [upn],
      startTime: dayjs().utc().add(5, "minutes").toDate(),
      endTime: dayjs().utc().add(35, "minutes").toDate(),
      capacitySortOrder: "Asc",
      placeType: "space",
    })
      .then((data) => {
        setPlacesToCollaborate(data.campusesToCollaborateList);
        setMapPlaces(data.campusesToCollaborateList);
      }).catch(() => setIsError(true))
      .finally(() => setPlacesLoading(false));
  };

  if (placesLoading) {
    return <Loader />;
  }
  return (
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
      <CollaborationPlaceResults
        places={placesToCollaborate}
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
  );
};

export default RecommendedToCollaborate;
