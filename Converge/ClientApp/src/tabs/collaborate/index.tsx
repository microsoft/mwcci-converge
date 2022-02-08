// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useEffect, useState } from "react";
import { Grid, Box, Loader } from "@fluentui/react-northstar";
import dayjs from "dayjs";
import { User } from "@microsoft/microsoft-graph-types";
import CollaborateFurther from "./components/CollaborateFurther";
import CollaborateHeader from "./CollaborateHeader";
import Map from "./components/Map";
import { useSearchContextProvider } from "../../providers/SearchProvider";
import { deserializeSubEntityId } from "../../utilities/deepLink";
import { MapProvider } from "../../providers/MapProvider";
import useRecord from "../../hooks/useRecord";
import { useTeamsContext } from "../../providers/TeamsContextProvider";
import { useApiProvider } from "../../providers/ApiProvider";

const Collaborate: React.FC = () => {
  const { userService } = useApiProvider();
  const [loading, setLoading] = useState<boolean>(true);
  const {
    setStartTime,
    setEndTime,
    setSelectedUsers,
  } = useSearchContextProvider();
  const [userRecord, updateUserRecord] = useRecord<User>();
  const [usersMissingCoordinates, setUsersMissingCoordinates] = useState<User[]>([]);
  const { teamsContext } = useTeamsContext();

  const getSelectedUsers = async (userPrincipalNames: string[]) => {
    const cacheMisses: string[] = [];
    const cachedUsers = userPrincipalNames.filter((name) => {
      const inCache = !!userRecord[name];
      if (!inCache) cacheMisses.push(name);
      return inCache;
    }).map((name) => userRecord[name]);
    const su = await Promise.all(cacheMisses.map(userService.getCollaborator));

    // Add new users to cache
    su.filter((user) => !!user.userPrincipalName)
      .forEach((user) => updateUserRecord(user.userPrincipalName as string, user));

    setSelectedUsers([...cachedUsers, ...su]);
    setLoading(false);
  };
  useEffect(() => {
    let isLoadingUsers = false;
    if (teamsContext?.subEntityId) {
      const subEntityId = deserializeSubEntityId(teamsContext.subEntityId);
      Object.keys(subEntityId).forEach((key) => {
        if (key === "start") {
          setStartTime(dayjs(subEntityId[key]));
        }
        if (key === "end") {
          setEndTime(dayjs(subEntityId[key]));
        }
        if (key === "users") {
          isLoadingUsers = true;
          const userPrincipalNames = subEntityId[key].split("!");

          getSelectedUsers(userPrincipalNames);
        }
      });
    }
    if (!isLoadingUsers) {
      setLoading(false);
    }
  }, []);
  if (loading) {
    return <Loader />;
  }
  return (
    <MapProvider>
      <Box>
        <CollaborateHeader usersMissingCoordinates={usersMissingCoordinates} />
        <Grid
          styles={{
            padding: "0 0 1em 1.5em",
            gridTemplateColumns: "490px 1fr",
            height: "calc(100vh - 85px)",
            overflowY: "clip",
            gridTemplateAreas:
      "'CollaborateFurther Map'",
            "@media (max-width: 968px)": {
              width: "100%",
              padding: "0 1.5em 1.5em 0",
              gridTemplateColumns: "1fr",
              "grid-template-areas": `'CollaborateFurther'
        'Map'`,
            },
            gridGap: "8px",
          }}
          content={[
            <CollaborateFurther key="CollaborateFurther" />,
            <Map
              userRecord={userRecord}
              updateUserRecord={updateUserRecord}
              key="Map"
              setUsersMissingCoordinates={setUsersMissingCoordinates}
            />,
          ]}
        />
      </Box>
    </MapProvider>

  );
};

export default Collaborate;
