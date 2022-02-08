// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useEffect, useState } from "react";
import {
  Alert,
  Box, Button, Text, ErrorIcon, Flex, Form, Loader,
} from "@fluentui/react-northstar";
import dayjs from "dayjs";
import DisplayBox from "../home/DisplayBox";
import LocationFilter from "./components/LocationFilter";
import DateTimeFilter from "./components/DateTimeFilter";
import PlaceTypeFilter from "./components/PlaceTypeFilter";
import FeatureFilter from "./components/FeatureFilter";
import { useProvider as PlaceProvider } from "../../providers/PlaceFilterProvider";
import { deserializeSubEntityId } from "../../utilities/deepLink";
import {
  DESCRIPTION, UISections, UI_SECTION, USER_INTERACTION,
} from "../../types/LoggerTypes";
import PlacesStyles from "./styles/PlacesStyles";
import { useTeamsContext } from "../../providers/TeamsContextProvider";
import BuildingPlaces from "./components/BuildingPlaces";
import { useConvergeSettingsContextProvider } from "../../providers/ConvergeSettingsProvider";
import { logEvent } from "../../utilities/LogWrapper";
import CustomizedPlaceCollectionAccordian from "./components/CustomizedPlaceCollectionAccordian";
import ExchangePlace, { PlaceType } from "../../types/ExchangePlace";
import RepeatingBox from "./components/RepeatingBox";
import PlaceCard from "./components/PlaceCard";

interface Props {
  favoriteCampuses: ExchangePlace[];
  isError:boolean;
}

const Places: React.FC<Props> = (props) => {
  const {
    favoriteCampuses,
    isError,
  } = props;
  const { state, updateLocation, updateStartAndEndDate } = PlaceProvider();
  const {
    state: convergeState,
    convergeSettings,
    loadBuildingsByDistance,
    loadBuildingsByName,
  } = useConvergeSettingsContextProvider();
  const { buildingsList } = convergeState;
  const [err, setErr] = useState<boolean>(isError);
  const classes = PlacesStyles();
  const { teamsContext } = useTeamsContext();
  const [skipTokenString, setSkipTokenString] = useState<string>("");
  const convertDateToTimeRange = (inputDate: Date) => ({
    start: dayjs(`${dayjs(inputDate).format("MM-DD-YYYY")} ${state.startDate?.format("h:mm A")}`, "MM-DD-YYYY h:mm A"),
    end: dayjs(`${dayjs(inputDate).format("MM-DD-YYYY")} ${state.endDate?.format("h:mm A")}`, "MM-DD-YYYY h:mm A"),
  });

  useEffect(() => {
    if (teamsContext?.subEntityId) {
      const subEntityId = deserializeSubEntityId(teamsContext.subEntityId);
      Object.keys(subEntityId).forEach((key) => {
        if (key === "location") {
          updateLocation(subEntityId[key]);
        }
        if (key === "date") {
          const dateFromSubEntity = new Date(Number.parseInt(subEntityId[key], 10));
          const { start, end } = convertDateToTimeRange(dateFromSubEntity);
          updateStartAndEndDate(start, end);
        }
      });
    }
  }, []);

  useEffect(() => {
    if (convergeSettings?.geoCoordinates) {
      loadBuildingsByDistance(convergeSettings.geoCoordinates);
    } else {
      loadBuildingsByName();
    }
  }, []);

  const [placeType, setPlaceType] = React.useState<PlaceType>(PlaceType.Space);
  const getPlaceType = (place: PlaceType) => {
    setPlaceType(place);
  };
  const refreshPlace = () => {
    window.location.reload();
  };

  const onSkipToken = (skipToken:string) => {
    setSkipTokenString(skipToken);
  };

  return (
    <DisplayBox
      descriptionContent="Find somewhere to get things done"
      headerContent="Workspace"
      gridArea="Workspaces"
    >
      {err && (
        <>
          <Alert
            danger
            icon={<ErrorIcon />}
            onVisibleChange={() => setErr(false)}
            dismissible
            dismissAction={{ "aria-label": "close" }}
            content={(
              <Flex>
                <Text
                  content="Something went wrong with your search."
                  styles={{
                    minWidth: "0px !important",
                    paddingTop: "0.4rem",
                  }}
                />
                <Button
                  content={(
                    <Text
                      content="Try again"
                      styles={{
                        minWidth: "0px !important",
                        paddingTop: "0.4rem",
                      }}
                    />
                  )}
                  text
                  onClick={() => {
                    refreshPlace();
                    logEvent(USER_INTERACTION, [
                      { name: UI_SECTION, value: UISections.Places },
                      { name: DESCRIPTION, value: "refreshPlace" },
                    ]);
                  }}
                  color="red"
                  styles={{
                    minWidth: "0px !important", paddingTop: "0.2rem", textDecoration: "UnderLine", color: "rgb(196, 49, 75)",
                  }}
                />
              </Flex>
            )}
          />
        </>
      )}
      <Box className={classes.headerBox}>
        <Form>
          <Box
            styles={{
              maxWidth: "991px",
              display: "flex",
              paddingBottom: "1.4em",
              flexWrap: "wrap",
              justifyContent: "space-between",
              "@media (max-width: 968px)": {
                "& .ui-form__field": {
                  margin: "1em 0",
                  width: "50%",
                },
              },
            }}
          >
            <LocationFilter buildings={buildingsList} />
            <DateTimeFilter />
            <PlaceTypeFilter getPlaceType={getPlaceType} />
            <FeatureFilter />
          </Box>
        </Form>
      </Box>

      {!!state.location && state.location !== "Favorites"
        && (
          <BuildingPlaces
            buildingUpn={state.location}
            placeType={placeType}
            key={state.location + placeType}
            skipToken={skipTokenString}
          />
        )}
      {!!state.location && state.location === "Favorites"
        && (
          <Box styles={{ paddingTop: "1em" }}>
            <RepeatingBox>
              {state.getFilteredCustomPlaces(favoriteCampuses)
                .map((place) => (
                  <PlaceCard
                    key={`favoritesonly_${place.identity}`}
                    place={place}
                    buildingName={place.building}
                  />
                ))}
            </RepeatingBox>
          </Box>
        )}
      {!state.location && !convergeState.buildingListLoading && buildingsList.length > 0 && (
        <CustomizedPlaceCollectionAccordian
          closestBuilding={buildingsList[0]}
          favoriteCampuses={favoriteCampuses}
          getSkipToken={onSkipToken}
        />
      )}
      {convergeState.buildingListLoading && <Loader />}

    </DisplayBox>
  );
};

export default Places;
