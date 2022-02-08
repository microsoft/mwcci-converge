// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Dialog, Flex, Provider, Box, Text, Button,
} from "@fluentui/react-northstar";
import { CloseIcon } from "@fluentui/react-icons-northstar";
import React, { useState } from "react";
import dayjs from "dayjs";
import { makeStyles } from "@fluentui/react-theme-provider";
import BuildingBasicInfo from "../types/BuildingBasicInfo";
import { logEvent } from "../utilities/LogWrapper";
import {
  UI_SECTION, UISections, USER_INTERACTION, DESCRIPTION, IMPORTANT_ACTION, ImportantActions,
} from "../types/LoggerTypes";
import { useApiProvider } from "../providers/ApiProvider";
import PopupMenuWrapper from "./popupMenuWrapper";

const ChangeLocationModalStyles = makeStyles(() => ({
  triggerBtn: {
    "& .ui-button__content": {
      fontSize: "12px",
      fontWeight: "normal",
    },
  },
  contentWrapper: {
    borderBottom: "1px solid #E6E6E6",
    paddingBottom: "26px",
  },
  description: {
    marginBottom: "16px !important",
    fontSize: "14px",
  },
  location: {
    fontSize: "14px",
    fontWeight: "bold",
    marginBottom: "8px !important",
  },
  locationText: {
    marginBottom: "8px !important",
  },
}));

interface Props {
  buildings: BuildingBasicInfo[];
  date?: Date;
  recommendation?: string;
  refreshRecommendation: () => void;
}

const ChangeLocationModal: React.FC<Props> = (props) => {
  const {
    buildings,
    recommendation,
    date,
    refreshRecommendation,
  } = props;
  const {
    meService,
  } = useApiProvider();
  const [open, setOpen] = useState<boolean>(false);
  const [location, setLocation] = useState<string>(recommendation || "");
  const [loading, setLoading] = useState<boolean>(false);
  const classes = ChangeLocationModalStyles();

  const handleLocationChange = (bldg: string | undefined) => {
    logEvent(USER_INTERACTION, [
      { name: UI_SECTION, value: UISections.LocationChangeModalHome },
      { name: DESCRIPTION, value: "change_converge_prediction" },
    ]);
    setLocation(bldg || "");
  };

  const onConfirmbutton = () => {
    setLoading(true);
    logEvent(USER_INTERACTION, [
      { name: UI_SECTION, value: UISections.LocationChangeModalHome },
      { name: DESCRIPTION, value: "confirm_converge_prediction" },
    ]);
    const day = dayjs.utc(date);
    let campusUpn;
    let otherLocationOption: "Remote" | "Out of Office" | undefined;
    if (location === "Remote") {
      otherLocationOption = "Remote";
    } else if (location === "Out of Office") {
      otherLocationOption = "Out of Office";
    } else {
      const building = buildings.find((b) => b.displayName === location);
      if (building) {
        campusUpn = building.identity;
      }
    }
    meService.updateMyPredictedLocation({
      year: day.year(),
      month: day.month() + 1,
      day: day.date(),
      userPredictedLocation: {
        campusUpn,
        otherLocationOption,
      },
    }).then(() => {
      logEvent(USER_INTERACTION, [
        { name: IMPORTANT_ACTION, value: ImportantActions.ChangeConvergePrediction },
      ]);
      refreshRecommendation();
    })
      .then(() => {
        setOpen(false);
      })
      .finally(() => setLoading(false));
  };

  return (
    <Provider
      theme={{
        componentVariables: {
          Dialog: {
            rootWidth: "612px",
            headerFontSize: "18px",
          },
        },
      }}
    >
      <Dialog
        open={open}
        onOpen={() => {
          logEvent(USER_INTERACTION, [
            { name: UI_SECTION, value: UISections.LocationChangeModalHome },
            { name: DESCRIPTION, value: "open_change_converge_prediction" },
          ]);
          setOpen(true);
        }}
        onCancel={() => {
          logEvent(USER_INTERACTION, [
            { name: UI_SECTION, value: UISections.LocationChangeModalHome },
            { name: DESCRIPTION, value: "close_change_converge_prediction" },
          ]);
          setOpen(false);
        }}
        onConfirm={onConfirmbutton}
        confirmButton={{
          content: "Confirm",
          loading,
        }}
        cancelButton="Cancel"
        header="Change your location"
        headerAction={{
          icon: <CloseIcon />,
          title: "Close",
          onClick: () => {
            setOpen(false);
            logEvent(USER_INTERACTION, [
              { name: UI_SECTION, value: UISections.LocationChangeModalHome },
              { name: DESCRIPTION, value: "close_change_converge_prediction" },
            ]);
          },
        }}
        trigger={(
          <Button
            className={classes.triggerBtn}
            text
            content="Change location"
          />
        )}
        content={(
          <Flex
            column
            gap="gap.small"
            className={classes.contentWrapper}
          >
            <Box as="p" className={classes.description}>
              Converge predicts where you’re going to be working from any given day.
              By changing your location, you’re helping us to make better predictions later.
            </Box>
            <Box as="h2" className={classes.location}>
              Where are you working from on
              {" "}
              {dayjs(date).format("dddd, MMMM D")}
              ?
            </Box>
            <Text content="Location" className={classes.locationText} />
            <Box>
              <PopupMenuWrapper headerTitle="Other Options" handleDropdownChange={handleLocationChange} buildingList={buildings.map((b) => b.displayName)} locationBuildingName="" otherOptionsList={["Remote", "Out Of Office"]} width="320px" marginContent="3.8rem" value={location} placeholderTitle="Select One" buttonTitle="See more" maxHeight="90px" />
            </Box>
          </Flex>
        )}
      />
    </Provider>
  );
};

export default ChangeLocationModal;
