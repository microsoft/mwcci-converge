// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from "react";
import {
  Dropdown, DropdownMenuItemType, IDropdownOption, IDropdownStyles,
} from "@fluentui/react/lib/Dropdown";
import { Box } from "@fluentui/react-northstar";
import { FilterIcon } from "@fluentui/react-icons-northstar";
import { logEvent } from "../../../utilities/LogWrapper";
import { useTeammateProvider } from "../../../providers/TeammateFilterProvider";
import {
  DESCRIPTION, UISections, UI_SECTION, USER_INTERACTION,
} from "../../../types/LoggerTypes";
import LocationFilterListStyles from "../styles/LocationFilterListStyles";

const dropdownStyles: Partial<IDropdownStyles> = {
  callout: {
    "&.ms-Dropdown-callout": {
      width: 210,
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

interface Props {
  disabled?: boolean;
}

const LocationFilterList: React.FC<Props> = (props) => {
  const [selectedKeysCount, setSelectedKeysCount] = React.useState<number>(0);
  const { state, updateLocations } = useTeammateProvider();
  const { disabled } = props;
  const classes = LocationFilterListStyles();

  const onChange = (event: React.FormEvent<HTMLDivElement>,
    option?: IDropdownOption | undefined)
    : void => {
    let sk: string[] = [];
    if (option && option.key !== "clear") {
      sk = option.selected ? [...state.locations, option.key as string]
        : state.locations.filter((key) => key !== option.key);
      setSelectedKeysCount(
        option.selected ? selectedKeysCount + 1 : selectedKeysCount - 1,
      );
    } else if (option && option.key === "clear") {
      sk = [];
      setSelectedKeysCount(0);
    }
    updateLocations(sk);
    logEvent(USER_INTERACTION, [
      { name: UI_SECTION, value: UISections.WorkspaceHome },
      { name: DESCRIPTION, value: "change_selected_building" },
    ]);
  };

  const dropdownDefaultOptions = [
    { key: "featureHeader", text: "Filter location", itemType: DropdownMenuItemType.Header },
    { key: "divider_1", text: "-", itemType: DropdownMenuItemType.Divider },
    { key: "clear", text: "Clear", itemType: DropdownMenuItemType.Normal },
    { key: "OOF", text: "Out of Office", itemType: DropdownMenuItemType.Normal },
    { key: "Unknown", text: "Unknown", itemType: DropdownMenuItemType.Normal },
    { key: "Remote", text: "Remote", itemType: DropdownMenuItemType.Normal },
  ];

  const dropdownLocationOptions = state.teammates
    .filter((t) => !!t.location && !dropdownDefaultOptions.some((o) => o.key === t.location))
    .map((t) => ({
      key: t.location as string,
      text: t.location as string,
      itemType: DropdownMenuItemType.Normal,
    }))
    .reduce((acc: {key: string, text: string, itemType: number}[], currentValue) => (
      acc.some((i) => i.key === currentValue.key) ? acc : acc.concat(currentValue)), []);

  const dropdownOptions = dropdownDefaultOptions
    .concat(dropdownLocationOptions);

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
    <Box
      className={classes.root}
    >
      <Dropdown
        onRenderPlaceholder={onRenderPlaceholder}
        onChange={onChange}
        selectedKeys={state.locations}
        multiSelect
        options={dropdownOptions}
        styles={dropdownStyles}
        onRenderTitle={onRenderTitle}
        disabled={disabled}
      />
    </Box>
  );
};

export default LocationFilterList;
