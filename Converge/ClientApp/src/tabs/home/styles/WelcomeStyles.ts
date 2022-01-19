// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { makeStyles } from "@fluentui/react-theme-provider";

const WelcomeStyles = makeStyles(() => ({
  root: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
  },
  getStarted: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    width: "438px",
  },
  remoteText: {
    fontSize: "18px",
  },
  description: {
    fontSize: "14px",
    margin: "0 0 24px 0",
  },
  contentText: {
    fontSize: "14px",
    margin: "0 0 8px 0",
    fontWeight: "bold",
  },
  zipCode: {
    fontSize: "12px",
    argin: "0 0 8px 0",
  },
  zipInput: {
    "& input": {
      width: "104px", height: "32px",
    },
  },
  btnWrapper: {
    display: "flex",
    justifyContent: "flex-end",
    width: "438px",
    "& .ui-form__button": {
      marginLeft: "1em",
    },
  },
  formBtn: {
    width: "96px",
    padding: "0 20px",
  },
  bannerBox: {
    width: "100%",
    height: "445px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    paddingTop: "2em",
  },
  convergeDescription: {
    fontSize: "14px",
    margin: "0 0 32px 0",
  },
  getStartedBtn: {
    width: "280px",
    height: "32px",
  },
}));

export default WelcomeStyles;
