// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference
/// path="../../../../node_modules/bingmaps/types/MicrosoftMaps/Microsoft.Maps.All.d.ts" />
import React, {
  useState, useEffect, useMemo,
} from "react";
import { Box, Loader } from "@fluentui/react-northstar";
import { useBoolean } from "@fluentui/react-hooks";
import { User } from "@microsoft/microsoft-graph-types";
import BingMaps from "../../../utilities/BingMaps";
import { loadBingApi, Microsoft } from "../../../utilities/BingMapLoader";
import { useSearchContextProvider } from "../../../providers/SearchProvider";
import CampusToCollaborate from "../../../types/CampusToCollaborate";
import VenueToCollaborate from "../../../types/VenueToCollaborate";
import CollaborationPlaceDetails from "./CollaborationPlaceDetails";
import { useMapProvider } from "../../../providers/MapProvider";
import { useAppSettingsProvider } from "../../../providers/AppSettingsProvider";
import MapStyles from "../styles/MapStyles";
import { useConvergeSettingsContextProvider } from "../../../providers/ConvergeSettingsProvider";
import UserCoordinates from "../../../types/UserCoordinates";
import { useTeamsContext } from "../../../providers/TeamsContextProvider";
import useAsyncRecord from "../../../hooks/useAsyncRecord";
import { ItemRecord } from "../../../hooks/useRecord";
import ErrorBoundary from "../../../utilities/ErrorBoundary";
import { createUserPushpin } from "../../../utilities/Pushpins";
import { useApiProvider } from "../../../providers/ApiProvider";

interface Props {
  userRecord: ItemRecord<User>,
  updateUserRecord: (imageKey: string, entry: User) => void,
  setUsersMissingCoordinates: (users: User[]) => void,
}

const Map: React.FC<Props> = ({
  userRecord,
  updateUserRecord,
  setUsersMissingCoordinates,
}) => {
  const {
    userService,
  } = useApiProvider();
  const {
    convergeSettings,
  } = useConvergeSettingsContextProvider();
  const { teamsContext } = useTeamsContext();
  const userCoordinateService = useMemo(userService.createUserCoordinateService, []);
  const {
    state,
  } = useSearchContextProvider();
  const {
    state: photoState,
    getUserPhoto,
    getUser,
  } = useMapProvider();

  const [photoRecord, updatePhotoRecord] = useAsyncRecord<string>(getUserPhoto);

  const classes = MapStyles();
  const [mapLoading, setMapLoading] = useState(true);
  const [, setPinsLoading] = useState(true);
  const [userCoords, setUserCoords] = useState<UserCoordinates | null>(null);
  const [selectedUserCoords, setSelectedUserCoords] = useState<UserCoordinates[]>([]);
  const [peoplePushpins, setPeoplePushpins] = useState<Microsoft.Maps.Pushpin[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [selectedPlace, setSelectedPlace] = useState<
    CampusToCollaborate | VenueToCollaborate | undefined
  >(undefined);
  const [isOpen, { setTrue: openPanel, setFalse: dismissPanel }] = useBoolean(false);
  const { appSettings } = useAppSettingsProvider();
  const [userCoordsFetchCompleted, setCoordsFetchCompleted] = useState<boolean>(false);

  useEffect(() => {
    if (appSettings?.bingAPIKey && appSettings?.bingAPIKey !== "") {
      loadBingApi(appSettings?.bingAPIKey).then(() => {
        setMapLoading(false);
      });
    }
  }, [appSettings?.bingAPIKey]);

  const updateUserCoords = async () => {
    if (!mapLoading && teamsContext?.userPrincipalName) {
      const day = state.startTime.utc();
      const [newCoordinates] = await userCoordinateService.forceUpdate(
        [teamsContext.userPrincipalName], {
          year: day.year(),
          month: day.month() + 1,
          day: day.date(),
        },
      );
      if (newCoordinates !== undefined) {
        setUserCoords({
          latitude: newCoordinates.latitude,
          longitude: newCoordinates.longitude,
          userPrincipalName: teamsContext.userPrincipalName,
        });
      }
      setCoordsFetchCompleted(true);
    }
  };

  useEffect(() => {
    updateUserCoords();
  }, [convergeSettings?.zipCode, mapLoading, teamsContext]);

  const updateSelectedUserCoords = async () => {
    if (!mapLoading && teamsContext) {
      const day = state.startTime.utc();
      const queryTime = {
        year: day.year(),
        month: day.month() + 1,
        day: day.date(),
      };
      const { selectedUsers } = state;
      const filteredUsernames = selectedUsers
        .filter((user) => user.userPrincipalName)
        .map((user) => user.userPrincipalName) as string[];

      const newCoords = await userCoordinateService.getItems(filteredUsernames,
        queryTime);
      setSelectedUserCoords(newCoords);
      setUsersMissingCoordinates(
        selectedUsers
          .filter((u) => newCoords.map((nc) => nc.userPrincipalName)
            .indexOf(u.userPrincipalName as string) === -1)
          || [],
      );
    }
  };

  const updateSelectedUserPhotos = async () => {
    if (!mapLoading && teamsContext) {
      state.selectedUsers.forEach((user) => {
        if (user.userPrincipalName && !photoRecord[user.userPrincipalName]) {
          updatePhotoRecord(user.userPrincipalName);
        }
      });
    }
  };

  const updateSelectedUserRecords = () => {
    if (!mapLoading && teamsContext) {
      state.selectedUsers.forEach((user) => {
        if (user.userPrincipalName && !photoRecord[user.userPrincipalName]) {
          updateUserRecord(user.userPrincipalName, user);
        }
      });
    }
  };

  const updateCurrentUserRecord = async () => {
    if (teamsContext?.userPrincipalName) {
      const currentUser = await getUser(teamsContext.userPrincipalName);
      updateUserRecord(teamsContext.userPrincipalName, currentUser);
    }
  };

  const updateCurrentUserPhotoRecord = async () => {
    if (teamsContext?.userPrincipalName && !photoRecord[teamsContext.userPrincipalName]) {
      updatePhotoRecord(teamsContext.userPrincipalName);
    }
  };

  useEffect(() => {
    updateCurrentUserPhotoRecord();
    updateCurrentUserRecord();
  }, [teamsContext]);

  useEffect(() => {
    updateSelectedUserRecords();
    updateSelectedUserPhotos();
    updateSelectedUserCoords();
  }, [state.selectedUsers, mapLoading, teamsContext, state.startTime]);

  const updatePushpins = async () => {
    if (!mapLoading && teamsContext && userCoords?.userPrincipalName) {
      setPinsLoading(true);
      const coordinates: UserCoordinates[] = userCoords ? [
        userCoords,
        ...selectedUserCoords,
      ] : selectedUserCoords;

      const pushPins = await Promise.all(coordinates.map(async (coord) => {
        const user = userRecord[coord.userPrincipalName];
        const photo = photoRecord[coord.userPrincipalName];
        const location = new Microsoft.Maps.Location(coord.latitude, coord.longitude);
        return createUserPushpin(
          location,
          photo?.item,
          user?.displayName ?? coord.userPrincipalName,
        );
      }));
      setPeoplePushpins(pushPins);
      setPinsLoading(false);
    }
  };

  useEffect(() => {
    updatePushpins();
  }, [
    mapLoading,
    teamsContext,
    state.startTime,
    userCoords,
    selectedUserCoords,
    photoRecord,
  ]);
  const finishedLoading = !mapLoading && teamsContext;
  const handlePushpinClick = (place: CampusToCollaborate|VenueToCollaborate) => {
    setSelectedPlace(place);
    openPanel();
  };

  useEffect(() => () => {
    Object.keys(photoState.photos).forEach((key) => {
      if (photoState.photos[key]) {
        URL.revokeObjectURL(photoState.photos[key] as string);
      }
    });
  }, []);

  return (
    <Box className={classes.root}>
      {finishedLoading && userCoordsFetchCompleted ? (
        <ErrorBoundary errorMessage="Oops! We can't load the map right now. Please try again later.">
          <BingMaps
            coordinates={userCoords}
            placesToCollaborate={state.mapPlaces}
            peoplePushpins={peoplePushpins}
            propsUpdated={mapLoading}
            eventCallback={handlePushpinClick}
            openPanel={isOpen}
          />
        </ErrorBoundary>

      ) : (<Loader />)}
      {selectedPlace && (
      <CollaborationPlaceDetails
        isOpen={isOpen}
        dismissPanel={dismissPanel}
        setOpen={setOpen}
        open={open}
        place={selectedPlace}
      />
      )}
    </Box>
  );
};
export default Map;
