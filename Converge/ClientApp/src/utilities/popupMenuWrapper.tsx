// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from "react";
import {
  Popup, Input, ChevronDownIcon, ShorthandCollection, DropdownItemProps,
} from "@fluentui/react-northstar";
import { useEffect } from "react";
import PopupMenuContent from "./popupMenuContent";
import { useProvider as PlaceProvider } from "../providers/PlaceFilterProvider";
import { useConvergeSettingsContextProvider } from "../providers/ConvergeSettingsProvider";
import {
  DESCRIPTION, UISections, UI_SECTION, USER_INTERACTION,
} from "../types/LoggerTypes";
import { logEvent } from "./LogWrapper";

interface Props {
  headerTitle: string,
  locationBuildingName: string | undefined,
  otherOptionsList: string[];
  buildingList: ShorthandCollection<DropdownItemProps, Record<string, unknown>>,
  handleDropdownChange: (bldg: string | undefined) => void;
  marginContent: string,
  width: string,
  value: string | undefined,
  placeholderTitle: string,
  buttonTitle: string,
  maxHeight: string,
  clearTextBox?: (isValid:boolean) => void;
}

const PopupMenuWrapper: React.FunctionComponent<Props> = (props) => {
  const {
    headerTitle, buildingList, locationBuildingName, width,
    marginContent, value, placeholderTitle, buttonTitle, otherOptionsList, maxHeight,
  } = props;

  const { updateLocation } = PlaceProvider();

  const {
    updateSearchString,
    state,
  } = useConvergeSettingsContextProvider();

  const [popup, setPopup] = React.useState(false);
  const [selectedBuildingName, setSelectedBuildingName] = React.useState<
    string | undefined>(value);

  const handleDropdownChange = (bldg: string | undefined) => {
    setPopup(false);
    setSelectedBuildingName(bldg);
    const selectedBuilding = state.buildingsList.find((b) => b.displayName === bldg);
    updateLocation(selectedBuilding?.identity);
    props.handleDropdownChange(bldg);
    props.clearTextBox?.(false);
  };

  useEffect(() => {
    setSelectedBuildingName(value);
  }, [value]);

  const onClickTextboxChange = () => {
    if (popup === true) setPopup(false);
    else setPopup(true);
    setSelectedBuildingName("");
  };
  const handleTextboxChange = (searchText: string | undefined) => {
    setPopup(true);
    setSelectedBuildingName(searchText || "");
    updateLocation(undefined);
    updateSearchString(searchText);
    props.clearTextBox?.(true);
  };

  return (
    <Popup
      position="below"
      align="bottom"
      open={popup}
      onOpenChange={(_, callOutprops) => {
        const open = !!callOutprops?.open;
        setPopup(open);
      }}
      trigger={(
        <Input
          icon={(
            <ChevronDownIcon onClick={() => {
              onClickTextboxChange();
              logEvent(USER_INTERACTION, [
                {
                  name: UI_SECTION,
                  value: UISections.PopupMenuWrapper,
                },
                {
                  name: DESCRIPTION,
                  value: "ChevronDownIconClick",
                },
              ]);
            }}
            />
          )}
          value={selectedBuildingName}
          clearable
          onChange={((event, data) => handleTextboxChange(data?.value))}
          placeholder={placeholderTitle}
        />
      )}
      content={{
        styles: {
          width,
          "& .ui-popup__content__content": { padding: "5px", marginLeft: marginContent },
          "& ul": { border: "none", width: "100%", padding: "5px 0" },
          "@media (max-width: 1366px)": {
            "& .ui-popup__content__content": { padding: "5px", marginLeft: "2.6rem" },
            "& ul": { border: "none", width: "100%", padding: "5px 0" },
          },

        },
        content: (
          <PopupMenuContent
            headerTitle={headerTitle}
            buildingList={buildingList}
            handleDropdownChange={handleDropdownChange}
            locationBuildingName={locationBuildingName}
            buttonTitle={buttonTitle}
            otherOptionsList={otherOptionsList}
            maxHeight={maxHeight}
          />
        ),
      }}
      on={["context", "hover"]}
    />
  );
};

export default PopupMenuWrapper;
