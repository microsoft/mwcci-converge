// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Loader } from "@fluentui/react-northstar";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { getLocation } from "../../../api/userService";
import { Teammate, useTeammateProvider } from "../../../providers/TeammateFilterProvider";

interface Props {
  teammate: Teammate;
}

const UserLocationCell: React.FC<Props> = (props) => {
  const { teammate } = props;
  const [loading, setLoading] = useState<boolean>(true);
  const { state, setTeammateLocation } = useTeammateProvider();
  const [isError, setIsError] = React.useState(false);
  useEffect(() => {
    if (teammate.user.id) {
      const day = dayjs.utc(state.date);
      getLocation(teammate.user.id, day.year(), day.month() + 1, day.date())
        .then((loc) => {
          if (teammate.user.id) {
            setTeammateLocation(teammate.user.id, loc);
          }
        }).catch(() => setIsError(true))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [teammate.user.id, state.date]);
  if (loading) {
    return <Loader />;
  }
  return (
    <span>{isError ? "Unknown" : teammate.location}</span>
  );
};

export default UserLocationCell;