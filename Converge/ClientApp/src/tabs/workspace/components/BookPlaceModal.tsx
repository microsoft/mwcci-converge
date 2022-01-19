// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, useEffect } from "react";
import {
  Box, Checkbox, Flex, CheckboxProps, DatepickerProps, Alert, Divider, Loader,
} from "@fluentui/react-northstar";
import {
  ArrowRightIcon, ErrorIcon,
} from "@fluentui/react-icons-northstar";
import { Icon } from "office-ui-fabric-react/lib/Icon";
import dayjs, { Dayjs } from "dayjs";
import { IComboBox, IComboBoxOption } from "@fluentui/react";
import TimePicker from "./TimePicker";
import PlaceCarousel from "./PlaceCarousel";
import ExchangePlace, { PhotoType, PlaceType } from "../../../types/ExchangePlace";
import getPlaceMaxReserved, { getRoomAvailability } from "../../../api/placeService";
import { logEvent } from "../../../utilities/LogWrapper";
import {
  USER_INTERACTION, UISections, UI_SECTION, DESCRIPTION, IMPORTANT_ACTION, ImportantActions,
} from "../../../types/LoggerTypes";
import { TimePickerChangeHandler, TimePickerContext, TimePickerProvider } from "../../../utilities/TimePickerProvider";
import DatePickerPrimary from "../../../utilities/datePickerPrimary";
import PlaceAmmenities from "./PlaceAmmenities";
import BookPlaceModalStyles from "../styles/BookPlaceModalStyles";
import { usePlacePhotos } from "../../../providers/PlacePhotosProvider";
import { useConvergeSettingsContextProvider } from "../../../providers/ConvergeSettingsProvider";
import { setSettings } from "../../../api/meService";

type Props = {
  place: ExchangePlace,
  setBookable: (bookable: boolean) => void;
  bookable: boolean;
  buildingName: string | undefined;
  err?: string;
  start: Dayjs;
  end: Dayjs;
  setStart: (start: Dayjs) => void;
  setEnd: (end: Dayjs) => void;
  isAllDay: boolean;
  setIsAllDay: (isAllDay: boolean) => void;
  isFlexible?: boolean;
};

const BookPlaceModal: React.FC<Props> = (props) => {
  const {
    place,
    bookable,
    setBookable,
    buildingName,
    err,
    start,
    end,
    setStart,
    setEnd,
    isAllDay,
    setIsAllDay,
    isFlexible,
  } = props;
  const [maxReserved, setMaxReserved] = useState<number>(0);
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [,
    placePhotos,,
    getPlacePhotos,
  ] = usePlacePhotos();
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
  const [floorPlanUrl, setFloorPlanUrl] = useState<string | undefined>(undefined);
  const [otherPhotos, setOtherPhotos] = useState<string[]>([]);
  const classes = BookPlaceModalStyles();
  const isWorkspace = place.type === PlaceType.Space;
  const { convergeSettings, setConvergeSettings } = useConvergeSettingsContextProvider();
  const [favoriteCheckBoxLoading, setFavoriteCheckBoxLoading] = useState<boolean>(false);

  const IsFavoritePlace = (placeUpn: string): boolean => {
    if (convergeSettings?.favoriteCampusesToCollaborate?.includes(placeUpn)) {
      return true;
    }
    return false;
  };

  const LABEL_ADD_FAVORITE = "Add to favorites";
  const LABEL_REMOVE_FAVORITE = "Remove from favorites";
  const DetermineFavoritesLabel = (placeUpn: string): string => {
    if (IsFavoritePlace(placeUpn)) {
      return LABEL_REMOVE_FAVORITE;
    }
    return LABEL_ADD_FAVORITE;
  };

  const [favoriteCheckBoxLabel,
    setFavoriteCheckBoxLabel] = useState<string>(DetermineFavoritesLabel(place.identity));
  const [favoriteCheckBoxChecked,
    setFavoriteCheckBoxChecked] = useState<boolean>(IsFavoritePlace(place.identity));

  const onAllDayChange = (event: React.SyntheticEvent<HTMLElement>, data?: (Omit<CheckboxProps, "checked"> & { checked: boolean; })) => {
    logEvent(USER_INTERACTION, [
      { name: UI_SECTION, value: UISections.BookPlaceModal },
      { name: DESCRIPTION, value: "all_day_change" },
    ]);
    setIsAllDay(!!data?.checked);
  };

  const handleDateChange = (
    event: React.SyntheticEvent, data: (DatepickerProps & { value: Date; }) | undefined,
  ) => {
    logEvent(USER_INTERACTION, [
      { name: UI_SECTION, value: UISections.BookPlaceModal },
      { name: DESCRIPTION, value: "date_change" },
    ]);
    setStart(dayjs(data?.value));
    if (data?.value) {
      setStart(dayjs(`${dayjs(data.value).format("MM-DD-YYYY")} ${start.format("h:mm A")}`, "MM-DD-YYYY h:mm A"));
      setEnd(dayjs(`${dayjs(data.value).format("MM-DD-YYYY")} ${end.format("h:mm A")}`, "MM-DD-YYYY h:mm A"));
    }
  };

  const handleStartTimeChange = (changeHandler: TimePickerChangeHandler) => (
    event: React.FormEvent<IComboBox>,
    option?: IComboBoxOption,
    index?: number,
    value?: string,
  ) => {
    changeHandler(event, option, index, value);
    logEvent(USER_INTERACTION, [
      { name: UI_SECTION, value: UISections.BookPlaceModal },
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
      { name: UI_SECTION, value: UISections.BookPlaceModal },
      { name: DESCRIPTION, value: "end_time_change" },
    ]);
  };

  const onEndChange = (newEnd: string) => {
    setEnd(dayjs(`${dayjs(start).format("MM-DD-YYYY")} ${newEnd}`, "MM-DD-YYYY h:mm A"));
  };

  const onStartChange = (newStart: string) => {
    setStart(dayjs(`${dayjs(start).format("MM-DD-YYYY")} ${newStart}`, "MM-DD-YYYY h:mm A"));
  };

  useEffect(() => {
    let startDay = start.format("MM-DD-YYYY");
    let endDay = end.format("MM-DD-YYYY");
    if (isAllDay) {
      startDay = dayjs(start).format("MM-DD-YYYY");
      endDay = dayjs(startDay).add(1, "day").format("MM-DD-YYYY");
    }
    if (place.type === PlaceType.Space) {
      if (start.utc().toISOString() <= end.utc().toISOString()) {
        getPlaceMaxReserved(
          place.identity,
          dayjs(startDay).utc().toISOString(),
          dayjs(endDay).utc().toISOString(),
        ).then(setMaxReserved);
      }
    } else if (start.utc().toISOString() <= end.utc().toISOString()) {
      getRoomAvailability(
        place.identity,
        dayjs(startDay).utc().toISOString(),
        dayjs(endDay).utc().toISOString(),
      ).then(setIsAvailable);
    }
  }, [isAllDay, start, end]);

  useEffect(() => {
    if (placePhotos && placePhotos.length === 1) {
      const cover = placePhotos[0].photos.find((p) => p.photoType === PhotoType.Cover);
      const floorPlan = placePhotos[0].photos.find((p) => p.photoType === PhotoType.FloorPlan);
      const allOtherPhotos = placePhotos[0].photos.filter(
        (p) => p.photoType !== PhotoType.FloorPlan && p.photoType !== PhotoType.Cover,
      ).map((p) => p.url);

      if (cover) {
        setPhotoUrl(cover.url);
      }
      if (floorPlan) {
        setFloorPlanUrl(floorPlan.url);
      }
      if (allOtherPhotos.length) {
        setOtherPhotos(allOtherPhotos);
      }
    }
  }, [placePhotos]);

  useEffect(() => {
    if (place.sharePointID) {
      getPlacePhotos([place.sharePointID]);
    }
  }, [place.sharePointID]);

  useEffect(() => {
    let isBookable = false;
    if (isWorkspace) {
      isBookable = place.capacity - maxReserved > 0;
    } else {
      isBookable = isAvailable;
    }
    setBookable(isBookable);
  }, [isAvailable, place.type, maxReserved]);

  useEffect(() => {
    setFavoriteCheckBoxLabel(DetermineFavoritesLabel(place.identity));
    setFavoriteCheckBoxChecked(IsFavoritePlace(place.identity));
  }, [convergeSettings?.favoriteCampusesToCollaborate]);

  let startDay = start;
  let endDay = end;
  if (isAllDay) {
    startDay = dayjs(dayjs(start).format("MM-DD-YYYY"));
    endDay = dayjs(startDay).add(1, "day");
  }
  const lengthOfEvent = dayjs.duration(dayjs(endDay).diff(dayjs(startDay))).humanize();

  const checkWorkspaceHasAmenities = (hasAmenities: boolean | undefined| string,
    hasAmenitiesCopy: JSX.Element,
    noAmnitiesCopy: JSX.Element) => (
    hasAmenities ? hasAmenitiesCopy : noAmnitiesCopy
  );

  return (
    <Box className={classes.root}>
      {err && <Alert danger icon={<ErrorIcon />} content={err} />}
      <Box className={classes.header}>
        <h1 className={classes.lightTitle}>
          {place.displayName}
        </h1>
        <span className={classes.location}>
          {buildingName}
          {" "}
          {place.floor
            && (
              <>
                |
                {" "}
                Floor
                {" "}
                {place.floor}
              </>
            )}
          {" "}
          {!isWorkspace && (
            <>
              |
              {" "}
              <Icon iconName="contact" className={classes.contactIcon} />
              {" "}
              {place.capacity}
            </>
          )}
        </span>
      </Box>
      <Box className={classes.timeWrapper}>
        <Box className={classes.timeWrapper}>
          <Box className={classes.datePickerStyles}>
            <DatePickerPrimary
              selectedDate={start.toDate()}
              onDateChange={handleDateChange}
            />
          </Box>
          <TimePickerProvider
            defaultEnd={end}
            defaultStart={start}
            onEndChange={onEndChange}
            onStartChange={onStartChange}
          >
            <TimePickerContext.Consumer>
              {(context) => (
                <>
                  <TimePicker
                    useHour12
                    className={classes.timePickerStyles}
                    allowFreeform
                    disabled={isAllDay}
                    defaultValue={start.toISOString()}
                    onChange={handleStartTimeChange(context.startTimeChangeHandler)}
                    value={context.start}
                    transparent
                  />
                  <ArrowRightIcon outline size="medium" className={classes.arrowRightIcon} />
                  <TimePicker
                    useHour12
                    className={classes.timePickerStyles}
                    allowFreeform
                    disabled={isAllDay}
                    defaultValue={end.toISOString()}
                    onChange={handleEndTimeChange(context.endTimeChangeHandler)}
                    value={context.end}
                    noRoundTimeRange
                    timeRange={context.endTimeRange}
                    transparent
                  />
                </>
              )}
            </TimePickerContext.Consumer>
          </TimePickerProvider>
          <span className={classes.icon}>
            {lengthOfEvent}
          </span>
          <Checkbox label="All day" toggle className={classes.checkBox} onChange={onAllDayChange} />
        </Box>
        <Flex hAlign="center" style={{ color: bookable ? "#237B4B" : "red", paddingTop: ".5em" }}>
          <Icon iconName={isWorkspace ? "contact" : "completed"} style={{ marginRight: "0.2em" }} />
          <span style={{ fontSize: "14px" }}>
            {isWorkspace && (
              <span>
                {place.capacity - maxReserved}
                {" "}
                seats available
              </span>
            )}
            {!isWorkspace && (
              <span>{isAvailable ? "Available" : "Unavailable"}</span>
            )}
          </span>
        </Flex>
      </Box>
      <Box>
        <Box className={classes.workspaceBox}>
          {(
            isFlexible
          ) ? (
            <Box className={classes.flexibleSeatingWrapper}>
              <span className={classes.flexibleSeating}>
                What is flexible seating?
              </span>
              <span className={classes.flexibleSeatingDesc}>
                From couches to café tables, flexible seating covers
                all the non-desk seating options at this location.
              </span>
            </Box>
            ) : (
              checkWorkspaceHasAmenities(
                (place.tags?.length > 0
                  || place.audioDeviceName
                  || place.displayDeviceName
                  || place.videoDeviceName
                  || place.isWheelChairAccessible),
                <Box className={classes.amenitiesBox}>
                  <span className={classes.amenities}>
                    {isWorkspace ? "Workspace" : "Meeting room"}
                    {" "}
                    includes
                  </span>
                  <PlaceAmmenities place={place} />
                </Box>,
                <span>
                  This
                  {" "}
                  {" "}
                  {isWorkspace ? "workspace" : "meeting room"}
                  {" "}
                  has no amenities.
                </span>,
              )
            )}
          {(photoUrl || floorPlanUrl) && (
            <Box>
              <PlaceCarousel
                photoUrl={photoUrl}
                floorPlanUrl={floorPlanUrl}
                allOtherPhotos={otherPhotos}
              />
            </Box>
          )}
        </Box>
        <Box>
          <Divider />
          <Flex>
            <Checkbox
              label={favoriteCheckBoxLabel}
              checked={favoriteCheckBoxChecked}
              disabled={favoriteCheckBoxLoading}
              onClick={() => {
                setFavoriteCheckBoxLoading(true);
                let favoriteCampusesToCollaborate = convergeSettings?.favoriteCampusesToCollaborate
                  || [];
                const isFavorite = favoriteCampusesToCollaborate.includes(place.identity);
                if (isFavorite) {
                  favoriteCampusesToCollaborate = favoriteCampusesToCollaborate
                    .filter((c) => c !== place.identity);
                } else {
                  favoriteCampusesToCollaborate = favoriteCampusesToCollaborate
                    .concat([place.identity]);
                }
                const newSettings = {
                  ...convergeSettings,
                  favoriteCampusesToCollaborate,
                };
                setConvergeSettings(newSettings);
                setSettings(newSettings)
                  .then(() => {
                    if (!isFavorite) {
                      logEvent(USER_INTERACTION, [
                        { name: IMPORTANT_ACTION, value: ImportantActions.AddVenueAsFavorite },
                      ]);
                    }
                  })
                  .finally(() => setFavoriteCheckBoxLoading(false));
                logEvent(USER_INTERACTION, [
                  { name: UI_SECTION, value: UISections.BookPlaceModal },
                  { name: "description", value: "workspace_tab_favorite_campus_place" },
                ]);
              }}
            />
            <Loader size="smallest" hidden={!favoriteCheckBoxLoading} />
          </Flex>
        </Box>
      </Box>
    </Box>
  );
};

export default BookPlaceModal;
