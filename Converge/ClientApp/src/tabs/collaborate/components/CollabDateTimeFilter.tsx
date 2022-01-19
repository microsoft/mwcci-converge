// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState } from "react";
import {
  FormField, Flex, Provider, SiteVariablesPrepared, Box, DatepickerProps,
} from "@fluentui/react-northstar";
import {
  ArrowRightIcon,
} from "@fluentui/react-icons-northstar";
import { IComboBox, IComboBoxOption } from "@fluentui/react";
import dayjs from "dayjs";
import TimePicker from "../../workspace/components/TimePicker";
import { logEvent } from "../../../utilities/LogWrapper";
import {
  USER_INTERACTION, UISections, UI_SECTION, DESCRIPTION,
} from "../../../types/LoggerTypes";
import { TimePickerChangeHandler, TimePickerContext, TimePickerProvider } from "../../../utilities/TimePickerProvider";
import { useSearchContextProvider } from "../../../providers/SearchProvider";
import DatePickerPrimary from "../../../utilities/datePickerPrimary";
import CollabDateTimeFilterStyles from "../styles/CollabDateTimeFilterStyles";

const CollabDateTimeFilter: React.FC = () => {
  const {
    state,
    setStartTime,
    setEndTime,
    setStartAndEndTime,
  } = useSearchContextProvider();
  const classes = CollabDateTimeFilterStyles();
  const [date, setDate] = useState<Date | undefined>(state.startTime.toDate());

  const dateChangeHandler = (
    event: React.SyntheticEvent, data: (DatepickerProps & { value: Date; }) | undefined,
  ) => {
    logEvent(USER_INTERACTION, [
      { name: UI_SECTION, value: UISections.CollaborationTab },
      { name: DESCRIPTION, value: "change_date_collaboration" },
    ]);
    if (data?.value) {
      setDate(data.value);
      const start = dayjs(`${dayjs(data.value).format("MM-DD-YYYY")} ${state.startTime.format("h:mm A")}`, "MM-DD-YYYY h:mm A");
      const end = dayjs(`${dayjs(data.value).format("MM-DD-YYYY")} ${state.endTime.format("h:mm A")}`, "MM-DD-YYYY h:mm A");
      setStartAndEndTime(start, end);
    }
  };

  const startTimeChangeHandler = (changeHandler: TimePickerChangeHandler) => (
    event: React.FormEvent<IComboBox>,
    option?: IComboBoxOption,
    index?: number,
    value?: string,
  ) => {
    changeHandler(event, option, index, value);
    logEvent(USER_INTERACTION, [
      { name: UI_SECTION, value: UISections.CollaborationTab },
      { name: DESCRIPTION, value: "change_start_time_collaboration" },
    ]);
  };

  const endTimeChangeHandler = (changeHandler: TimePickerChangeHandler) => (
    event: React.FormEvent<IComboBox>,
    option?: IComboBoxOption,
    index?: number,
    value?: string,
  ) => {
    changeHandler(event, option, index, value);
    logEvent(USER_INTERACTION, [
      { name: UI_SECTION, value: UISections.CollaborationTab },
      { name: DESCRIPTION, value: "change_end_time_collaboration" },
    ]);
  };

  const onEndChange = (newEnd: string) => {
    setEndTime(dayjs(`${dayjs(date).format("MM-DD-YYYY")} ${newEnd}`, "MM-DD-YYYY h:mm A"));
  };

  const onStartChange = (newStart: string) => {
    setStartTime(dayjs(`${dayjs(date).format("MM-DD-YYYY")} ${newStart}`, "MM-DD-YYYY h:mm A"));
  };

  return (
    <Flex vAlign="start" hAlign="center">
      <FormField>
        <Box className={classes.datePickerStyles}>
          <Provider
            theme={{
              componentVariables: {
                Button: ({ colorScheme }: SiteVariablesPrepared) => ({
                  color: colorScheme.default.foreground,
                  backgroundColor: colorScheme.default.background,
                  borderRadius: "0",
                }),
                Input: ({ colorScheme }: SiteVariablesPrepared) => ({
                  color: colorScheme.default.foreground,
                  backgroundColor: colorScheme.default.background,
                  borderRadius: "0",
                }),
              },
            }}
          >
            <DatePickerPrimary
              defaultSelectedDate={state.startTime.toDate()}
              onDateChange={dateChangeHandler}
              inverted
            />
          </Provider>
        </Box>
      </FormField>
      <TimePickerProvider
        defaultEnd={state.endTime}
        defaultStart={state.startTime}
        onEndChange={onEndChange}
        onStartChange={onStartChange}
      >
        <TimePickerContext.Consumer>
          {(context) => (
            <>
              <FormField>
                <TimePicker
                  useHour12
                  className={classes.timePickerStyles}
                  onChange={startTimeChangeHandler(context.startTimeChangeHandler)}
                  allowFreeform
                  value={context.start}
                />
              </FormField>
              <ArrowRightIcon outline size="medium" className={classes.arrowRight} />
              <FormField>
                <TimePicker
                  useHour12
                  className={classes.timePickerStyles}
                  allowFreeform
                  defaultValue={state.endTime.toISOString()}
                  onChange={endTimeChangeHandler(context.endTimeChangeHandler)}
                  value={context.end}
                  timeRange={context.endTimeRange}
                  noRoundTimeRange
                />
              </FormField>
            </>
          )}
        </TimePickerContext.Consumer>
      </TimePickerProvider>
    </Flex>
  );
};

export default CollabDateTimeFilter;
