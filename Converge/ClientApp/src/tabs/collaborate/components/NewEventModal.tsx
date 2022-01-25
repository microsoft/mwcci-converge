// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useEffect, useState } from "react";
import debounce from "lodash/debounce";
import {
  Box,
  Checkbox,
  Form,
  FormField,
  FormLabel,
  TextArea,
  Flex,
  Dropdown,
  Input,
  DatepickerProps,
  CheckboxProps,
  DropdownProps,
  Alert,
  TextAreaProps,
} from "@fluentui/react-northstar";
import {
  ArrowRightIcon, ErrorIcon,
} from "@fluentui/react-icons-northstar";
import * as MicrosoftGraph from "@microsoft/microsoft-graph-types";
import dayjs, { Dayjs } from "dayjs";
import { IComboBox, IComboBoxOption } from "@fluentui/react";
import TimePicker from "../../workspace/components/TimePicker";
import { TimePickerChangeHandler, TimePickerContext, TimePickerProvider } from "../../../utilities/TimePickerProvider";
import { logEvent } from "../../../utilities/LogWrapper";
import {
  DESCRIPTION, UISections, UI_SECTION, USER_INTERACTION,
} from "../../../types/LoggerTypes";
import DatePickerPrimary from "../../../utilities/datePickerPrimary";
import NewEventModalStyles from "../styles/NewEventModalStyles";
import { useApiProvider } from "../../../providers/ApiProvider";

type Props = {
  attendees: MicrosoftGraph.User[];
  setAttendees: (attendees: MicrosoftGraph.User[]) => void;
  date: Date;
  setDate: (date: Date) => void;
  start: Dayjs;
  setStart: (start: Dayjs) => void;
  end: Dayjs;
  setEnd: (end: Dayjs) => void;
  isAllDay: boolean;
  setIsAllDay: (isAllDay: boolean) => void;
  includeFood?: boolean;
  dialogTitle: JSX.Element;
  subject: string;
  setSubject: (subject: string) => void;
  message: string;
  setMessage: (message: string) => void;
  err?: string;
};

const NewEventModal: React.FC<Props> = (props) => {
  const {
    dialogTitle,
    start,
    setStart,
    end,
    setEnd,
    setAttendees,
    attendees,
    date,
    setDate,
    isAllDay,
    setIsAllDay,
    subject,
    setSubject,
    message,
    setMessage,
    err,
  } = props;
  const { userService } = useApiProvider();
  const classes = NewEventModalStyles();
  const [attendeesLoading, setAttendeesLoading] = useState<boolean>(false);
  const [attendeeItems, setAttendeeItems] = useState<string[]>([]);
  const [fullUserData, setFullUserData] = useState<MicrosoftGraph.User[]>([]);
  const [count, setCount] = useState<number | undefined>(250);

  const handleDateChange = (
    event: React.SyntheticEvent, data: (DatepickerProps & { value: Date; }) | undefined,
  ) => {
    logEvent(USER_INTERACTION, [
      { name: UI_SECTION, value: UISections.NewEventModal },
      { name: DESCRIPTION, value: "change_date" },
    ]);
    if (data?.value) {
      setDate(data.value as Date);
      setStart(dayjs(data.value).set("hours", start.hour()).set("minutes", start.minute()));
      setEnd(dayjs(data.value).set("hours", end.hour()).set("minutes", end.minute()));
    }
  };

  const onAllDayChange = (event: React.SyntheticEvent<HTMLElement>, data?: (Omit<CheckboxProps, "checked"> & { checked: boolean; })) => {
    logEvent(USER_INTERACTION, [
      { name: UI_SECTION, value: UISections.NewEventModal },
      { name: DESCRIPTION, value: "change_all_day" },
    ]);
    setIsAllDay(data?.checked || false);
  };

  const startTimeChangeHandler = (changeHandler: TimePickerChangeHandler) => (
    event: React.FormEvent<IComboBox>,
    option?: IComboBoxOption,
    index?: number,
    value?: string,
  ) => {
    changeHandler(event, option, index, value);
    logEvent(USER_INTERACTION, [
      { name: UI_SECTION, value: UISections.NewEventModal },
      { name: DESCRIPTION, value: "change_start_time" },
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
      { name: UI_SECTION, value: UISections.NewEventModal },
      { name: DESCRIPTION, value: "end_time_change" },
    ]);
  };

  const onEndChange = (newEnd: string) => {
    setEnd(dayjs(`${dayjs(date).format("MM-DD-YYYY")} ${newEnd}`, "MM-DD-YYYY h:mm A"));
  };

  const onStartChange = (newStart: string) => {
    setStart(dayjs(`${dayjs(date).format("MM-DD-YYYY")} ${newStart}`, "MM-DD-YYYY h:mm A"));
  };

  useEffect(() => {
    if (attendees?.length) {
      const newFullUserData = [...fullUserData];
      attendees.forEach((user) => {
        const dropdownUser = fullUserData.find((u) => u.displayName === user.displayName);
        if (!dropdownUser) {
          newFullUserData.push(user);
        }
        setFullUserData(newFullUserData);
      });
    }
  }, [attendees]);

  const onAttendeesChange = (
    event: React.MouseEvent | React.KeyboardEvent | null,
    data: DropdownProps,
  ) => {
    if (data?.value) {
      const newAttendees = data.value as MicrosoftGraph.User[];
      setAttendees(newAttendees
        .map((a) => fullUserData.find((u) => u.displayName === a) as MicrosoftGraph.User)
        .filter((a) => !!a));
    } else {
      setAttendees([]);
    }
  };

  const onSearchQueryChange = (
    event: React.MouseEvent | React.KeyboardEvent | null,
    data: DropdownProps,
  ) => {
    if (data?.searchQuery) {
      setAttendeesLoading(true);
      userService.searchUsers(data.searchQuery.toString())
        .then((response) => {
          setAttendeeItems(
            response.users
              .filter((u) => !!u.displayName)
              .map((u) => u.displayName as string),
          );
          setFullUserData(fullUserData.concat(response.users));
        })
        .finally(() => setAttendeesLoading(false));
    } else {
      setAttendeeItems([]);
    }
    logEvent(USER_INTERACTION, [
      { name: UI_SECTION, value: UISections.NewEventModal },
      { name: DESCRIPTION, value: "search_attendees" },
    ]);
  };

  let startDay = start;
  let endDay = end;
  if (isAllDay) {
    startDay = dayjs(date);
    endDay = dayjs(startDay).add(1, "day");
  }
  const lengthOfEvent = dayjs.duration(endDay.diff(startDay)).humanize();

  const setMessageCallback = (event: React.SyntheticEvent<HTMLElement, Event>,
    data: TextAreaProps | undefined) => {
    const charLeft = data?.value?.length ? 250 - data?.value?.length : 250;
    setCount(charLeft);
    setMessage(data?.value || "");
  };

  return (
    <Form>
      {err && <Alert danger icon={<ErrorIcon />} content={err} />}
      <Box className={classes.root}>
        <Box className={classes.header}>
          {dialogTitle}
        </Box>
        <Box>
          <FormField>
            <FormLabel htmlFor="Attendees" id="Attendees" className={classes.formLabel}>
              Attendees
            </FormLabel>
            <Dropdown
              search
              multiple
              onSearchQueryChange={debounce(onSearchQueryChange, 1000)}
              loading={attendeesLoading}
              loadingMessage="Loading..."
              items={attendeeItems}
              value={attendees.map((a) => a.displayName)}
              onChange={onAttendeesChange}
              noResultsMessage="We couldn't find any matches."
              aria-labelledby="Attendees"
              placeholder="Add attendees"
              fluid
              className={classes.attendees}
            />
          </FormField>
        </Box>
        <Box />
        <Box className={classes.timeWrapper}>
          <FormField>
            <FormLabel htmlFor="date" id="date" className={classes.formLabel}>
              Date
            </FormLabel>
            <Box className={classes.datePickerStyles}>
              <DatePickerPrimary
                defaultSelectedDate={date}
                onDateChange={handleDateChange}
              />
            </Box>
          </FormField>
          <TimePickerProvider
            defaultEnd={end}
            defaultStart={start}
            onEndChange={onEndChange}
            onStartChange={onStartChange}
          >
            <TimePickerContext.Consumer>
              {(context) => (
                <>
                  <FormField>
                    <FormLabel htmlFor="startTime" id="startTime" className={classes.formLabel}>
                      Start time
                    </FormLabel>
                    <TimePicker
                      useHour12
                      className={classes.timePickerStyles}
                      allowFreeform
                      onChange={startTimeChangeHandler(context.startTimeChangeHandler)}
                      value={context.start}
                      disabled={isAllDay}
                      transparent
                    />
                  </FormField>
                  <ArrowRightIcon outline size="medium" className={classes.arrowRight} />
                  <FormField>
                    <FormLabel htmlFor="endTime" id="endTime" className={classes.formLabel}>
                      End time
                    </FormLabel>
                    <TimePicker
                      useHour12
                      className={classes.timePickerStyles}
                      allowFreeform
                      onChange={endTimeChangeHandler(context.endTimeChangeHandler)}
                      value={context.end}
                      timeRange={context.endTimeRange}
                      noRoundTimeRange
                      disabled={isAllDay}
                      transparent
                    />
                  </FormField>
                </>
              )}
            </TimePickerContext.Consumer>
          </TimePickerProvider>
          <span className={classes.icon}>
            {lengthOfEvent}
          </span>
          <Checkbox
            label="All day"
            toggle
            className={classes.checkBox}
            variables={{ rootPadding: "1.5em 0 0 0" }}
            onChange={onAllDayChange}
          />
        </Box>
        <Box>
          <FormField>
            <FormLabel htmlFor="Title" id="Title" className={classes.formLabel}>
              Title (optional)
            </FormLabel>
            <Input
              name="Title"
              id="Title"
              fluid
              placeholder="Add a title"
              onChange={((event, data) => setSubject(data?.value || ""))}
              value={subject}
            />
          </FormField>
        </Box>
        <Box>
          <FormField>
            <Flex space="between">
              <FormLabel htmlFor="Message" id="Message" className={classes.formLabel}>
                Message (optional)
              </FormLabel>
              <span className={classes.formLabel}>
                {`${count} characters`}
              </span>
            </Flex>
            <TextArea
              fluid
              variables={{ height: "96px" }}
              placeholder="Include a message to attendees"
              maxLength={250}
              onChange={((event, data) => setMessageCallback(event, data))}
              value={message}
            />
          </FormField>
        </Box>
      </Box>
    </Form>
  );
};

export default NewEventModal;
