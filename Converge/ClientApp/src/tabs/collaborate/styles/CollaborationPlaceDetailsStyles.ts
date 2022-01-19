// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { makeStyles } from "@fluentui/react-theme-provider";

const CollaborationPlaceDetailsStyles = makeStyles(() => ({
  panel: {
    "& .ms-Panel-main": {
      position: "fixed",
      left: "490px",
      top: "80px",
      width: "480px",
      height: "100%",
      padding: "20px 4px 20px 0",
      backgroundColor: "#F5F5F5",
      opacity: ".95",
      boxShadow: "none",
    },
    "& .ms-Panel-scrollableContent::-webkit-scrollbar-track": {
      boxShadow: "inset 0 0 6px rgba(0,0,0,0.1)",
      backgroundColor: "#F5F5F5",
      borderRadius: "6px",
    },
    "& .ms-Panel-scrollableContent::-webkit-scrollbar": {
      width: "6px",
      backgroundColor: "#F5F5F5",
    },
    "& .ms-Panel-scrollableContent::-webkit-scrollbar-thumb": {
      borderRadius: "6px",
      boxShadow: "inset 0 0 6px rgba(0,0,0,.3)",
      backgroundColor: "#C4C4C4",
    },
    "& .ms-Panel-commands": {
      marginTop: 0,
    },
    "& .ms-Panel-navigation": {
      position: "absolute",
      top: "25px",
      right: "25px",
      zIndex: "1000",
    },
    "& .ms-Panel-navigation button i": {
      fontSize: "16px",
      fontWeight: "bold",
    },
    "& .ms-Panel-navigation button": {
      borderRadius: "50%",
      color: "#fff",
      backgroundColor: "#000",
    },
  },
}));

export default CollaborationPlaceDetailsStyles;
