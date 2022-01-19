// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from "react";
import { Carousel, Image } from "@fluentui/react-northstar";
import { logEvent } from "../../../utilities/LogWrapper";
import {
  USER_INTERACTION, UISections, UI_SECTION, DESCRIPTION,
} from "../../../types/LoggerTypes";

const imageAltTags = {
  room: "Room",
  floorPln: "Floor Plan",
  placePhotos: "Place photos",
};

interface Props {
  photoUrl?: string;
  floorPlanUrl?: string;
  allOtherPhotos?: string[]
}

const PlaceCarousel: React.FC<Props> = (props) => {
  const { photoUrl, floorPlanUrl, allOtherPhotos } = props;
  const carouselItems = [];
  if (floorPlanUrl) {
    carouselItems.push({
      key: "floorPlan",
      id: "floorPlan",
      content: (
        <Image
          src={floorPlanUrl}
          fluid
          alt={imageAltTags.floorPln}
        />
      ),
      "aria-label": imageAltTags.floorPln,
    });
  }
  if (photoUrl) {
    carouselItems.push({
      key: "room",
      id: "room",
      content: (
        <Image
          src={photoUrl}
          fluid
          alt={imageAltTags.room}
        />
      ),
      "aria-label": imageAltTags.room,
    });
  }
  if (allOtherPhotos?.length) {
    allOtherPhotos?.forEach((item, index) => {
      carouselItems.push({
        key: `placePhotos-${index}`,
        id: `placePhotos-${index}`,
        content: (
          <Image
            src={item}
            fluid
            alt={imageAltTags.placePhotos}
          />
        ),
        "aria-label": imageAltTags.placePhotos,
      });
    });
  }
  return (
    <Carousel
      navigation={{
        "aria-label": "room photos",
        items: carouselItems.map((item) => ({
          key: item.id,
          "aria-controls": item.id,
        })),
      }}
      items={carouselItems}
      getItemPositionText={(index: number, size: number) => `${index + 1} of ${size}`}
      onActiveIndexChange={() => {
        logEvent(USER_INTERACTION, [
          { name: UI_SECTION, value: UISections.BookPlaceModal },
          { name: DESCRIPTION, value: "carousel_change" },
        ]);
      }}
    />
  );
};

export default PlaceCarousel;
