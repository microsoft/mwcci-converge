// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable @typescript-eslint/no-explicit-any */
// tslint:disable:interface-name
interface MapWindow extends Window {
  Microsoft: any;
  bingAPIReady: () => void;
}

declare const window: MapWindow;
// eslint-disable-next-line import/no-mutable-exports
export let Microsoft: any = {};

export function loadBingApi(key?: string): Promise<void> {
  const callbackName = "bingAPIReady";
  let url = `https://www.bing.com/api/maps/mapcontrol?callback=${callbackName}`;
  if (key) {
    url += `&key=${key}`;
  }

  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.defer = true;
    script.src = url;
    window.bingAPIReady = () => {
      Microsoft = window.Microsoft;
      resolve();
    };
    document.body.appendChild(script);
  });
}
