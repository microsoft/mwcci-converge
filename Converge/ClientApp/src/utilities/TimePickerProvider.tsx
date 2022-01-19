// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { createContext, useState } from "react";

import { IComboBox, IComboBoxOption, ITimeRange } from "@fluentui/react";
import dayjs from "dayjs";
import { ceilMinuteToIncrement } from "@fluentui/date-time-utilities";

export type TimePickerChangeHandler = (
  event: React.FormEvent<IComboBox>,
  option?: IComboBoxOption,
  index?: number,
  value?: string,
) => void

interface ITimePickerContext {
  startTimeChangeHandler: TimePickerChangeHandler;
  endTimeChangeHandler: TimePickerChangeHandler;
  start: string;
  end: string;
  endTimeRange: ITimeRange
}

const TimePickerContext = createContext({} as ITimePickerContext);

const convertToDay = (time: string): dayjs.Dayjs => dayjs(`${dayjs(new Date()).format("MM-DD-YYYY")} ${time}`, "MM-DD-YYYY h:mm A");

interface Props {
  defaultStart?: dayjs.Dayjs;
  defaultEnd?: dayjs.Dayjs;
  onStartChange?: (start: string) => void;
  onEndChange?: (end: string) => void;
  onEndTimeRangeChange?: (endTimeRange: ITimeRange) => void;
}

const TimePickerProvider: React.FC<Props> = (props) => {
  const {
    children,
    defaultStart,
    defaultEnd,
    onEndChange,
    onStartChange,
    onEndTimeRangeChange,
  } = props;

  const defaultStartValue = defaultStart || dayjs(ceilMinuteToIncrement(new Date(), 30));
  const defaultEndValue = defaultEnd || defaultStartValue.add(30, "minutes");
  const [start, setStart] = useState<string>(defaultStartValue.format("h:mm A"));
  const [end, setEnd] = useState<string>(defaultEndValue.format("h:mm A"));
  const [endTimeRange, setEndTimeRange] = useState<ITimeRange>(
    { start: defaultStartValue.hour(), end: 23 },
  );

  const startTimeChangeHandler = (
    event: React.FormEvent<IComboBox>,
    option?: IComboBoxOption | undefined,
    index?: number,
    inputValue?: string,
  ) => {
    const selectedValue = inputValue || option?.text;
    if (selectedValue) {
      const prevStart = convertToDay(start);
      const currentStart = convertToDay(selectedValue);
      if (!currentStart.isValid()) {
        return;
      }
      const difference = dayjs.duration(dayjs(currentStart).diff(dayjs(prevStart)));
      let endDay = convertToDay(end);
      if (selectedValue.indexOf("00") === 3 || selectedValue.indexOf("30") === 3) {
        endDay = dayjs(ceilMinuteToIncrement(endDay.toDate(), 30));
      }
      const newEnd = endDay.add(difference).format("h:mm A");
      setEnd(newEnd);
      if (onEndChange) {
        onEndChange(newEnd);
      }
      const newEndTimeRange = { start: currentStart.hour(), end: 23 };
      setEndTimeRange(newEndTimeRange);
      if (onEndTimeRangeChange) {
        onEndTimeRangeChange(newEndTimeRange);
      }
      const newStart = currentStart.format("h:mm A");
      setStart(newStart);
      if (onStartChange) {
        onStartChange(newStart);
      }
    }
  };

  const endTimeChangeHandler = (
    event: React.FormEvent<IComboBox>,
    option?: IComboBoxOption | undefined,
    index?: number,
    inputValue?: string,
  ) => {
    const selectedValue = inputValue || option?.text;
    if (selectedValue) {
      const currentEnd = convertToDay(selectedValue);
      const currentStart = convertToDay(start);
      if (currentEnd.isValid()) {
        const newEnd = currentStart.isBefore(currentEnd) ? currentEnd.format("h:mm A") : currentStart.format("h:mm A");
        setEnd(newEnd);
        if (onEndChange) {
          onEndChange(newEnd);
        }
      }
    }
  };

  return (
    <TimePickerContext.Provider
      value={{
        start,
        end,
        endTimeChangeHandler,
        startTimeChangeHandler,
        endTimeRange,
      }}
    >
      {children}
    </TimePickerContext.Provider>
  );
};

export {
  TimePickerProvider,
  TimePickerContext,
};
