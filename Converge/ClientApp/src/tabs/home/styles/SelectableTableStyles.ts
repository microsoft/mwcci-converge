// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { makeStyles } from "@fluentui/react-theme-provider";

const SelectableTableStyles = makeStyles(() => ({
  tableRow: {
    "& .ui-table__cell:first-child": {
      flexGrow: 0,
    },
    "& .ui-table__cell:nth-child(2)": {
      marginLeft: "1em",
      minWidth: "20%",
    },
    "& .ui-table__cell:nth-child(5)": {
      minWidth: "43%",
      flexWrap: "wrap",
    },
    "& .ui-table__cell:nth-child(6)": {
      flexDirection: "row-reverse",
      maxWidth: "50px",
    },
  },
  tableCell: {
    "& .ui-table__cell__content, & .ui-table__cell__content > .ui-text": {
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
  },
  emptyList: {
    width: "100%",
    minHeight: "30%",
  },
  starIcon: {
    marginRight: "5px !important",
  },
  teammates: {
    overflow: "auto",
    minHeight: "200px",
    "@media (max-width: 1366px)": {
      height: "auto",
    },
  },
  retryBtn: {
    minWidth: "0px !important",
    marginBottom: "0.2rem",
    textDecoration: "underline",
    color: "rgb(196, 49, 75)",
  },
  loadBtnContainer: {
    width: "100%",
    height: "70px",
    display: "grid",
  },
  loadBtn: {
    margin: "auto",
    fontSize: "small",
    fontWeight: "bold",
    color: "#000 !important",
  },
  textNoMore: {
    margin: "auto",
    fontSize: "small",
    color: "red important",
  },
  tableheight: {
    maxHeight: "67vh",
    "@media (max-width: 1366px)": {
      height: "auto",
    },
  },
}));

export default SelectableTableStyles;
