// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Microsoft } from "./BingMapLoader";
import { CanvasSizes, createBackground, createRangeRing } from "./Pushpins";

enum ImageOffset {
  LEFT = 0,
  RIGHT = 1,
  TOP_LEFT = 2,
  TOP_RIGHT = 3,
  BOTTOM_LEFT = 4,
  BOTTOM_RIGHT = 5
}

type CanvasImageSource = HTMLCanvasElement | HTMLImageElement;

const HALF_RING = CanvasSizes.RANGE_RING / 2;
const HALF_PORTRAIT = CanvasSizes.PORTRAIT / 2;
const GAP = (CanvasSizes.BACKGROUND - CanvasSizes.PORTRAIT) + 1;
const ORIGIN = HALF_RING - 3;

const createImageCanvas = (
  imageSrc: string,
): Promise<HTMLImageElement> => new Promise((resolve) => {
  const img = new Image();
  img.onload = () => resolve(img);
  img.src = imageSrc;
});

/*
  Function for repositioning portraits so they are
  viewable in the facepie
*/
function adjustImageOffsetAndScale(
  image: CanvasImageSource,
  position: ImageOffset,
  scale: number,
) {
  const offsetCloser = -((HALF_PORTRAIT) / 3);
  const offsetFurther = GAP + ((HALF_PORTRAIT) / 3);
  const positionOffsets = [
    [offsetCloser, 0],
    [offsetFurther, 0],
    [offsetCloser, offsetCloser],
    [offsetFurther, offsetCloser],
    [offsetCloser, offsetFurther],
    [offsetFurther, offsetFurther],
  ];

  const newCanvas = document.createElement("canvas");
  newCanvas.width = CanvasSizes.RANGE_RING;
  newCanvas.height = CanvasSizes.RANGE_RING;
  const context = newCanvas.getContext("2d");
  if (context) {
    const [x, y] = positionOffsets[position];
    context.drawImage(
      image,
      x,
      y,
      CanvasSizes.RANGE_RING,
      CanvasSizes.RANGE_RING,
    );
    context.scale(scale, scale);
  }
  return newCanvas;
}

/*
  Remove the existing range ring so that the pushpin
  portrait can be reused in the facepie.
*/
function removeRangeRing(image: CanvasImageSource) {
  const newCanvas = document.createElement("canvas");
  newCanvas.width = CanvasSizes.RANGE_RING;
  newCanvas.height = CanvasSizes.RANGE_RING;
  const context = newCanvas.getContext("2d");
  if (context) {
    context.drawImage(
      image,
      0,
      0,
      CanvasSizes.RANGE_RING,
      CanvasSizes.RANGE_RING,
    );
    context.beginPath();
    context.rect(0, 0, CanvasSizes.RANGE_RING, CanvasSizes.RANGE_RING);

    context.arc(
      ORIGIN, ORIGIN,
      CanvasSizes.PORTRAIT / 2,
      0,
      Math.PI * 2,
      true,
    );
    context.clip();
    context.clearRect(0, 0, CanvasSizes.RANGE_RING, CanvasSizes.RANGE_RING);
  }
  return newCanvas;
}

/*
  Below are a collection of functions for cropping the portrait image so they
  can be stitched on top of each other.
*/
function keepLeftHalf(image: CanvasImageSource) {
  const newCanvas = document.createElement("canvas");
  newCanvas.width = CanvasSizes.RANGE_RING;
  newCanvas.height = CanvasSizes.RANGE_RING;
  const context = newCanvas.getContext("2d");
  if (context) {
    context.drawImage(
      image,
      0,
      0,
      CanvasSizes.RANGE_RING,
      CanvasSizes.RANGE_RING,
    );
    context.clearRect(ORIGIN - 1, 0, CanvasSizes.RANGE_RING, CanvasSizes.RANGE_RING);
  }
  return newCanvas;
}

function keepRightHalf(image: CanvasImageSource) {
  const newCanvas = document.createElement("canvas");
  newCanvas.width = CanvasSizes.RANGE_RING;
  newCanvas.height = CanvasSizes.RANGE_RING;
  const context = newCanvas.getContext("2d");
  if (context) {
    context.drawImage(
      image,
      0,
      0,
      CanvasSizes.RANGE_RING,
      CanvasSizes.RANGE_RING,
    );
    context.clearRect(0, 0, HALF_RING - GAP, CanvasSizes.RANGE_RING);
  }
  return newCanvas;
}

function keepBottomLeftCorner(image: CanvasImageSource) {
  const newCanvas = document.createElement("canvas");
  newCanvas.width = CanvasSizes.RANGE_RING;
  newCanvas.height = CanvasSizes.RANGE_RING;
  const context = newCanvas.getContext("2d");
  if (context) {
    context.drawImage(
      image,
      0,
      0,
      CanvasSizes.RANGE_RING,
      CanvasSizes.RANGE_RING,
    );
    context.clearRect(ORIGIN - 1, 0, CanvasSizes.RANGE_RING, CanvasSizes.RANGE_RING);
    context.clearRect(0, 0, CanvasSizes.RANGE_RING, HALF_RING - GAP + 1);
  }
  return newCanvas;
}

function keepBottomRightCorner(image: CanvasImageSource) {
  const newCanvas = document.createElement("canvas");
  newCanvas.width = CanvasSizes.RANGE_RING;
  newCanvas.height = CanvasSizes.RANGE_RING;
  const context = newCanvas.getContext("2d");
  if (context) {
    context.drawImage(
      image,
      0,
      0,
      CanvasSizes.RANGE_RING,
      CanvasSizes.RANGE_RING,
    );
    context.clearRect(0, 0, HALF_RING - GAP, CanvasSizes.RANGE_RING);
    context.clearRect(0, 0, CanvasSizes.RANGE_RING, HALF_RING - GAP + 1);
  }
  return newCanvas;
}

function keepTopLeftCorner(image: CanvasImageSource) {
  const newCanvas = document.createElement("canvas");
  newCanvas.width = CanvasSizes.RANGE_RING;
  newCanvas.height = CanvasSizes.RANGE_RING;
  const context = newCanvas.getContext("2d");
  if (context) {
    context.drawImage(
      image,
      0,
      0,
      CanvasSizes.RANGE_RING,
      CanvasSizes.RANGE_RING,
    );
    context.clearRect(ORIGIN - 1, 0, CanvasSizes.RANGE_RING, CanvasSizes.RANGE_RING);
    context.clearRect(0, ORIGIN, CanvasSizes.RANGE_RING, CanvasSizes.RANGE_RING);
  }
  return newCanvas;
}

function keepTopRightCorner(image: CanvasImageSource) {
  const newCanvas = document.createElement("canvas");
  newCanvas.width = CanvasSizes.RANGE_RING;
  newCanvas.height = CanvasSizes.RANGE_RING;
  const context = newCanvas.getContext("2d");
  if (context) {
    context.drawImage(
      image,
      0,
      0,
      CanvasSizes.RANGE_RING,
      CanvasSizes.RANGE_RING,
    );
    context.clearRect(0, 0, HALF_RING - GAP, CanvasSizes.RANGE_RING);
    context.clearRect(0, ORIGIN, CanvasSizes.RANGE_RING, CanvasSizes.RANGE_RING);
  }
  return newCanvas;
}

function createUserCount(length: number) {
  const textCanvas = document.createElement("canvas");
  textCanvas.width = CanvasSizes.RANGE_RING;
  textCanvas.height = CanvasSizes.RANGE_RING;
  const textContext = textCanvas.getContext("2d");
  if (textContext) {
    textContext.font = "8px sans-serif";
    textContext.fillStyle = "rgba(0, 0, 0, 0.6)";
    const x = HALF_RING - 2;
    const y = HALF_RING + GAP + 4;
    textContext.fillText(`+${(length - 3).toString()}`, x, y, HALF_PORTRAIT - GAP);
  }

  return textCanvas;
}

// Function for handling styling the first facepie portrait
function handleFirst(image: CanvasImageSource, length: number) {
  return (length === 2 || length === 3
    ? keepLeftHalf(adjustImageOffsetAndScale(image, ImageOffset.LEFT, 1))
    : keepBottomLeftCorner(adjustImageOffsetAndScale(image, ImageOffset.BOTTOM_LEFT, 0.2))
  );
}

// Function for handling styling the second facepie portrait
function handleSecond(image: CanvasImageSource, length: number) {
  if (length === 2) {
    return keepRightHalf(adjustImageOffsetAndScale(image, ImageOffset.RIGHT, 1));
  } if (length === 3) {
    return keepTopRightCorner(adjustImageOffsetAndScale(image, ImageOffset.TOP_RIGHT, 0.2));
  }
  return keepTopLeftCorner(adjustImageOffsetAndScale(image, ImageOffset.TOP_LEFT, 0.2));
}

// Function for handling styling the third facepie portrait
function handleThird(image: CanvasImageSource, length: number) {
  return (length === 3
    ? keepBottomRightCorner(adjustImageOffsetAndScale(image, ImageOffset.BOTTOM_RIGHT, 0.2))
    : keepTopRightCorner(adjustImageOffsetAndScale(image, ImageOffset.TOP_RIGHT, 0.2)));
}

// Function for handling the different portrait images in the facepie.
function handleImage(image: CanvasImageSource, index: number, length: number) {
  switch (index) {
    case 0: return handleFirst(image, length);
    case 1: return handleSecond(image, length);
    case 2: return handleThird(image, length);
    default: return image;
  }
}

// Function that re-adds the range ring and background once the images are stitched together.
function reAddRing(canvas: CanvasImageSource, length: number) {
  const newCanvas = document.createElement("canvas");
  newCanvas.width = CanvasSizes.RANGE_RING;
  newCanvas.height = CanvasSizes.RANGE_RING;
  const context = newCanvas.getContext("2d");
  if (context) {
    const ring = createRangeRing();
    const background = createBackground();
    const text = createUserCount(length);

    context.drawImage(ring, 0, 0);
    context.drawImage(background, 60, 60);
    context.drawImage(text, 0, 0);
    context.drawImage(canvas, 0, 0, CanvasSizes.RANGE_RING, CanvasSizes.RANGE_RING);
  }

  return newCanvas;
}

/*
  Function that extracts the portraits from the pushpin images
  and stitches them together into a facepie pushpin.
*/
async function createCustomClusteredPin(cluster: Microsoft.Maps.ClusterPushpin): Promise<void> {
  const images = cluster.containedPushpins.map((pin) => pin.getIcon());
  const firstThreeStrings = images.slice(0, 3);
  const firstThreeImages = await Promise.all(firstThreeStrings.map(createImageCanvas));

  const finalCanvas = document.createElement("canvas");
  const finalContext = finalCanvas.getContext("2d");

  finalCanvas.width = CanvasSizes.RANGE_RING;
  finalCanvas.height = CanvasSizes.RANGE_RING;
  if (finalContext) {
    firstThreeImages.forEach((image: HTMLImageElement, index: number) => {
      const adjusted = handleImage(image, index, images.length);
      const withoutRing = removeRangeRing(adjusted);
      finalContext.drawImage(withoutRing, 0, 0, CanvasSizes.RANGE_RING, CanvasSizes.RANGE_RING);
    });
  }

  const withRing = reAddRing(finalCanvas, images.length);

  cluster.setOptions({
    icon: withRing.toDataURL(),
    anchor: new Microsoft.Maps.Point(80, 80),
    text: "",
  });
}

export default createCustomClusteredPin;
