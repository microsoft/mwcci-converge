// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  gridCellWithFocusableElementBehavior,
  gridNestedBehavior,
  gridCellBehavior,
  gridRowBehavior,
  gridCellMultipleFocusableBehavior,
} from "@fluentui/accessibility";
import {
  Table,
  Checkbox,
  Text,
  Provider,
  Button,
  Flex,
  MenuButton,
  Box,
  SiteVariablesPrepared,
  Loader,
  MenuItemProps,
  MenuProps,
  ShorthandCollection,
  ShorthandValue,
} from "@fluentui/react-northstar";
import * as React from "react";
import * as _ from "lodash";
import {
  AddIcon, ErrorIcon, MoreIcon, TrashCanIcon, StarIcon,
} from "@fluentui/react-icons-northstar";
import dayjs, { Dayjs } from "dayjs";
import ResponsiveTableContainer from "./ResponsiveTableContainer";
import {
  USER_INTERACTION, UISections, UI_SECTION, DESCRIPTION, IMPORTANT_ACTION, ImportantActions,
} from "../../../types/LoggerTypes";
import { logEvent } from "../../../utilities/LogWrapper";
import { Teammate, TeammateList, useTeammateProvider } from "../../../providers/TeammateFilterProvider";
import WorkgroupAvatar from "../components/WorkgroupAvatar";
import AvailableTimesCell from "./AvailableTimesCell";
import UserLocationCell from "./UserLocationCell";
import TimeLimit from "../../../types/TimeLimit";
import { useConvergeSettingsContextProvider } from "../../../providers/ConvergeSettingsProvider";
import SelectableTableStyles from "../styles/SelectableTableStyles";
import { useApiProvider } from "../../../providers/ApiProvider";

const RELOAD_ROWS = "RELOAD_ROWS";
const USER_AVAILABILITY_REQUEST = "USER_AVAILABILITY_REQUEST";
const USER_AVAILABILITY_RESPONSE = "USER_AVAILABILITY_RESPONSE";
const TOGGLE_ITEM = "TOGGLE_ITEM";
const TOGGLE_ALL = "TOGGLE_ALL";

interface ReloadRowsAction {
  type: typeof RELOAD_ROWS,
  payload: Teammate[],
}

interface UserAvailabilityRequestAction {
  type: typeof USER_AVAILABILITY_REQUEST,
  payload: string
}

interface UserAvailabilityResponseAction {
  type: typeof USER_AVAILABILITY_RESPONSE,
  payload: { userUpn: string, availableTimes: TimeLimit[] }
}

interface ToggleItemAction {
  type: typeof TOGGLE_ITEM,
  payload: { checked: boolean, userId: string }
}

interface ToggleAllAction {
  type: typeof TOGGLE_ALL,
  payload: boolean,
}

type SelectableTableAction = UserAvailabilityRequestAction
  | UserAvailabilityResponseAction
  | ToggleAllAction
  | ToggleItemAction
  | ReloadRowsAction;

type SelectableTableState = {
  rows: Record<string, boolean>;
  availableTimes: Record<string, TimeLimit[]>;
  loadingAvailableTimes: Record<string, boolean>;
  selectedAvailableTimes: Record<string, TimeLimit[]>;
}

const getRowKeys = (teammateList: Teammate[]): Record<string, boolean> => {
  const teammateRows = teammateList.reduce((items: Record<string, boolean>, teammate) => {
    // eslint-disable-next-line no-param-reassign
    items[teammate.user.id as string] = false;
    return items;
  }, {});
  return teammateRows;
};

const selectableTableStateReducer: React.Reducer<SelectableTableState, SelectableTableAction> = (
  state, action,
) => {
  switch (action.type) {
    case RELOAD_ROWS: {
      const newState: SelectableTableState = {
        rows: getRowKeys(action.payload),
        availableTimes: {},
        loadingAvailableTimes: {},
        selectedAvailableTimes: {},
      };
      return newState;
    }
    case TOGGLE_ITEM: {
      const newState = {
        ...state,
        rows: { ...state.rows, [action.payload.userId]: action.payload.checked },
      };
      if (!action.payload.checked) {
        newState.selectedAvailableTimes[action.payload.userId] = newState
          .availableTimes[action.payload.userId];
      }
      const checkedUsers = Object.keys(newState.rows).filter((key) => newState.rows[key]);
      if (checkedUsers.length) {
        let overlapTimes = state.availableTimes[checkedUsers[0]];
        checkedUsers.forEach((user) => {
          overlapTimes = _.intersectionWith(overlapTimes, state.availableTimes[user], _.isEqual);
        });
        checkedUsers.forEach((user) => {
          newState.selectedAvailableTimes[user] = overlapTimes;
        });
      }
      return newState;
    }
    case TOGGLE_ALL: {
      const newState = {
        ...state,
        rows: _.mapValues(state.rows, () => action.payload),
      };
      if (action.payload) {
        const checkedUsers = Object.keys(newState.rows);
        let overlapTimes = state.availableTimes[checkedUsers[0]];
        checkedUsers.forEach((user) => {
          overlapTimes = _.intersectionWith(overlapTimes, state.availableTimes[user], _.isEqual);
        });
        checkedUsers.forEach((user) => {
          newState.selectedAvailableTimes[user] = overlapTimes;
        });
      } else {
        newState.selectedAvailableTimes = { ...state.availableTimes };
      }

      return newState;
    }
    case USER_AVAILABILITY_REQUEST: {
      return {
        ...state,
        loadingAvailableTimes: {
          ...state.loadingAvailableTimes,
          [action.payload]: true,
        },
      };
    }
    case USER_AVAILABILITY_RESPONSE: {
      return {
        ...state,
        loadingAvailableTimes: {
          ...state.loadingAvailableTimes,
          [action.payload.userUpn]: false,
        },
        availableTimes: {
          ...state.availableTimes,
          [action.payload.userUpn]: action.payload.availableTimes,
        },
        selectedAvailableTimes: {
          ...state.availableTimes,
          [action.payload.userUpn]: action.payload.availableTimes,
        },
      };
    }
    default:
      return state;
  }
};

interface Props {
  teammates: Teammate[];
  getErrorMessage: (isError: boolean, menuActive: number) => void
}

const SelectableTable: React.FC<Props> = (props) => {
  const { userService } = useApiProvider();
  const { teammates } = props;
  const {
    convergeSettings,
    setConvergeSettings,
  } = useConvergeSettingsContextProvider();
  const classes = SelectableTableStyles();
  const { state, getTeammates, searchMoreTeammates } = useTeammateProvider();
  const [loading, setLoading] = React.useState<boolean>(false);

  const handleMenuItemClick = (upn: string | undefined | null) => {
    if (upn) {
      let newList = convergeSettings?.myList ? [...convergeSettings.myList] : [];
      if (state.list === TeammateList.MyList) {
        setLoading(true);
      }
      if (!convergeSettings?.myList?.find((li) => li === upn)) {
        newList = convergeSettings?.myList ? convergeSettings.myList.concat([upn]) : [upn];
      } else {
        newList = convergeSettings.myList ? convergeSettings.myList.filter((li) => li !== upn) : [];
      }
      const newSettings = { ...convergeSettings, myList: newList };
      setConvergeSettings(newSettings).then(() => {
        if (state.list === TeammateList.MyList) {
          setLoading(false);
          getTeammates(state.list, state.date, state.searchString);
        }
      }).catch(() => {
        if (state.list === TeammateList.MyList) {
          props.getErrorMessage(true, 1);
        } else {
          props.getErrorMessage(true, 2);
        }
      });
    }
    let description = "add_to_list";
    if (state.list === TeammateList.MyList) {
      description = "remove_from_list";
    } else {
      logEvent(USER_INTERACTION, [
        { name: IMPORTANT_ACTION, value: ImportantActions.AddUserToList },
      ]);
    }
    logEvent(USER_INTERACTION, [
      { name: UI_SECTION, value: UISections.ConnectWithTeammates },
      { name: DESCRIPTION, value: description },
    ]);
  };

  const getMenu = (isOnMyList: boolean) => {
    const menu: ShorthandValue<MenuProps> | ShorthandCollection<MenuItemProps> = [];
    if (isOnMyList) {
      menu.push(<Button tabIndex={-1} icon={<TrashCanIcon />} circular text iconOnly content="Remove from my list" />);
    } else {
      menu.push(<Button tabIndex={-1} icon={<AddIcon />} circular text iconOnly content="Add to my list" />);
    }
    return menu;
  };

  const headers = [
    { title: "Name", key: "name", name: "name" },
    { title: "Role", key: "title", name: "title" },
    { title: "Location", key: "location", name: "location" },
    { title: "Available times", key: "availableTimes", name: "availableTimes" },
    { title: "", key: "MoreOptions", name: "MoreOptions" },
  ];

  const responsiveColumnsConfig = [
    { priority: 1, minWidth: 50 },
    { priority: 6, minWidth: 350 },
    { priority: 2, minWidth: 500 },
    { priority: 3, minWidth: 500 },
    { priority: 5, minWidth: 600 },
    { priority: 4, minWidth: 150 },
  ];

  const initialState: SelectableTableState = {
    rows: getRowKeys(teammates),
    availableTimes: {},
    loadingAvailableTimes: {},
    selectedAvailableTimes: {},
  };

  const [tableState, dispatch] = React.useReducer(selectableTableStateReducer, initialState);
  const [isError, setIsError] = React.useState(false);

  const utcTimeToLocalTime = (time: string, day: Dayjs, overnightFlag: boolean) => {
    const startCorrespondents = time.split(":").map((c) => parseInt(c, 10));
    const startUTC = dayjs.utc().year(day.year()).month(day.month()).date(day.date())
      .hour(startCorrespondents[0])
      .minute(startCorrespondents[1])
      .second(startCorrespondents[2]);
    if (overnightFlag === true) {
      return dayjs(startUTC.add(1, "days")).local().format("HH:mm:ss");
    }
    return dayjs(startUTC).local().format("HH:mm:ss");
  };

  const getAvailability = (users: Teammate[]) => {
    users.forEach((teammate) => {
      dispatch({ type: USER_AVAILABILITY_REQUEST, payload: teammate.user.id as string });
    });
    const day = dayjs(state.date);
    const scheduleDate = dayjs().year(day.year()).month(day.month()).date(day.date())
      .hour(0)
      .minute(0)
      .second(0);
    const scheduleStart = scheduleDate.toDate();
    const scheduleEnd = dayjs(scheduleStart).add(1, "day").toDate();
    userService.getMultiUserAvailabilityTimes(
      users.map((teammate) => teammate.user.userPrincipalName as string),
      day.year(),
      day.month() + 1,
      day.date(),
      scheduleStart,
      scheduleEnd,
    ).then((response) => {
      users.forEach((teammate) => {
        const userAvailableTime = response.multiUserAvailabilityTimes
          .find((time) => time.userUpn === teammate.user.userPrincipalName as string);
        if (userAvailableTime) {
          const availabilityTimes = userAvailableTime.availabilityTimes.map((time) => ({
            start: utcTimeToLocalTime(time.start, day, time.isOvernight),
            end: utcTimeToLocalTime(time.end, day, time.isOvernight),
            isOvernight: time.isOvernight,
          }));
          dispatch({
            type: USER_AVAILABILITY_RESPONSE,
            payload: {
              availableTimes: availabilityTimes,
              userUpn: teammate.user.id as string,
            },
          });
        }
      });
    }).catch(() => {
      setIsError(true);
    });
  };

  React.useEffect(() => {
    if (teammates.length) {
      dispatch({ type: RELOAD_ROWS, payload: teammates });
      getAvailability(teammates);
    }
  }, [teammates.length]);

  const refreshPageTeammates = async () => {
    getAvailability(teammates);
  };

  const loadMoreTeammates = async () => {
    searchMoreTeammates(state.searchString, state.searchQueryOptions, state.teammates);
  };

  return (
    <>
      <Provider
        theme={{
          componentVariables: {
            Button: {
              color: "#6264A7",
              borderRadius: "5px",
            },
            TableRow: ({ colorScheme }: SiteVariablesPrepared) => ({
              color: colorScheme.default.foreground,
              backgroundColor: colorScheme.default.background,
            }),
            TableCell: {
              fontSize: "14px",
            },
            SvgIcon: ({ colorScheme }: SiteVariablesPrepared) => ({
              color: colorScheme.default.foreground,
              backgroundColor: colorScheme.default.background,
            }),
          },
        }}
      >
        <ResponsiveTableContainer columns={responsiveColumnsConfig}>
          <Table aria-label="Selectable table" accessibility={gridNestedBehavior} className={classes.tableheight}>
            <Table.Row
              header
              accessibility={gridRowBehavior}
              className={classes.tableRow}
            >
              <Table.Cell
                accessibility={gridCellWithFocusableElementBehavior}
                content={(
                  <Checkbox
                    title="Select all"
                    checked={Object.keys(tableState.rows).length > 0 && _.every(tableState.rows)}
                    onClick={(event, p) => {
                      if (p) {
                        dispatch({ type: TOGGLE_ALL, payload: p.checked });
                      }
                      logEvent(USER_INTERACTION, [
                        { name: UI_SECTION, value: UISections.ConnectWithTeammates },
                        { name: DESCRIPTION, value: "select_all_teammates" },
                      ]);
                    }}
                  />
                )}
              />
              {headers.map((item) => (
                <Table.Cell content={item.title} accessibility={gridCellBehavior} key={item.key} />
              ))}
            </Table.Row>
            {loading && <Loader />}
            {
              !loading
              && (
                <>
                  <Box className={classes.teammates}>
                    {teammates.length ? teammates.map((teammate) => (
                      <Table.Row
                        accessibility={gridRowBehavior}
                        selected={tableState.rows[teammate.user.id as string]}
                        key={teammate.user.id}
                        className={classes.tableRow}
                      >
                        <Table.Cell
                          accessibility={gridCellWithFocusableElementBehavior}
                          content={(
                            <Checkbox
                              title="Select me"
                              checked={tableState.rows[teammate.user.id as string]}
                              onClick={(event, p) => {
                                if (p) {
                                  dispatch({
                                    type: TOGGLE_ITEM,
                                    payload: {
                                      checked: p.checked,
                                      userId: teammate.user.id as string,
                                    },
                                  });
                                }
                                logEvent(USER_INTERACTION, [
                                  { name: UI_SECTION, value: UISections.ConnectWithTeammates },
                                  { name: DESCRIPTION, value: "select_a_user" },
                                ]);
                              }}
                            />
                          )}
                        />
                        <Table.Cell
                          className={classes.tableCell}
                          content={(
                            <Flex gap="gap.medium" vAlign="center">
                              <WorkgroupAvatar user={teammate.user} />
                              <Text
                                title={teammate?.user?.displayName || ""}
                                className={classes.starIcon}
                              >
                                {teammate.user.displayName}
                              </Text>
                              {(
                                teammate.user.userPrincipalName
                                && convergeSettings?.myList?.includes(
                                  teammate.user.userPrincipalName,
                                )
                              )
                                && (
                                <StarIcon
                                  size="small"
                                  circular
                                />
                                )}
                            </Flex>
                          )}
                          key="1-1"
                          accessibility={gridCellBehavior}
                        />
                        <Table.Cell
                          key="1-2"
                          accessibility={gridCellBehavior}
                          className={classes.tableCell}
                          content={(
                            <Text title={teammate?.user?.jobTitle || ""}>
                              {teammate.user.jobTitle}
                            </Text>
                          )}
                        />
                        <Table.Cell
                          key="1-3"
                          accessibility={gridCellBehavior}
                          className={classes.tableCell}
                          content={<UserLocationCell teammate={teammate} />}
                        />
                        <Table.Cell
                          key="1-4"
                          accessibility={gridCellMultipleFocusableBehavior}
                          content={isError ? (
                            <Box>
                              <Text content="Cannot retreive available times." color="red" />
                              {" "}
                              <Button
                                content="Retry"
                                text
                                onClick={() => {
                                  refreshPageTeammates();
                                  logEvent(USER_INTERACTION, [
                                    { name: UI_SECTION, value: UISections.ConnectWithTeammates },
                                    { name: DESCRIPTION, value: "SelectableTable" },
                                  ]);
                                }}
                                color="red"
                                className={classes.retryBtn}
                              />
                            </Box>
                          ) : (
                            <AvailableTimesCell
                              date={state.date}
                              userUpn={teammate.user.userPrincipalName as string}
                              selectedUserUpns={teammates
                                .filter((t) => tableState.rows[t.user.id as string])
                                .map((t) => t.user.userPrincipalName as string)}
                              loading={tableState.loadingAvailableTimes[teammate.user.id as string]}
                              availableTimes={
                                tableState.selectedAvailableTimes[teammate.user.id as string]
                              }
                              disabled={
                                !tableState.rows[teammate.user.id as string]
                                && Object.keys(tableState.rows).some((key) => tableState.rows[key])
                              }
                            />
                          )}
                        />
                        <Table.Cell
                          key="1-5"
                          accessibility={gridCellMultipleFocusableBehavior}
                          content={(
                            <MenuButton
                              trigger={(
                                <Button
                                  tabIndex={-1}
                                  icon={<MoreIcon />}
                                  circular
                                  text
                                  iconOnly
                                  title="More options"
                                />
                              )}
                              menu={getMenu((convergeSettings?.myList || []).includes(teammate.user.userPrincipalName || ""))}
                              on="click"
                              onMenuItemClick={
                                () => handleMenuItemClick(teammate.user.userPrincipalName)
                              }
                            />
                          )}
                        />
                      </Table.Row>
                    ))
                      : (
                        <>
                          <Flex vAlign="center" hAlign="center" className={classes.emptyList}>
                            {state.teammatesError
                              && (
                                <>
                                  <Box>
                                    <ErrorIcon />
                                    <Text content="Something went wrong." color="red" styles={{ paddingLeft: "0.4rem" }} />
                                    <Button
                                      content="Refresh"
                                      text
                                      onClick={() => {
                                        refreshPageTeammates();
                                        logEvent(USER_INTERACTION, [
                                          {
                                            name: UI_SECTION,
                                            value:
                                            UISections.ConnectWithTeammates,
                                          },
                                          { name: DESCRIPTION, value: "refreshPageTeammates" },
                                        ]);
                                      }}
                                      color="red"
                                      className={classes.retryBtn}
                                    />
                                  </Box>
                                </>
                              )}
                          </Flex>
                          {!state.teammatesError
                            && (
                              <Flex vAlign="center" hAlign="center" className={classes.emptyList}>
                                {state.list === TeammateList.All ? "Search by name or role to find someone" : "This list is empty"}
                              </Flex>
                            )}
                        </>
                      )}
                    <Box
                      className={classes.loadBtnContainer}
                      hidden={state.list !== TeammateList.All}
                    >
                      <Button
                        onClick={() => {
                          loadMoreTeammates();
                          logEvent(USER_INTERACTION, [
                            { name: UI_SECTION, value: UISections.ConnectWithTeammates },
                            { name: DESCRIPTION, value: "loadMoreTeammates" },
                          ]);
                        }}
                        className={classes.loadBtn}
                        hidden={
                           !(state.searchQueryOptions && state.searchQueryOptions.length > 0)
                        }
                        disabled={state.moreTeammatesLoading}
                        loading={state.moreTeammatesLoading}
                        content="Show more"
                      />
                      <Text
                        className={classes.textNoMore}
                        hidden={
                          (state.searchQueryOptions && state.searchQueryOptions !== [])
                        }
                      >
                        No more results
                      </Text>
                    </Box>
                  </Box>
                </>
              )
            }
          </Table>
        </ResponsiveTableContainer>
      </Provider>
    </>
  );
};

export default SelectableTable;
