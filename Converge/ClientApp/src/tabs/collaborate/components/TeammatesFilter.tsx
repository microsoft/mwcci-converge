// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState } from "react";
import {
  Flex,
  FormField,
  ParticipantAddIcon, Text,
} from "@fluentui/react-northstar";

import { User } from "@microsoft/microsoft-graph-types";
import { logEvent } from "../../../utilities/LogWrapper";
import {
  USER_INTERACTION, UISections, UI_SECTION, DESCRIPTION,
} from "../../../types/LoggerTypes";
import UserSearchDropdown from "./UserSearchDropdown";
import { useSearchContextProvider } from "../../../providers/SearchProvider";
import TeammatesFilterStyles from "../styles/TeammatesFilterStyles";

interface Props {
  usersMissingCoordinates: User[];
}

const TeammatesFilter: React.FC<Props> = ({ usersMissingCoordinates }) => {
  const {
    state,
    setSelectedUsers,
  } = useSearchContextProvider();
  const classes = TeammatesFilterStyles();
  const [Error, setIsError] = useState<boolean>(false);
  const dropdownChangeHandler = (
    su: User[],
  ) => {
    setIsError(false);
    setSelectedUsers(su);
    logEvent(USER_INTERACTION, [
      { name: UI_SECTION, value: UISections.CollaborationTab },
      { name: DESCRIPTION, value: "selected_user_change" },
    ]);
  };
  return (
    <FormField>
      <Flex gap="gap.medium" vAlign="center">
        <ParticipantAddIcon
          outline
          className={classes.participantIconHideClass}
        />
        <UserSearchDropdown
          onSelectedUsersChange={dropdownChangeHandler}
          selectedUsers={state.selectedUsers.map((su) => su.displayName) as string[]}
          defaultDropdownUsers={state.selectedUsers}
          maxSelected={10}
          usersMissingCoordinates={usersMissingCoordinates}
        />
      </Flex>
      {Error && (
      <Text content="Something went wrong, Try refreshing the page." error styles={{ paddingLeft: "2rem" }} />
      )}
    </FormField>
  );
};

export default TeammatesFilter;
