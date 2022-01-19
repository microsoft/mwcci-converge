// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from "react";
import {
  Datepicker, DatepickerProps, Provider, SiteVariablesPrepared, DayOfWeek,
} from "@fluentui/react-northstar";
import { makeStyles } from "@fluentui/react-theme-provider";

const useDatePickerStyles = makeStyles(() => ({
  lightTheme: {
    "& .ui-button": {
      boxShadow: "none",
      border: "none",
      backgroundColor: "#F5F5F5",
      borderRadius: "0 4px 4px 0",
    },
    "& .ui-button:hover": {
      backgroundColor: "#F5F5F5",
      color: "#000",
    },
    "& .ui-input__input": {
      borderRadius: "4px 0 0 4px",
      paddingRight: ".5em",
    },
  },
}));

interface Props {
  defaultSelectedDate?: Date | undefined;
  selectedDate?: Date;
  onDateChange?:
  (event: React.SyntheticEvent, data: (DatepickerProps & { value: Date; }) | undefined,) => void;
  disabled? : boolean;
  inverted? : boolean;
}

const DatePickerPrimary: React.FC<Props> = (props) => {
  const {
    defaultSelectedDate, onDateChange, disabled, inverted,
    selectedDate,
  } = props;
  const classes = useDatePickerStyles();
  const customFormatter: (date: Date) => string = (date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  return (
    <Provider
      theme={{
        componentVariables: {
          Button: ({ colorScheme }: SiteVariablesPrepared) => ({
            color: colorScheme.default.foreground,
            backgroundColor: colorScheme.default.background,
          }),
        },
      }}
    >
      <Datepicker
        selectedDate={selectedDate}
        defaultSelectedDate={defaultSelectedDate}
        className={classes.lightTheme}
        styles={{
          "& .ui-button": {
            backgroundColor: inverted ? "#fff" : "#F5F5F5",
          },
          "& .ui-button:hover": {
            backgroundColor: inverted ? "#fff" : "#F5F5F5",
          },
        }}
        onDateChange={onDateChange}
        disabled={disabled}
        minDate={new Date()}
        firstDayOfWeek={DayOfWeek.Sunday}
        formatMonthDayYear={customFormatter}
      />
    </Provider>
  );
};

export default DatePickerPrimary;
