// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Image } from "@fluentui/react-northstar";
import React from "react";
import small0 from "./small_0.png";
import small1Half from "./small_1_half.png";
import small1 from "./small_1.png";
import small2Half from "./small_2_half.png";
import small2 from "./small_2.png";
import small3Half from "./small_3_half.png";
import small3 from "./small_3.png";
import small4 from "./small_4.png";
import small4Half from "./small_4_half.png";
import small5 from "./small_5.png";

interface Props {
  rating: number;
}

const getImageFromRating = (rating: number): string => {
  let image = small0;
  if (rating >= 1) {
    image = small1;
  }
  if (rating >= 1.5) {
    image = small1Half;
  }
  if (rating >= 2) {
    image = small2;
  }
  if (rating >= 2.5) {
    image = small2Half;
  }
  if (rating >= 3) {
    image = small3;
  }
  if (rating >= 3.5) {
    image = small3Half;
  }
  if (rating >= 4) {
    image = small4;
  }
  if (rating >= 4.5) {
    image = small4Half;
  }
  if (rating === 5) {
    image = small5;
  }
  return image;
};

const YelpStars: React.FC<Props> = (props) => {
  const { rating } = props;
  const imgSrc = getImageFromRating(rating);
  return <Image src={imgSrc} />;
};

export default YelpStars;
