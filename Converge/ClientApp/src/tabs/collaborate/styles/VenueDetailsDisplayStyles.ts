// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { makeStyles } from "@fluentui/react-theme-provider";

const VenueDetailsDisplayStyles = makeStyles(() => ({
  contact: {
    padding: "0 24px",
    minHeight: "205px",
    ul: {
      listStyle: "none",
      padding: "24px 0",
      margin: "0",
    },
    "ul > li": {
      listStyle: "none",
      display: "flex",
      marginBottom: "15px",
      fontSize: "14px",
      lineHeight: "16px",
    },
    "ul li:last-child": {
      marginBottom: "0",
    },
    "ul > li > i": {
      marginRight: "11px",
    },
    "ul > li > span": {
      marginRight: "5px",
    },
  },
  ammenitiesTitle: {
    paddingTop: "24px",
  },
  link: {
    color: "#6264A7",
    textDecoration: "none",
    marginLeft: "2px",
  },
  acceptIcon: {
    color: "#237B4B",
    marginRight: "5px",
  },
}));

export default VenueDetailsDisplayStyles;
