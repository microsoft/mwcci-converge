// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from "react";
import {
  Box, Button, Alert,
} from "@fluentui/react-northstar";
import {
  InfoIcon,
} from "@fluentui/react-icons-northstar";
import { makeStyles } from "@fluentui/react-theme-provider";
import EnterZipcode from "../../utilities/EnterZipCodeDialog";
import {
  DESCRIPTION, UISections, UI_SECTION, USER_INTERACTION,
} from "../../types/LoggerTypes";
import { logEvent } from "../../utilities/LogWrapper";

const useBannerStyles = makeStyles(() => ({
  root: {
    padding: "1em 1.5em 0",
    color: "#A16114",
  },
  addZipcode: {
    textDecoration: "underline",
    lineHeight: "32px",
    verticalAlign: "baseline !important",
    paddingLeft: "0",
    color: "#A16114 !important",
  },
}));

const UnknownZipcodeAlert: React.FC = () => {
  const classes = useBannerStyles();
  const [open, setOpen] = React.useState<boolean>(false);
  const [hidden, setHidden] = React.useState<boolean>(false);

  return (
    <>
      <Box className={classes.root}>
        <Alert
          warning
          icon={<InfoIcon size="medium" color="#A16114" outline />}
          content={(
            <>
              <span style={{ fontWeight: "normal" }}>{"Your location is appearing as \"Unknown\"."}</span>
              <Button
                content="Add a zipcode"
                text
                size="small"
                color="#A16114"
                className={classes.addZipcode}
                onClick={() => {
                  setOpen(true);
                  logEvent(USER_INTERACTION, [
                    { name: UI_SECTION, value: UISections.UnknownZipCodeAlert },
                    { name: DESCRIPTION, value: "Add a zipcode" },
                  ]);
                }}
              />
            </>
          )}
          dismissible
          dismissAction={{
            "aria-label": "close",
          }}
          styles={{
            fontSize: "12px",
            lineHeight: "32px",
            fontWeight: "normal",
            color: "#A16114",
            display: hidden ? "none" : "flex",
          }}
          onVisibleChange={() => setHidden(true)}
        />
      </Box>
      <EnterZipcode open={open} setOpen={setOpen} />
    </>
  );
};

export default UnknownZipcodeAlert;
