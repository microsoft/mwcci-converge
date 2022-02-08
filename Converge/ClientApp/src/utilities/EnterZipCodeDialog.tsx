// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Dialog, Flex, Provider, Box, Input, Label, Text,
} from "@fluentui/react-northstar";
import { CloseIcon } from "@fluentui/react-icons-northstar";
import React, { useState } from "react";
import { makeStyles } from "@fluentui/react-theme-provider";
import { useConvergeSettingsContextProvider } from "../providers/ConvergeSettingsProvider";

const EnterZipcodeStyles = makeStyles(() => ({
  contentWrapper: {
    borderBottom: "1px solid #E6E6E6",
    paddingBottom: "26px",
  },
  description: {
    marginBottom: "16px !important",
    fontSize: "14px",
  },
  location: {
    fontSize: "14px",
    fontWeight: "bold",
    marginBottom: "8px !important",
  },
  locationText: {
    fontSize: "12px",
    marginBottom: "8px !important",
    paddingLeft: 0,
  },
  locationInput: {
    "& input": {
      width: "104px",
      height: "32px",
    },
  },
}));

interface Props {
  setOpen: (open: boolean) => void;
  updateWidgetActions?: (zipCode: string) => void;
  open: boolean;
}

const EnterZipcode: React.FC<Props> = (props) => {
  const { open, setOpen, updateWidgetActions } = props;
  const { convergeSettings, setConvergeSettings } = useConvergeSettingsContextProvider();
  const [zipCode, setZipCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(false);
  const classes = EnterZipcodeStyles();

  const updateConvergeSettings = (newZipCode: string): void => {
    const newSettings = {
      ...convergeSettings,
      zipCode: newZipCode,
    };
    setConvergeSettings(newSettings).then(() => {
      setLoading(false);
      setOpen(false);
    }).catch(() => setErr(true));
    if (updateWidgetActions) {
      updateWidgetActions(newZipCode);
    }
  };

  return (
    <Provider
      theme={{
        componentVariables: {
          Dialog: {
            rootWidth: "612px",
            headerFontSize: "18px",
            height: "320px",
          },
        },
      }}
    >
      <Dialog
        open={open}
        onConfirm={() => {
          if (!zipCode) {
            setErr(true);
          } else {
            setLoading(true);
            updateConvergeSettings(zipCode);
          }
        }}
        confirmButton={{
          content: "Confirm",
          loading,
        }}
        cancelButton="Cancel"
        onOpen={() => setOpen(true)}
        onCancel={() => setOpen(false)}
        content={(
          <Flex column gap="gap.small" className={classes.contentWrapper}>
            <Box as="p" className={classes.description}>
              Converge needs to know your most frequent remote work location zipcode
              to determine office recommendations,
              commute times, and team collaboration opportunities.
            </Box>
            <Box as="p" className={classes.description}>
              {`Converge doesn't share your exact location.
              Your teammates will only see that you are remote,
              at an office, or out of office.`}
            </Box>
            <Box as="h2" className={classes.location}>
              Where are you most likely to work remote from?
            </Box>
            <Label
              color="white"
              content="Zipcode"
              className={classes.locationText}
            />
            <Input
              name="zipcode"
              aria-labelledby="zipcode message-id"
              id="zipcode"
              type="text"
              className={classes.locationInput}
              defaultValue={zipCode}
              value={zipCode}
              onChange={(e, inputProps) => {
                if (inputProps) { setZipCode(inputProps?.value); }
              }}
            />
            {err && (<Text error content="Invalid Zip Code. Please try again." />)}
          </Flex>
      )}
        header="Remote work"
        headerAction={{
          icon: <CloseIcon />,
          title: "Close",
          onClick: () => setOpen(false),
        }}
      />
    </Provider>
  );
};

export default EnterZipcode;
