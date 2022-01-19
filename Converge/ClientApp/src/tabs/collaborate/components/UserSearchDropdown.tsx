// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  DropdownItemProps, DropdownProps, ShorthandValue, Box, ShorthandCollection,
  Text,
} from "@fluentui/react-northstar";
import { User } from "@microsoft/microsoft-graph-types";
import React, { useEffect, useState } from "react";
import debounce from "lodash/debounce";
import { logEvent } from "../../../utilities/LogWrapper";
import { searchUsers } from "../../../api/userService";
import PrimaryDropdown from "../../../utilities/PrimaryDropdown";
import {
  DESCRIPTION, UISections, UI_SECTION, USER_INTERACTION,
} from "../../../types/LoggerTypes";
import UserSearchDropdownStyles from "../styles/UserSearchDropdownStyles";

interface Props {
  maxSelected?: number,
  selectedUsers: string[],
  onSelectedUsersChange: (selectedUsers: User[]) => void,
  defaultDropdownUsers?: User[],
  usersMissingCoordinates: User[],
}

const getA11ySelectionMessage = {
  onAdd: (item: ShorthandValue<DropdownItemProps>) => `${item} has been selected.`,
  onRemove: (item: ShorthandValue<DropdownItemProps>) => `${item} has been removed.`,
};

const UserSearchDropdown:React.FC<Props> = (props) => {
  const {
    selectedUsers,
    onSelectedUsersChange,
    defaultDropdownUsers,
    usersMissingCoordinates,
  } = props;
  const [inputItems, setInputItems] = useState<
    ShorthandCollection<DropdownItemProps, Record<string, unknown>>
  >([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [dropdownUsers, setDropdownUsers] = useState<User[]>([]);
  const [isError, setIsError] = useState<boolean>(false);
  const classes = UserSearchDropdownStyles();

  useEffect(() => {
    if (defaultDropdownUsers?.length) {
      const newDropdownUsers = [...dropdownUsers];
      defaultDropdownUsers.forEach((user) => {
        const dropdownUser = dropdownUsers.find((u) => u.displayName === user.displayName);
        if (!dropdownUser) {
          newDropdownUsers.push(user);
        }
        setDropdownUsers(newDropdownUsers);
      });
    }
  }, [defaultDropdownUsers]);

  const onChange = (
    event: React.MouseEvent | React.KeyboardEvent | null,
    data: DropdownProps,
  ) => {
    const usersSelected = data?.value as string[] || [];
    const su: User[] = [];
    usersSelected.forEach((u) => {
      const user = dropdownUsers.find((dropdownUser) => dropdownUser.displayName === u);
      setSelectedUser(u);
      if (user) {
        su.push(user);
      }
    });
    onSelectedUsersChange(su);
    logEvent(USER_INTERACTION, [
      { name: UI_SECTION, value: UISections.CollaborationTab },
      { name: DESCRIPTION, value: "selected_users_change" },
    ]);
  };

  const onSearchQueryChange = (
    event: React.MouseEvent | React.KeyboardEvent | null,
    data: DropdownProps,
  ) => {
    if (data?.searchQuery) {
      setLoading(true);
      searchUsers(data.searchQuery.toString())
        .then((users) => {
          setInputItems(users.filter((u) => !!u.displayName).map((u) => u.displayName as string));
          setDropdownUsers(dropdownUsers.filter((u) => {
            if (u.displayName) {
              return selectedUsers.includes(u.displayName)
                || defaultDropdownUsers?.find((ddu) => ddu.displayName === u.displayName);
            }
            return false;
          }).concat(users.filter((u) => !!u.displayName)));
        }).catch(() => setIsError(true))
        .finally(() => setLoading(false));
    } else {
      setInputItems([]);
    }
    logEvent(USER_INTERACTION, [
      { name: UI_SECTION, value: UISections.CollaborationTab },
      { name: DESCRIPTION, value: "search_query" },
    ]);
  };

  return (
    <Box className={classes.root}>
      <PrimaryDropdown
        search
        multiple
        inverted
        onSearchQueryChange={debounce(onSearchQueryChange, 1000)}
        loading={loading}
        loadingMessage="Loading..."
        items={inputItems}
        placeholder="Search teammates"
        getA11ySelectionMessage={getA11ySelectionMessage}
        noResultsMessage="We couldn't find any matches."
        handleDropdownChange={onChange}
        value={selectedUsers}
        width="404px"
      />
      {selectedUsers.length !== 0 && isError
      && (
        <Box>
          <Text content={`Cannot locate ${selectedUser}. Search results may be affected`} error />
        </Box>
      )}
      {usersMissingCoordinates.length !== 0
      && (
        <Box>
          {usersMissingCoordinates.map((u) => (
            <Box>
              <Text content={`Cannot locate ${u.displayName}. Search results may be affected`} error />
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default UserSearchDropdown;
