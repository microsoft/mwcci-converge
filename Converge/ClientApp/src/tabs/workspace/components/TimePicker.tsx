// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  ComboBox,
  IComboBox,
  IComboBoxOption,
  ITimePickerProps,
  ITimeRange,
  KeyCodes,
} from "@fluentui/react";
import * as React from "react";
import {
  TimeConstants,
  addMinutes,
  formatTimeString,
  ceilMinuteToIncrement,
} from "@fluentui/date-time-utilities";
import { useEffect } from "react";
import dayjs from "dayjs";
import { Box } from "@fluentui/react-northstar";
import { makeStyles } from "@fluentui/react-theme-provider";

const useAppStyles = makeStyles(() => ({
  lightTheme: {
    "& .ms-ComboBox, & .ms-ComboBox input, & .ms-ComboBox input:hover": {
      backgroundColor: "#fff",
      color: "#000",
    },
  },
  transparent: {
    "& .ms-ComboBox, & .ms-ComboBox input, & .ms-ComboBox input:hover": {
      backgroundColor: "#F5F5F5",
      color: "#000",
    },
  },
}));

const convertToDay = (time: string): dayjs.Dayjs => dayjs(`${dayjs(new Date()).format("MM-DD-YYYY")} ${time}`, "MM-DD-YYYY h:mm A");

const TIME_LOWER_BOUND = 0;
const TIME_UPPER_BOUND = 23;

const clampTimeRange = (timeRange: ITimeRange): ITimeRange => ({
  start: Math.min(Math.max(timeRange.start, TIME_LOWER_BOUND), TIME_UPPER_BOUND),
  end: Math.min(Math.max(timeRange.end, TIME_LOWER_BOUND), TIME_UPPER_BOUND),
});

const generateDefaultTime = (
  increments: number,
  timeRange: ITimeRange | undefined,
  noRoundTimeRange: boolean | undefined,
  defaultValue?: string | string[],
  value?: string,
) => {
  let newDefaultTime = new Date();
  if (defaultValue) {
    if (Array.isArray(defaultValue) && defaultValue.length > 0) {
      newDefaultTime = new Date(defaultValue[0]);
    }
    if (!Array.isArray(defaultValue)) {
      newDefaultTime = new Date(defaultValue);
    }
  }
  if (value) {
    newDefaultTime = convertToDay(value).toDate();
  }
  if (timeRange) {
    const clampedTimeRange = clampTimeRange(timeRange);
    newDefaultTime.setHours(clampedTimeRange.start);
  }
  if (noRoundTimeRange) {
    return newDefaultTime;
  }
  return ceilMinuteToIncrement(newDefaultTime, increments);
};

const getDropdownOptionsCount = (increments: number, timeRange: ITimeRange | undefined) => {
  let hoursInRange = TimeConstants.HoursInOneDay;
  if (timeRange) {
    const clampedTimeRange = clampTimeRange(timeRange);
    if (clampedTimeRange.start > clampedTimeRange.end) {
      hoursInRange = TimeConstants.HoursInOneDay - timeRange.start - timeRange.end;
    } else if (timeRange.end > timeRange.start) {
      hoursInRange = timeRange.end - timeRange.start;
    }
  }
  return Math.floor((TimeConstants.MinutesInOneHour * hoursInRange) / increments);
};

interface Props extends ITimePickerProps {
  value: string
  noRoundTimeRange?: boolean
  errorMessage?: string
  transparent?: boolean
}

const TimePicker: React.FunctionComponent<Props> = ({
  label,
  increments = 30,
  showSeconds = false,
  allowFreeform = true,
  useHour12 = false,
  timeRange = { start: 0, end: 0 },
  onFormatDate,
  onChange,
  defaultValue,
  value,
  noRoundTimeRange,
  errorMessage,
  transparent,
  ...rest
}: Props) => {
  const optionsCount = getDropdownOptionsCount(increments, timeRange);
  const classes = useAppStyles();

  const timePickerOptions: IComboBoxOption[] = React.useMemo(() => {
    const optionsList = Array(optionsCount);
    for (let i = 0; i < optionsCount; i += 1) {
      optionsList[i] = 0;
    }
    const defaultTime = generateDefaultTime(
      increments,
      timeRange,
      noRoundTimeRange,
      defaultValue,
      value,
    );

    return optionsList.map((_, index) => {
      const option = addMinutes(defaultTime, increments * index);
      option.setSeconds(0);
      const optionText = onFormatDate
        ? onFormatDate(option)
        : formatTimeString(option, showSeconds, useHour12);
      return {
        key: optionText,
        text: optionText,
      };
    });
  }, [timeRange, increments, optionsCount, showSeconds, onFormatDate, useHour12, value]);

  const [selectedKey, setSelectedKey] = React.useState<string | number | undefined>(
    timePickerOptions[0].key,
  );

  useEffect(() => {
    if (value) {
      const option = timePickerOptions.find((o) => o.key === value);
      if (option) {
        setSelectedKey(option.key);
      }
    }
  }, [value, timePickerOptions]);

  const onInputChange = React.useCallback(
    (
      event: React.FormEvent<IComboBox>,
      option?: IComboBoxOption,
      index?: number,
      inputValue?: string,
    ): void => {
      if (onChange) {
        onChange(event, option, index, inputValue);
      }
    },
    [
      allowFreeform,
      onFormatDate,
      showSeconds,
      useHour12,
      onChange,
    ],
  );

  const evaluatePressedKey = (event: React.KeyboardEvent<IComboBox>) => {
    if (
      !onFormatDate
      // Only permit input of digits, space, colon, A/P/M characters
      && !(
        (event.charCode >= KeyCodes.zero && event.charCode <= KeyCodes.colon)
        || event.charCode === KeyCodes.space
        || event.charCode === KeyCodes.a
        || event.charCode === KeyCodes.m
        || event.charCode === KeyCodes.p
      )
    ) {
      event.preventDefault();
    }
  };

  return (
    <Box className={transparent ? classes.transparent : classes.lightTheme}>
      <ComboBox
      // eslint-disable-next-line react/jsx-props-no-spreading
        {...rest}
        allowFreeform={allowFreeform}
        selectedKey={selectedKey}
        label={label}
        errorMessage={errorMessage}
        options={timePickerOptions}
        onChange={onInputChange}
        text={value}
        onKeyPress={evaluatePressedKey}
      />
    </Box>
  );
};
TimePicker.displayName = "TimePicker";

export default TimePicker;
