// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState } from "react";
import {
  Box, Button, Form, FormButton, FormLabel, FormField, Input,
} from "@fluentui/react-northstar";
import WelcomeBanner from "./WelcomeBanner";
import { logEvent } from "../../utilities/LogWrapper";
import {
  DESCRIPTION, UISections, UI_SECTION, USER_INTERACTION,
} from "../../types/LoggerTypes";
import InitialLoader from "../../InitialLoader";
import WelcomeStyles from "./styles/WelcomeStyles";

type Props = {
  onZipCodeSubmission: (zipCode: string) => Promise<void>
}

const Welcome: React.FC<Props> = (props) => {
  const [zipCode, setZipCode] = useState("");
  const [getStarted, setGetStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const classes = WelcomeStyles();

  const getStartedCallback = () => {
    setGetStarted(true);
  };

  const descriptiontext1 = "Converge needs to know your most frequent remote work location zipcode to determine office recommendations, commute times, and team collaboration opportunities. ";
  const descriptiontext2 = "Converge doesn't share your exact location. Your teammates will only see that you are remote, at an office, or out of office.";

  return (
    <>
      {
        getStarted ? (
          <Box className={classes.root}>
            {
              loading
                ? (<InitialLoader />)
                : (
                  <Box className={classes.getStarted}>
                    <h1 className={classes.remoteText}>Remote work</h1>
                    <p className={classes.description}>{descriptiontext1}</p>
                    <p className={classes.description}>{descriptiontext2}</p>
                    <Box>
                      <Form
                        onSubmit={() => {
                          setLoading(true);
                          logEvent(USER_INTERACTION, [
                            { name: "didSubmitZipCode", value: (!!zipCode).toString() },
                            { name: UI_SECTION, value: UISections.Welcome },
                            { name: DESCRIPTION, value: "zip_code_submit" },
                          ]);
                          props.onZipCodeSubmission(zipCode).finally(() => setLoading(false));
                        }}
                      >
                        <p className={classes.contentText}>
                          Where are you most likely to work remote from?
                        </p>
                        <FormField>
                          <FormLabel
                            htmlFor="zipcode"
                            id="zipcode"
                            className={classes.zipCode}
                          >
                            Zipcode
                          </FormLabel>
                          <Input
                            inverted
                            name="zipcode"
                            aria-labelledby="zipcode message-id"
                            id="zipcode"
                            type="text"
                            className={classes.zipInput}
                            defaultValue={zipCode}
                            value={zipCode}
                            onChange={(e, inputProps) => {
                              if (inputProps) { setZipCode(inputProps?.value); }
                            }}
                          />
                        </FormField>
                        <Box className={classes.btnWrapper}>
                          <FormButton
                            content="Done"
                            primary
                            className={classes.formBtn}
                            loading={loading}
                          />
                        </Box>
                      </Form>
                    </Box>
                  </Box>
                )
            }
          </Box>
        ) : (
          <Box className={classes.bannerBox}>
            <WelcomeBanner />
            <h1 className={classes.remoteText}>Welcome to Converge! We’re glad you’re here.</h1>
            <p className={classes.convergeDescription}>
              Converge is your tool to make the most out of going into the office.
            </p>
            <Button
              content="Get started"
              primary
              className={classes.getStartedBtn}
              styles={{ padding: "12px 0" }}
              onClick={() => {
                getStartedCallback();
                logEvent(USER_INTERACTION, [
                  { name: UI_SECTION, value: UISections.Welcome },
                  { name: DESCRIPTION, value: "submit_zipcode" },
                ]);
              }}
            />
          </Box>
        )
      }
    </>
  );
};
export default Welcome;
