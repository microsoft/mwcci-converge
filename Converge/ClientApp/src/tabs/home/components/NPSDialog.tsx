// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Button, Dialog, Flex, StarIcon,
} from "@fluentui/react-northstar";
import dayjs from "dayjs";
import React, { useState, useEffect } from "react";
import { useConvergeSettingsContextProvider } from "../../../providers/ConvergeSettingsProvider";

import {
  DESCRIPTION,
  NPS_SCORE, UISections, UI_SECTION, USER_INTERACTION,
} from "../../../types/LoggerTypes";
import { logEvent } from "../../../utilities/LogWrapper";
import NPSDialogStyles from "../styles/NPSDialogStyles";

// NPS is collected once, 14 days after the user starts to use Converge
const NPSDialog: React.FC = () => {
  const {
    convergeSettings,
    setConvergeSettings,
  } = useConvergeSettingsContextProvider();
  const classes = NPSDialogStyles();
  const [starRating, setStarRating] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const confirm = () => {
    setConvergeSettings({
      ...convergeSettings,
      lastNPSDate: dayjs().utc().toISOString(),
    });
    if (starRating) {
      logEvent(USER_INTERACTION, [
        { name: UI_SECTION, value: UISections.NPS },
        { name: NPS_SCORE, value: starRating.toString() },
      ]);
    }
    setIsOpen(false);
  };

  useEffect(() => {
    const convergeInstalledDate = dayjs(convergeSettings?.convergeInstalledDate);
    if (dayjs().isAfter(convergeInstalledDate.add(14, "days"))) {
      if (
        !convergeSettings?.lastNPSDate
        || dayjs(convergeSettings.lastNPSDate).isBefore(convergeInstalledDate.add(14, "days"))
      ) {
        setIsOpen(true);
      }
    }
  }, [convergeSettings?.lastNPSDate]);

  return (
    <Dialog
      open={isOpen}
      onConfirm={confirm}
      confirmButton={{
        content: "Done",
      }}
      content={(
        <Flex column gap="gap.large">
          <span>
            How likely are you to recommend Converge to a friend or colleague?
          </span>
          <div className={classes.buttonWrapper}>
            {[1, 2, 3, 4, 5].map((int) => (
              <Button
                iconOnly
                icon={(
                  <StarIcon
                    size="large"
                    styles={{
                      "> svg": {
                        fill: starRating >= int ? "#333333" : "inherit",
                        "> path.ui-icon__filled": {
                          display: starRating >= int ? "unset" : "none",
                        },
                      },
                    }}
                  />
              )}
                title={`${int} Star Rating`}
                text
                onClick={() => {
                  setStarRating(int);
                  logEvent(USER_INTERACTION, [
                    { name: UI_SECTION, value: UISections.NPS },
                    { name: DESCRIPTION, value: `setStarRating ${int} Star Rating` },
                  ]);
                }}
              />
            ))}
          </div>

        </Flex>
      )}
    />
  );
};

export default NPSDialog;
