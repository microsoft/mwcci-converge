// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Box,
  Button,
  Dropdown,
  DropdownProps,
  ErrorIcon,
  Flex,
  FormLabel,
  Loader,
  Text,
  useFluentContext,
} from "@fluentui/react-northstar";
import * as React from "react";
import { useEffect, useState } from "react";
import useBuildingPlaces from "../../../hooks/useBuildingPlaces";
import { PlaceType } from "../../../types/ExchangePlace";
import {
  DESCRIPTION, UISections, UI_SECTION, USER_INTERACTION,
} from "../../../types/LoggerTypes";
import { logEvent } from "../../../utilities/LogWrapper";
import BuildingPlacesStyles from "../styles/BuildingPlacesStyles";
import PlaceCard from "./PlaceCard";
import RepeatingBox from "./RepeatingBox";
import { useProvider as PlaceFilterProvider } from "../../../providers/PlaceFilterProvider";
import { useApiProvider } from "../../../providers/ApiProvider";
import IsThisHelpful from "../../../utilities/IsThisHelpful";

interface IPlaceResultSetProps {
  buildingUpn: string;
  skipToken:string;
  placeType?: PlaceType
}

const BuildingPlaces: React.FC<IPlaceResultSetProps> = ({
  buildingUpn, placeType,
  skipToken,
}) => {
  const { theme } = useFluentContext();
  const { state } = PlaceFilterProvider();
  const classes = BuildingPlacesStyles();
  const { buildingService } = useApiProvider();
  const {
    placesLoading,
    places,
    requestBuildingPlaces,
    hasMore,
  } = useBuildingPlaces(buildingService, buildingUpn);

  const pageSizeOptions = [
    10, 15, 25, 50,
  ];
  const [itemsPerPage, setItemsPerPage] = useState<number>(pageSizeOptions[0]);
  const [count, setCount] = useState<number>(0);
  const [skipTokenString, setSkipTokenString] = useState<string>(skipToken);
  const handleItemCountChange = (
    event: React.MouseEvent<Element, MouseEvent> | React.KeyboardEvent<Element> | null,
    data: DropdownProps,
  ) => {
    setItemsPerPage(data?.value as number ?? pageSizeOptions[0]);
  };

  useEffect(() => {
    requestBuildingPlaces(
      placeType ?? PlaceType.Room,
      itemsPerPage,
      {
        isWheelchairAccessible: state.attributeFilter.indexOf("isWheelChairAccessible") > -1,
        hasAudio: state.attributeFilter.indexOf("audioDeviceName") > -1,
        hasDisplay: state.attributeFilter.indexOf("displayDeviceName") > -1,
        hasVideo: state.attributeFilter.indexOf("videoDeviceName") > -1,
      },
      skipTokenString,
      true,
    ).then((s) => {
      setCount(s.exchangePlacesList.length);
      setSkipTokenString(s.skipToken);
    });
  }, [buildingUpn, state.attributeFilter]);

  return (
    <Flex
      column
    >
      <Flex space="between">
        <Flex>
          <FormLabel
            htmlFor={`BuildingItemsPerRequest-${buildingUpn}`}
            className={classes.pageSizeLabel}
          >
            Show
          </FormLabel>
          <Dropdown
            id={`BuildingItemsPerRequest-${buildingUpn}`}
            title="Show"
            className={classes.pageSizeInput}
            items={pageSizeOptions}
            value={itemsPerPage}
            onSearchQueryChange={handleItemCountChange}
            position="below"
            variables={{
              width: "64px",
            }}
          />
        </Flex>
        <Flex>
          <FormLabel
            htmlFor={`BuildingSortby-${buildingUpn}`}
            className={classes.pageSizeLabel}
          >
            Sort by
          </FormLabel>
          <Dropdown
            id={`BuildingSortby-${buildingUpn}`}
            title="Show"
            items={["Capacity"]}
            position="below"
            value="Capacity"
          />
        </Flex>
      </Flex>
      <Flex hAlign="center" vAlign="center" style={{ marginTop: "8px" }}>
        {placesLoading === false && hasMore === false && count === 0
              && (
                <>
                  <ErrorIcon styles={{ paddingLeft: "5rem" }} />
                  <Text
                    error
                    styles={{ paddingLeft: "0.5rem" }}
                  >
                    There was a problem loading
                    {" "}
                    {buildingUpn}
                    .Please choose another building from the menu
                  </Text>

                </>

              )}
      </Flex>
      <Flex hAlign="center" vAlign="center" style={{ marginTop: "8px" }}>
        {placesLoading === true && skipTokenString === null
              && (<Loader />)}
      </Flex>
      <Box styles={{ padding: "16px 0" }}>
        <RepeatingBox>
          {(places ?? []).map(((place, index) => (
            <PlaceCard
              place={place}
              buildingName={place.building}
              key={place.identity + place.capacity + index.toString()}
            />
          )))}
        </RepeatingBox>
      </Box>

      <Flex hAlign="center" vAlign="center" style={{ marginTop: "8px" }}>
        {placesLoading === true && skipTokenString !== null
              && (<Loader />)}
      </Flex>
      <Flex
        hAlign="center"
        style={{
          margin: "16px, 0",
        }}
      >
        {hasMore && (
          <Button
            content="Show more"
            onClick={() => {
              requestBuildingPlaces(
                placeType ?? PlaceType.Room,
                itemsPerPage,
                {
                  isWheelchairAccessible: state.attributeFilter.indexOf("isWheelChairAccessible") > -1,
                  hasAudio: state.attributeFilter.indexOf("audioDeviceName") > -1,
                  hasDisplay: state.attributeFilter.indexOf("displayDeviceName") > -1,
                  hasVideo: state.attributeFilter.indexOf("videoDeviceName") > -1,
                },
                skipTokenString,
                false,
              ).then((s) => {
                setSkipTokenString(s.skipToken);
              });
              logEvent(USER_INTERACTION, [
                { name: UI_SECTION, value: UISections.BookPlaceModal },
                { name: DESCRIPTION, value: "requestWorkspaces" },
              ]);
            }}
          />
        ) }
      </Flex>
      <Flex hAlign="center" vAlign="center" style={{ marginTop: "8px" }}>
        {placesLoading === false && hasMore === false && skipTokenString === null
              && (
              <Text style={{
                color: theme.siteVariables.colors.grey[400],
              }}
              >
                No more results
              </Text>
              )}
      </Flex>
      <Box className={classes.isThisHelpful}>
        <IsThisHelpful logId="3938cd30" sectionName={UISections.PlaceResults} />
      </Box>
    </Flex>
  );
};

export default BuildingPlaces;
