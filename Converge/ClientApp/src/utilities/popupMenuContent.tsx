// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, useEffect } from "react";
import {
  Flex, Divider, Text, DropdownItemProps, ShorthandCollection, Provider, Button, Loader, Box,
} from "@fluentui/react-northstar";
import { useLocation } from "react-router";
import { useConvergeSettingsContextProvider } from "../providers/ConvergeSettingsProvider";
import BookWorkspaceStyles from "../tabs/home/styles/BookWorkspaceStyles";
import { logEvent } from "./LogWrapper";
import {
  DESCRIPTION, UISections, UI_SECTION, USER_INTERACTION,
} from "../types/LoggerTypes";

interface Props {
  headerTitle: string,
  locationBuildingName: string | undefined;
  otherOptionsList: string[];
  buildingList: ShorthandCollection<DropdownItemProps, Record<string, unknown>>;
  handleDropdownChange: (bldg: string | undefined) => void;
  buttonTitle: string;
  maxHeight: string;
}

const PopupMenuContent: React.FunctionComponent<Props> = (props) => {
  const {
    headerTitle, buildingList, locationBuildingName, buttonTitle, otherOptionsList, maxHeight,
  } = props;
  const {
    state,
    setBuildingsByDistanceRadius,
    getRecentBuildings,
    setClickBuildingListLoading,
    convergeSettings,
  } = useConvergeSettingsContextProvider();

  const classes = BookWorkspaceStyles();
  const location = useLocation();
  const [recentBuildingsLoading, setRecentBuildingsLoading] = useState(false);

  const onClickSeeMore = () => {
    if (state.buildingsByRadiusDistance < 1000) {
      setClickBuildingListLoading(true);
      setBuildingsByDistanceRadius(state.buildingsByRadiusDistance * 10);
    } else if (state.buildingsByRadiusDistance < 4000) {
      setClickBuildingListLoading(true);
      setBuildingsByDistanceRadius(state.buildingsByRadiusDistance + 1000);
    }
  };

  useEffect(() => {
    if (!state.recentBuildings.length) {
      setRecentBuildingsLoading(true);
    }
    getRecentBuildings()
      .finally(() => setRecentBuildingsLoading(false));
  }, [convergeSettings?.recentBuildingUpns]);

  return (
    <Provider>
      <Box>
        <Flex vAlign="center">
          <Text content={headerTitle} weight="semibold" styles={{ marginLeft: "1rem" }} />
        </Flex>
      </Box>
      {location.pathname !== "/workspace" && locationBuildingName !== ""
        && (
          <Box>
            <>
              <Button
                text
                styles={{ minWidth: "0rem !important", maxWidth: "230px !important" }}
                onClick={() => {
                  props.handleDropdownChange(locationBuildingName);
                  logEvent(USER_INTERACTION, [
                    {
                      name: UI_SECTION,
                      value: UISections.PopupMenuContent,
                    },
                    {
                      name: DESCRIPTION,
                      value: "handleDropdownChange",
                    },
                  ]);
                }}
              >
                <Text
                  content={locationBuildingName}
                  title={locationBuildingName}
                  weight="semilight"
                  styles={{
                    whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden", marginLeft: "0.6rem", marginTop: "1rem",
                  }}
                />
              </Button>
            </>
          </Box>
        )}
      {location.pathname === "/workspace" && recentBuildingsLoading && <Loader />}
      {location.pathname === "/workspace" && state.recentBuildings.length > 0
        && (
          <Box>
            {state.recentBuildings.map((item) => (
              <>
                <Flex>
                  <Button
                    text
                    styles={{ minWidth: "0rem !important", maxWidth: "230px !important" }}
                    onClick={() => {
                      props.handleDropdownChange(item?.displayName);
                      logEvent(USER_INTERACTION, [
                        {
                          name: UI_SECTION,
                          value: UISections.PopupMenuContent,
                        },
                        {
                          name: DESCRIPTION,
                          value: "handleDropdownChange",
                        },
                      ]);
                    }}
                  >
                    <Text
                      content={item.displayName}
                      title={item?.displayName}
                      weight="semilight"
                      styles={{
                        whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden", marginLeft: "0.6rem", marginTop: "1rem",
                      }}
                    />
                  </Button>
                </Flex>
              </>
            ))}
          </Box>
        )}
      {location.pathname !== "/workspace" && otherOptionsList.length > 0
        && (
          <Box>
            {otherOptionsList.map((item) => (
              <>
                <Flex>
                  <Button
                    text
                    styles={{ minWidth: "0rem !important", maxWidth: "230px !important" }}
                    onClick={() => {
                      props.handleDropdownChange(item);
                      logEvent(USER_INTERACTION, [
                        {
                          name: UI_SECTION,
                          value: UISections.PopupMenuContent,
                        },
                        {
                          name: DESCRIPTION,
                          value: "handleDropdownChange",
                        },
                      ]);
                    }}
                  >
                    <Text
                      content={item}
                      title={item}
                      weight="semilight"
                      styles={{
                        whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden", marginLeft: "0.6rem", marginTop: "1rem",
                      }}
                    />
                  </Button>
                </Flex>
              </>
            ))}
          </Box>
        )}
      <Divider className="filter-popup-menu-divider" styles={{ marginTop: "0.4rem" }} />
      <Box className={classes.WorkSpacebuildingContent} styles={{ maxHeight }}>
        <Box>
          <Flex gap="gap.small" vAlign="center">
            <Text content="Buildings near you" weight="semibold" styles={{ marginLeft: "1rem", marginTop: "0.6rem" }} />
          </Flex>
        </Box>
        {buildingList.length > 0
          && (
            <Box>
              {buildingList.map((item) => (
                <>
                  <Flex>
                    <Button
                      text
                      styles={{ minWidth: "0rem !important", maxWidth: "230px !important" }}
                      onClick={() => {
                        props.handleDropdownChange(item?.toString());
                        logEvent(USER_INTERACTION, [
                          {
                            name: UI_SECTION,
                            value: UISections.PopupMenuContent,
                          },
                          {
                            name: DESCRIPTION,
                            value: "handleDropdownChange",
                          },
                        ]);
                      }}
                    >
                      <Text
                        content={item}
                        title={item?.toString()}
                        weight="semilight"
                        styles={{
                          whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden", marginLeft: "0.6rem", marginTop: "1rem",
                        }}
                      />
                    </Button>
                  </Flex>
                </>
              ))}
            </Box>
          )}
      </Box>
      {state.clickBuildingListLoading && <Loader label={state.buildingsLoadingMessage} />}
      <Divider className="filter-popup-menu-divider" styles={{ marginTop: "0.4rem" }} />
      <Flex gap="gap.small" vAlign="center" hAlign="start" styles={{ marginBottom: "1.5%" }}>
        <Button
          text
          content={buttonTitle}
          onClick={() => {
            onClickSeeMore();
            logEvent(USER_INTERACTION, [
              {
                name: UI_SECTION,
                value: UISections.PopupMenuContent,
              },
              {
                name: DESCRIPTION,
                value: "onClickSeeMore",
              },
            ]);
          }}
          disabled={state.buildingsByRadiusDistance >= 4000}
          styles={{ color: "#464775" }}
        />
      </Flex>
    </Provider>
  );
};

export default PopupMenuContent;
