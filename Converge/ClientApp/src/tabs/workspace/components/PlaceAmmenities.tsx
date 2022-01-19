// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Icon } from "office-ui-fabric-react";
import React from "react";
import { PlaceAttributeKeys } from "../../../providers/PlaceFilterProvider";
import ExchangePlace from "../../../types/ExchangePlace";
import PlaceAmmenitiesStyles from "../styles/PlaceAmmenitiesStyles";

interface Props {
  place: ExchangePlace;
}

enum AmenityIcons {
  Audio = "Audio",
  Display = "Display",
  Video = "Video",
  Accessible = "Accessible",
}

const getAmenityIcon = (
  availability: string | null | undefined,
): JSX.Element | undefined => {
  const avail = availability as AmenityIcons;
  if (!avail) {
    return undefined;
  }
  const AmenityIconSet: {[TKey in AmenityIcons]: JSX.Element | undefined} = {
    [AmenityIcons.Audio]: <Icon iconName="Volume2" />,
    [AmenityIcons.Display]: <Icon iconName="TVMonitor" />,
    [AmenityIcons.Video]: <Icon iconName="Video" />,
    [AmenityIcons.Accessible]: <Icon iconName="EaseOfAccess" />,
  };
  return AmenityIconSet[avail] || undefined;
};

export const getAmmenities = (place: ExchangePlace): string[] => {
  const ammenities: string[] = [
    { key: "audioDeviceName", value: "Audio" },
    { key: "displayDeviceName", value: "Display" },
    { key: "videoDeviceName", value: "Video" },
    { key: "isWheelChairAccessible", value: "Accessible" },
  ]
    .filter((k) => !!place[k.key as PlaceAttributeKeys])
    .map((k) => k.value);

  if (place.tags) {
    ammenities.push(...place.tags);
  }
  return ammenities.filter((a) => a !== "isFlexibleSeating");
};

const PlaceAmmenities: React.FC<Props> = (props) => {
  const { place } = props;
  const classes = PlaceAmmenitiesStyles();

  return (
    <ul className={classes.root}>
      {getAmmenities(place).map(
        (item) => (
          <li
            key={item}
          >
            <span className={classes.item}>{getAmenityIcon(item)}</span>
            {item}
          </li>
        ),
      )}
    </ul>
  );
};

export default PlaceAmmenities;
