// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Microsoft } from "./BingMapLoader";

export enum CanvasSizes {
  PORTRAIT = 32,
  RANGE_RING = 160,
  BACKGROUND = 34
}

const createPortrait = (
  imageSrc: string,
): Promise<HTMLCanvasElement> => new Promise((resolve) => {
  const img = new Image();
  img.onload = () => {
    const imageCanvas = document.createElement("canvas");
    imageCanvas.width = CanvasSizes.PORTRAIT;
    imageCanvas.height = CanvasSizes.PORTRAIT;
    const imageContext = imageCanvas.getContext("2d");
    if (imageContext) {
      imageContext.save();

      imageContext.beginPath();
      imageContext.arc(16, 16, 16, 0, 2 * Math.PI, true);
      imageContext.closePath();
      imageContext.clip();

      imageContext.drawImage(img, 0, 0, 33, 33);
    }
    resolve(imageCanvas);
  };
  img.src = imageSrc;
});

export const createRangeRing = (): HTMLCanvasElement => {
  const rangeRing = document.createElement("canvas");
  rangeRing.width = CanvasSizes.RANGE_RING;
  rangeRing.height = CanvasSizes.RANGE_RING;
  const backgroundContext = rangeRing.getContext("2d");
  if (backgroundContext) {
    backgroundContext.save();
    backgroundContext.beginPath();
    backgroundContext.arc(80, 80, 80, 0, 2 * Math.PI, true);
    backgroundContext.fillStyle = "rgba(227, 0, 140, 0.16)";
    backgroundContext.fill();
    backgroundContext.closePath();
  }
  return rangeRing;
};

export const createBackground = (): HTMLCanvasElement => {
  const background = document.createElement("canvas");
  background.width = CanvasSizes.BACKGROUND;
  background.height = CanvasSizes.BACKGROUND;
  const backgroundContext = background.getContext("2d");
  if (backgroundContext) {
    backgroundContext.save();
    backgroundContext.beginPath();
    backgroundContext.arc(17, 17, 17, 0, 2 * Math.PI, true);
    backgroundContext.fillStyle = "white";
    backgroundContext.fill();
    backgroundContext.closePath();
  }

  return background;
};

const getInitials = (displayName: string) => {
  let initials = "";
  const nameArray = displayName.split(" ");
  if (nameArray.length > 0) {
    initials += nameArray[0][0];
  }
  if (nameArray.length > 1) {
    initials += nameArray[1][0];
  }
  return initials;
};

const createPortraitFallback = (
  displayName?: string | null,
): HTMLCanvasElement => {
  const imageCanvas = document.createElement("canvas");
  imageCanvas.width = CanvasSizes.PORTRAIT;
  imageCanvas.height = CanvasSizes.PORTRAIT;
  const halfPortrait = CanvasSizes.PORTRAIT / 2;
  const imageContext = imageCanvas.getContext("2d");
  if (imageContext) {
    imageContext.save();
    imageContext.beginPath();
    imageContext.arc(halfPortrait, halfPortrait, halfPortrait, 0, 2 * Math.PI, true);
    imageContext.fillStyle = "#e8e8e8";
    imageContext.fill();
    imageContext.closePath();

    if (displayName) {
      const textCanvas = document.createElement("canvas");
      textCanvas.width = CanvasSizes.PORTRAIT;
      textCanvas.height = CanvasSizes.PORTRAIT;
      const textContext = textCanvas.getContext("2d");
      if (textContext) {
        textContext.font = "12px sans-serif";
        textContext.fillStyle = "rgba(0, 0, 0, 0.6)";
        textContext.fillText(getInitials(displayName), 8, 20);
      }
      imageContext.drawImage(textCanvas, 0, 0);
    }
  }
  return imageCanvas;
};

export const createUserPushpin = async (
  location: Microsoft.Maps.Location,
  imageSrc?: string | null,
  displayName?: string | null,
): Promise<Microsoft.Maps.Pushpin> => {
  const imageCanvas = imageSrc ? await createPortrait(imageSrc)
    : createPortraitFallback(displayName);
  const backgroundCanvas = createRangeRing();
  const ringCanvas = createBackground();

  const finalCanvas = document.createElement("canvas");
  const finalContext = finalCanvas.getContext("2d");
  finalCanvas.width = CanvasSizes.RANGE_RING;
  finalCanvas.height = CanvasSizes.RANGE_RING;
  if (finalContext) {
    finalContext.drawImage(backgroundCanvas, 0, 0);
    finalContext.drawImage(
      ringCanvas,
      60,
      60,
    );
    if (imageCanvas) {
      finalContext.drawImage(
        imageCanvas,
        61,
        61,
      );
    }
  }

  const pin = new Microsoft.Maps.Pushpin(location, {
    // Generate a base64 image URL from the canvas.
    icon: finalCanvas.toDataURL(),
    anchor: new Microsoft.Maps.Point(80, 80),
    subTitle: "",
  });
  return pin;
};
