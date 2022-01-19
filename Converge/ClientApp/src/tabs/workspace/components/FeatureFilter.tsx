// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from "react";
import {
  Dropdown, DropdownMenuItemType, IDropdownOption, IDropdownStyles,
} from "@fluentui/react/lib/Dropdown";
import { Box } from "@fluentui/react-northstar";
import { FilterIcon } from "@fluentui/react-icons-northstar";
import { makeStyles } from "@fluentui/react-theme-provider";
import { PlaceAttributeKeys, useProvider as PlaceProvider } from "../../../providers/PlaceFilterProvider";
import { logEvent } from "../../../utilities/LogWrapper";
import {
  USER_INTERACTION, UISections, UI_SECTION, DESCRIPTION,
} from "../../../types/LoggerTypes";

const useDropdownStyles = makeStyles(() => ({
  lightTheme: {
    display: "flex",
    marginTop: "25px",
    paddingLeft: "10px",
    position: "relative",
    "& .ms-Dropdown, & .ms-Dropdown:hover > .ms-Dropdown-title, & .ms-Dropdown-title": {
      backgroundColor: "#fff",
      color: "#605D5A",
    },
  },
}));

const dropdownStyles: Partial<IDropdownStyles> = {
  callout: {
    "&.ms-Dropdown-callout": {
      width: 170,
    },
  },
  dropdown: {
    width: 90,
    ".ms-Dropdown-title": {
      border: "none",
      fontSize: "14px",
      fontWeight: "bold",
    },
    ".ms-Dropdown-caretDownWrapper": {
      display: "none",
    },
  },
  dropdownItems: {
    padding: "0 5px 10px 5px",
    ".ms-Dropdown-header": {
      color: "#000",
    },
    ".is-checked, .is-enabled": {
      border: "none",
      ".ms-Checkbox-label": {
        flexDirection: "row-reverse",
        justifyContent: "space-between",
        backgroundColor: "#fff",
      },
    },
    ".is-checked": {
      ".ms-Checkbox-checkbox": {
        backgroundColor: "#6264A7",
        borderColor: "#6264A7",
      },
    },
  },
  dropdownItem: {
    "&[title='Clear']": {
      position: "absolute",
      top: "0",
      right: "5px",
      width: "50%",
      color: "#6264A7",
      ".ms-Checkbox-checkbox": {
        display: "none",
      },
    },
  },
};

const iconStyles = { paddingBottom: "5px", margin: "0 5px" };

const FeatureFilter: React.FC = () => {
  const { updateAttributeFilter, state } = PlaceProvider();
  const [selectedKeysCount, setSelectedKeysCount] = React.useState<number>(0);
  const classes = useDropdownStyles();

  const dropdownOptions: IDropdownOption[] = [
    { key: "featureHeader", text: "Features", itemType: DropdownMenuItemType.Header },
    { key: "divider_1", text: "-", itemType: DropdownMenuItemType.Divider },
    { key: "clear", text: "Clear", itemType: DropdownMenuItemType.Normal },
    { key: "audioDeviceName", text: "Audio" },
    { key: "displayDeviceName", text: "Display" },
    { key: "videoDeviceName", text: "Video" },
    { key: "isWheelChairAccessible", text: "Accessible" },
  ];

  const onChange = (event: React.FormEvent<HTMLDivElement>,
    option?: IDropdownOption | undefined) : void => {
    logEvent(USER_INTERACTION, [
      { name: UI_SECTION, value: UISections.PlaceSearch },
      { name: DESCRIPTION, value: `filter_change_${option?.key}` },
    ]);
    if (!option) {
      return;
    }
    let attributeFilter: PlaceAttributeKeys[] = [];
    if (["audioDeviceName", "displayDeviceName", "videoDeviceName", "isWheelChairAccessible"]
      .indexOf(option.key as string) > -1) {
      attributeFilter = option.selected
        ? [...state.attributeFilter, option.key as PlaceAttributeKeys]
        : state.attributeFilter.filter((k) => k !== option.key);
    } else if (option.key === "clear") {
      attributeFilter = [];
    }
    updateAttributeFilter(attributeFilter);
    setSelectedKeysCount(attributeFilter.length);
  };

  const onRenderTitle = (): JSX.Element => (
    <div className="dropdownExample-placeholder">
      <FilterIcon styles={iconStyles} size="medium" />
      <span>
        Filter
        {" "}
        (
        {selectedKeysCount}
        )
      </span>
    </div>
  );

  const onRenderPlaceholder = (): JSX.Element => (
    <div className="dropdownExample-placeholder">
      <FilterIcon styles={iconStyles} size="medium" />
      <span>
        Filter
      </span>
    </div>
  );
  return (
    <Box className={classes.lightTheme}>
      <Dropdown
        onRenderPlaceholder={onRenderPlaceholder}
        onChange={onChange}
        selectedKeys={state.tagFilter.concat(state.attributeFilter)}
        multiSelect
        options={dropdownOptions}
        styles={dropdownStyles}
        onRenderTitle={onRenderTitle}
      />
    </Box>
  );
};

export default FeatureFilter;
