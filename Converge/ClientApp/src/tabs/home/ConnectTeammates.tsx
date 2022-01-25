// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useEffect } from "react";
import debounce from "lodash/debounce";
import {
  Flex, Loader, Box, Input,
  DropdownProps,
  DatepickerProps,
  ComponentEventHandler,
  InputProps,
  SiteVariablesPrepared,
  Alert,
  Button,
  Text,
} from "@fluentui/react-northstar";
import { ErrorIcon, ExclamationCircleIcon, SearchIcon } from "@fluentui/react-icons-northstar";
import DisplayBox from "./DisplayBox";
import LocationFilterList from "./components/LocationFilterList";
import SelectableTable from "./Table/SelectableTable";
import {
  DESCRIPTION, UISections, UI_SECTION, USER_INTERACTION,
} from "../../types/LoggerTypes";
import { logEvent } from "../../utilities/LogWrapper";
import { TeammateList, useTeammateProvider } from "../../providers/TeammateFilterProvider";
import IsThisHelpful from "../../utilities/IsThisHelpful";
import PrimaryDropdown from "../../utilities/PrimaryDropdown";
import DatePickerPrimary from "../../utilities/datePickerPrimary";
import EnterZipcode from "../../utilities/EnterZipCodeDialog";
import { getConvergeCalendar, setupNewUser } from "../../api/meService";
import ConvergeSettings from "../../types/ConvergeSettings";
import { useConvergeSettingsContextProvider } from "../../providers/ConvergeSettingsProvider";
import ConnectTeammatesStyles from "./styles/ConnectTeammatesStyles";

type IWidget = {
  id: string;
  title: string;
}

const ConnectTeammates: React.FC = () => {
  const { convergeSettings } = useConvergeSettingsContextProvider();
  const classes = ConnectTeammatesStyles();
  const [isError, setIsError] = React.useState(false);
  const [isMenuItem, setIsMenuItem] = React.useState(0);
  const [isConvergeCalendar, setConvergeCalendar] = React.useState(false);
  const getErrorMessage = (isErr: boolean, menuActive: number) => {
    setIsError(isErr);
    setIsMenuItem(menuActive);
  };
  const {
    state, getTeammates, updateList, updateDate,
    updateSearchString, searchMoreTeammates,
  } = useTeammateProvider();
  const [open, setOpen] = React.useState<boolean>(false);
  const [widget, setWidget] = React.useState<IWidget[]>([]);

  useEffect(() => {
    if (state.list !== TeammateList.All) getTeammates(state.list, state.date);
    else searchMoreTeammates(state.searchString);
  }, []);

  const handleDatepickerChange = (
    event: React.SyntheticEvent, data: (DatepickerProps & { value: Date; }) | undefined,
  ) => {
    logEvent(USER_INTERACTION, [
      { name: UI_SECTION, value: UISections.ConnectWithTeammates },
      { name: DESCRIPTION, value: "date_change" },
    ]);
    updateDate(data?.value || new Date());
  };

  const handleDropdownChange = (
    event: React.MouseEvent<Element, MouseEvent> | React.KeyboardEvent<Element> | null,
    data: DropdownProps,
  ) => {
    const eventData = data?.value?.toString() as TeammateList;
    updateList(eventData);
    if (eventData === TeammateList.All && state.searchString && state.searchString.length > 0) {
      searchMoreTeammates(state.searchString);
    }
    logEvent(USER_INTERACTION, [
      { name: UI_SECTION, value: UISections.ConnectWithTeammates },
      { name: DESCRIPTION, value: `dropdown_change_${data?.value}` },
    ]);
  };

  const handleInputChange: ComponentEventHandler<InputProps & {
    value: string;
  }> = (event, data) => {
    updateSearchString(data?.value);
    logEvent(USER_INTERACTION, [
      { name: UI_SECTION, value: UISections.ConnectWithTeammates },
      { name: DESCRIPTION, value: "input_change_search_users" },
    ]);
  };
  const refreshPageTeammates = async () => {
    setIsError(false);
    getTeammates(state.list, state.date);
  };

  const getMyConvergeCalendar = async () => {
    getConvergeCalendar()
      .then((ConvergeCalendar) => {
        if (ConvergeCalendar === null || ConvergeCalendar === undefined) {
          setConvergeCalendar(true);
        } else {
          setConvergeCalendar(false);
        }
      }).catch(() => setIsError(true));
  };

  useEffect(() => {
    getMyConvergeCalendar();
  }, []);

  const setupNewUserWrapper = (settings: ConvergeSettings): Promise<void> => setupNewUser(settings)
    .then(() => {
      setConvergeCalendar(false);
    })
    .catch(() => setConvergeCalendar(true));

  const reAddConvergeSettings = async () => {
    const settings = convergeSettings ? { ...convergeSettings } : { isConvergeUser: true };
    setupNewUserWrapper(settings);
    setConvergeCalendar(false);
  };

  useEffect(() => {
    const widgetActions = !convergeSettings?.zipCode
      ? [
        {
          id: "action_1",
          title: "Add a zipcode",
        },
      ]
      : [
        {
          id: "action_2",
          title: `Change my zipcode (${convergeSettings.zipCode})`,
        },
      ];
    setWidget(widgetActions);
  }, [convergeSettings?.zipCode]);

  const updateWidgetActions = (zip: string) => {
    const widgetActions = [
      {
        id: "action_2",
        title: `Change my zipcode (${zip})`,
      },
    ];
    setWidget(widgetActions);
  };

  const openEnterZipCodeDialog = () => {
    setOpen(true);
  };

  return (
    <>
      <DisplayBox
        headerContent="Connect with teammates"
        descriptionContent="Improve team collaboration by spending time with people in your network"
        gridArea="ConnectTeammates"
        showCallOut
        widgetActions={widget}
        handleCalloutItemClick={openEnterZipCodeDialog}
      >
        {isConvergeCalendar && (
          <>
            <Alert
              warning
              icon={<ExclamationCircleIcon />}
              onVisibleChange={() => setConvergeCalendar(false)}
              dismissible
              dismissAction={{ "aria-label": "close" }}
              content={(
                <Flex>
                  <Text
                    content="Your Converge calender is missing from Outlook.&nbsp;"
                    styles={{
                      minWidth: "0px !important",
                      paddingTop: "0.4rem",
                    }}
                  />
                  <Button
                    content={(
                      <Text
                        content="Re-add the calender"
                        styles={{
                          minWidth: "0px !important",
                          paddingTop: "0.4rem",
                          color: "rgb(131, 92, 0)",
                        }}
                      />
                    )}
                    text
                    onClick={() => {
                      reAddConvergeSettings();
                      logEvent(USER_INTERACTION, [
                        { name: UI_SECTION, value: UISections.ConnectWithTeammates },
                        { name: DESCRIPTION, value: "reAddConvergeSettings" },
                      ]);
                    }}
                    styles={{
                      minWidth: "0px !important", padding: "0.2rem 0", textDecoration: "UnderLine", color: "rgb(242, 227, 132)",
                    }}
                  />
                  <Text
                    content="&nbsp;to make your location available."
                    styles={{
                      minWidth: "0px !important",
                      paddingTop: "0.4rem",
                    }}
                  />
                </Flex>
              )}
            />
          </>
        )}
        {isError && (
          <>
            <Alert
              danger
              icon={<ErrorIcon />}
              onVisibleChange={() => setIsError(false)}
              dismissible
              dismissAction={{ "aria-label": "close" }}
              content={(
                <Flex>
                  <Text
                    content={isMenuItem === 1 ? "Cannot remove teammates from your list at this time." : "Cannot add teammates to your list at this time."}
                    styles={{
                      minWidth: "0px !important",
                      paddingTop: "0.4rem",
                    }}
                  />
                  <Button
                    content={(
                      <Text
                        content="Refresh and try again"
                        styles={{
                          minWidth: "0px !important",
                          paddingTop: "0.4rem",
                        }}
                      />
                    )}
                    text
                    onClick={() => {
                      refreshPageTeammates();
                      logEvent(USER_INTERACTION, [
                        { name: UI_SECTION, value: UISections.ConnectWithTeammates },
                        { name: DESCRIPTION, value: "refreshPageTeammates" },
                      ]);
                    }}
                    color="red"
                    styles={{
                      minWidth: "0px !important", paddingTop: "0.2rem", textDecoration: "UnderLine",
                    }}
                  />
                </Flex>
              )}
            />
          </>
        )}
        <Box className={classes.root}>
          <Flex
            space="between"
            variables={({ colorScheme }: SiteVariablesPrepared) => ({
              backgroundColor: colorScheme.default.background,
            })}
          >
            <Flex
              gap="gap.small"
              wrap
              className={classes.header}
            >
              <PrimaryDropdown
                items={[
                  TeammateList.Suggested,
                  TeammateList.MyOrganization,
                  TeammateList.MyList,
                  TeammateList.All]}
                handleDropdownChange={handleDropdownChange}
                value={state.list}
                width="168px"
              />
              <Box className={classes.datePickerStyles}>
                <DatePickerPrimary
                  defaultSelectedDate={new Date()}
                  onDateChange={handleDatepickerChange}
                  disabled={state.list === TeammateList.All && state.teammates.length === 0}
                />
              </Box>
            </Flex>
            <Flex
              gap="gap.small"
              wrap
              styles={{ alignSelf: "center" }}
              className={classes.header}
            >
              <LocationFilterList
                disabled={state.list === TeammateList.All && state.teammates.length === 0}
              />
              <Input
                icon={<SearchIcon />}
                clearable
                placeholder="Search..."
                role="search"
                onChange={debounce(handleInputChange, 1000)}
                className={classes.search}
              />
            </Flex>
          </Flex>
          {state.teammatesLoading
            ? (<Loader />)
            : (
              <SelectableTable
                teammates={state.getFilteredTeammates(state.teammates)}
                getErrorMessage={getErrorMessage}
              />
            )}
        </Box>
        <Box styles={{ margin: "2.5em 0 0" }}>
          <IsThisHelpful logId="dd29d245" sectionName={UISections.ConnectWithTeammates} />
        </Box>
      </DisplayBox>
      <EnterZipcode open={open} setOpen={setOpen} updateWidgetActions={updateWidgetActions} />
    </>
  );
};

export default ConnectTeammates;
