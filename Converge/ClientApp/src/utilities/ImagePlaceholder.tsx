// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, useEffect } from "react";
import {
  Image,
} from "@fluentui/react-northstar";

interface Props {
  width: string;
  height: string;
  index?: number;
  borderRadius?: string;
  fluid?: boolean;
}

const ImagePlaceholder: React.FC<Props> = (props) => {
  const {
    width, height, index, borderRadius = "5px", fluid,
  } = props;

  const [imgSrc, setImgSrc] = useState<string>("");

  useEffect(() => {
    if (index && index < 10) {
      setImgSrc(`images/placeholderImage-${index}.jpg`);
    } else {
      const randomNumber = Math.floor(Math.random() * 10);
      setImgSrc(`images/placeholderImage-${randomNumber}.jpg`);
    }
  }, []);

  return (
    <Image
      styles={{
        width,
        height,
        borderRadius,
        display: "block",
      }}
      fluid={fluid}
      src={imgSrc}
    />
  );
};

export default ImagePlaceholder;
