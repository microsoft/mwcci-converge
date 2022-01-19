// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  DropdownItemProps, DropdownProps, ShorthandCollection, ShorthandValue,
} from "@fluentui/react-northstar";
import React, { useEffect, useState } from "react";
import { useSearchContextProvider } from "../../providers/SearchProvider";
import { useTeamsContext } from "../../providers/TeamsContextProvider";

import {
  USER_INTERACTION, UI_SECTION, UISections, DESCRIPTION,
} from "../../types/LoggerTypes";
import { logEvent } from "../../utilities/LogWrapper";
import PrimaryDropdown from "../../utilities/PrimaryDropdown";

enum MeetOptions {
  CloseToMe = "Close to me",
  MeetInTheMiddle = "Meet in the middle"
}

const MeetFilter:React.FC = () => {
  const {
    state,
    setMeetUsers,
    setLoginUser,
  } = useSearchContextProvider();
  const [selectedItem, setSelectedItem] = useState<
    ShorthandValue<DropdownItemProps> |
    ShorthandCollection<DropdownItemProps, Record<string, unknown>>
  >(MeetOptions.MeetInTheMiddle);
  const { teamsContext } = useTeamsContext();
  const dropdownChangeHandler = (
    event: React.MouseEvent | React.KeyboardEvent | null,
    data: DropdownProps,
  ) => {
    switch (data?.value) {
      case MeetOptions.CloseToMe: {
        if (teamsContext?.userPrincipalName) {
          setMeetUsers([teamsContext.userPrincipalName]);
        }
        break;
      }
      case MeetOptions.MeetInTheMiddle: {
        if (teamsContext?.userPrincipalName) {
          setMeetUsers(state.selectedUsers
            .map((u) => u.userPrincipalName as string)
            .concat([teamsContext.userPrincipalName]));
        }
        break;
      }
      default: {
        if (data?.value) {
          const displayName = data.value.toString().slice(9);
          const user = state.selectedUsers.find((u) => u.displayName === displayName);
          if (user && user.userPrincipalName) {
            setMeetUsers([user.userPrincipalName]);
          }
        }
        break;
      }
    }
    setSelectedItem(data?.value);
    logEvent(USER_INTERACTION, [
      { name: UI_SECTION, value: UISections.CollaborationTab },
      { name: DESCRIPTION, value: `change_meet_option_${data?.value}` },
    ]);
  };

  useEffect(() => {
    if (selectedItem === MeetOptions.MeetInTheMiddle) {
      if (teamsContext?.userPrincipalName) {
        setLoginUser(teamsContext.userPrincipalName);
        setMeetUsers(state.selectedUsers
          .map((u) => u.userPrincipalName as string)
          .concat([teamsContext.userPrincipalName]));
      }
    }
  }, [state.selectedUsers]);

  return (
    <PrimaryDropdown
      value={selectedItem}
      items={[
        MeetOptions.MeetInTheMiddle,
        ...state.selectedUsers.map((u) => `Close to ${u.displayName}`),
        MeetOptions.CloseToMe,
      ]}
      width="200px"
      inverted
      handleDropdownChange={dropdownChangeHandler}
    />
  );
};

export default MeetFilter;
