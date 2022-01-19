// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useEffect, useState } from "react";
import {
  FormField, FormLabel, DatepickerProps, Box,
} from "@fluentui/react-northstar";
import { IComboBox, IComboBoxOption } from "@fluentui/react";
import dayjs from "dayjs";
import { useProvider as PlaceProvider } from "../../../providers/PlaceFilterProvider";
import TimePicker from "./TimePicker";
import { logEvent } from "../../../utilities/LogWrapper";
import {
  USER_INTERACTION, UISections, UI_SECTION, DESCRIPTION,
} from "../../../types/LoggerTypes";
import { TimePickerChangeHandler, TimePickerContext, TimePickerProvider } from "../../../utilities/TimePickerProvider";
import DatePickerPrimary from "../../../utilities/datePickerPrimary";
import DateTimeFilterStyles from "../styles/DateTimeFilterStyles";

const DateTimeFilter: React.FC = () => {
  const {
    updateStartDate, updateEndDate, updateStartAndEndDate, state,
  } = PlaceProvider();
  const classes = DateTimeFilterStyles();
  const [date, setDate] = useState<Date | undefined>(state.startDate.toDate() ?? new Date());

  const handleDateChange = (
    event: React.SyntheticEvent, data: (DatepickerProps & { value: Date; }) | undefined,
  ) => {
    setDate(data?.value);
    logEvent(USER_INTERACTION, [
      { name: UI_SECTION, value: UISections.PlaceSearch },
      { name: DESCRIPTION, value: "date_change" },
    ]);
    updateStartAndEndDate(
      dayjs(`${dayjs(data?.value).format("MM-DD-YYYY")} ${state.startDate?.format("h:mm A")}`, "MM-DD-YYYY h:mm A"),
      dayjs(`${dayjs(data?.value).format("MM-DD-YYYY")} ${state.endDate?.format("h:mm A")}`, "MM-DD-YYYY h:mm A"),
    );
  };

  const handleStartTimeChange = (changeHandler: TimePickerChangeHandler) => (
    event: React.FormEvent<IComboBox>,
    option?: IComboBoxOption,
    index?: number,
    value?: string,
  ) => {
    changeHandler(event, option, index, value);
    logEvent(USER_INTERACTION, [
      { name: UI_SECTION, value: UISections.PlaceSearch },
      { name: DESCRIPTION, value: "start_time_change" },
    ]);
  };

  const handleEndTimeChange = (changeHandler: TimePickerChangeHandler) => (
    event: React.FormEvent<IComboBox>,
    option?: IComboBoxOption,
    index?: number,
    value?: string,
  ) => {
    changeHandler(event, option, index, value);
    logEvent(USER_INTERACTION, [
      { name: UI_SECTION, value: UISections.PlaceSearch },
      { name: DESCRIPTION, value: "end_time_change" },
    ]);
  };

  const onEndChange = (newEnd: string) => {
    updateEndDate(dayjs(`${dayjs(date).format("MM-DD-YYYY")} ${newEnd}`, "MM-DD-YYYY h:mm A"));
  };

  const onStartChange = (newStart: string) => {
    updateStartDate(dayjs(`${dayjs(date).format("MM-DD-YYYY")} ${newStart}`, "MM-DD-YYYY h:mm A"));
  };

  useEffect(() => {
    if (date?.valueOf() !== state.startDate.toDate().valueOf()) {
      setDate(state.startDate.toDate());
    }
  }, [state.startDate]);

  return (
    <>
      <FormField>
        <FormLabel htmlFor="location" id="location" className={classes.formLabel}>
          Date
        </FormLabel>
        <Box className={classes.datePickerStyles}>
          <DatePickerPrimary
            selectedDate={date}
            defaultSelectedDate={date}
            onDateChange={handleDateChange}

          />
        </Box>
      </FormField>
      <TimePickerProvider
        onStartChange={onStartChange}
        onEndChange={onEndChange}
        defaultEnd={state.endDate}
        defaultStart={state.startDate}
      >
        <TimePickerContext.Consumer>
          {(context) => (
            <>
              <FormField>
                <FormLabel htmlFor="location" id="location" className={classes.formLabel}>
                  Start time
                </FormLabel>
                <TimePicker
                  useHour12
                  className={classes.timePickerStyles}
                  onChange={handleStartTimeChange(context.startTimeChangeHandler)}
                  allowFreeform
                  value={context.start}
                  transparent
                />
              </FormField>
              <FormField>
                <FormLabel htmlFor="location" id="location" className={classes.formLabel}>
                  End time
                </FormLabel>
                <TimePicker
                  useHour12
                  className={classes.timePickerStyles}
                  onChange={handleEndTimeChange(context.endTimeChangeHandler)}
                  allowFreeform
                  value={context.end}
                  timeRange={context.endTimeRange}
                  noRoundTimeRange
                  transparent
                />
              </FormField>
            </>
          )}
        </TimePickerContext.Consumer>
      </TimePickerProvider>
    </>
  );
};

export default DateTimeFilter;
