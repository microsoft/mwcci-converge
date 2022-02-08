// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from "react";
import {
  Button, Flex, Text,
} from "@fluentui/react-northstar";
import { LikeIcon } from "@fluentui/react-icons-northstar";
import { makeStyles } from "@fluentui/react-theme-provider";
import {
  DESCRIPTION,
  UI_SECTION,
  USER_INTERACTION,
} from "../types/LoggerTypes";
import { useConvergeSettingsContextProvider } from "../providers/ConvergeSettingsProvider";
import { logEvent } from "./LogWrapper";
import { useApiProvider } from "../providers/ApiProvider";

const useIsThisHelpfulStyles = makeStyles(() => ({
  root: {
    marginTop: "1em",
  },
  desc: {
    fontSize: "12px",
  },
}));

type ILog = {
  logId: string;
  sectionName: string;
};

const IsThisHelpful: React.FC<ILog> = (props) => {
  const { sectionName } = props;
  const classes = useIsThisHelpfulStyles();
  const {
    convergeSettings,
    setConvergeSettings,
  } = useConvergeSettingsContextProvider();
  const {
    meService,
  } = useApiProvider();

  const likeSection = () => {
    const didLike = convergeSettings?.likedSections?.includes(sectionName) || false;
    const didDislike = convergeSettings?.dislikedSections?.includes(sectionName) || false;
    let newLikedSections = (convergeSettings?.likedSections || [])
      .filter((s) => s !== sectionName);
    let newDislikedSections = convergeSettings?.dislikedSections || [];
    if (!didLike) {
      newLikedSections = newLikedSections.concat([sectionName]);
      if (didDislike) {
        newDislikedSections = newDislikedSections.filter((s) => s !== sectionName);
      }
    }
    const newSettings = {
      ...convergeSettings,
      likedSections: newLikedSections,
      dislikedSections: newDislikedSections,
    };
    setConvergeSettings(newSettings);
  };

  const dislikeSection = () => {
    const didDislike = convergeSettings?.dislikedSections?.includes(sectionName) || false;
    const didLike = convergeSettings?.likedSections?.includes(sectionName) || false;
    let newDislikedSections = (convergeSettings?.dislikedSections || [])
      .filter((s) => s !== sectionName);
    let newLikedSections = convergeSettings?.likedSections || [];
    if (!didDislike) {
      newDislikedSections = newDislikedSections.concat([sectionName]);
      if (didLike) {
        newLikedSections = newLikedSections.filter((s) => s !== sectionName);
      }
    }
    const newSettings = {
      ...convergeSettings,
      likedSections: newLikedSections,
      dislikedSections: newDislikedSections,
    };
    meService.setSettings(newSettings);
    setConvergeSettings(newSettings);
  };
  const likeIsTrue = convergeSettings?.likedSections?.includes(sectionName) || false;
  const dislikeIsTrue = convergeSettings?.dislikedSections?.includes(sectionName) || false;
  return (
    <Flex
      hAlign="start"
      vAlign="center"
      className={classes.root}
    >
      <Text as="span" color="#000" className={classes.desc}> Is this helpful?</Text>
      <Button
        icon={(
          <LikeIcon
            size="medium"
            styles={{
              "> svg": {
                stroke: "#999",
                fill: "#999",
                "> path.ui-icon__filled": {
                  display: likeIsTrue ? "unset" : "none",
                },
              },
            }}
          />
        )}
        text
        iconOnly
        title="Like"
        onClick={() => {
          likeSection();
          logEvent(USER_INTERACTION, [
            { name: UI_SECTION, value: sectionName },
            !likeIsTrue ? { name: "IsThisHelpful", value: "true" } : { name: "IsThisHelpful", value: "neutral" },
            { name: DESCRIPTION, value: "is_this_helpful_like" },
          ]);
        }}
      />
      <Button
        icon={(
          <LikeIcon
            size="medium"
            styles={{
              "> svg": {
                stroke: "#999",
                fill: "#999",
                "> path.ui-icon__filled": {
                  display: dislikeIsTrue ? "unset" : "none",
                },
              },
            }}
          />
        )}
        text
        iconOnly
        title="Dislike"
        styles={{ transform: "scaleY(-1)" }}
        onClick={() => {
          dislikeSection();
          logEvent(USER_INTERACTION, [
            { name: UI_SECTION, value: sectionName },
            !dislikeIsTrue ? { name: "IsThisHelpful", value: "false" } : { name: "IsThisHelpful", value: "neutral" },
            { name: DESCRIPTION, value: "is_this_helpful_dislike" },
          ]);
        }}
      />
    </Flex>
  );
};

export default IsThisHelpful;
