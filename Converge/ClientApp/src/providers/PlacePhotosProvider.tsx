// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { createCachedPlacePhotosQuery } from "../api/buildingService";
import createCachedServiceProvider from "../utilities/CachedServiceProvider";

const [
  PlacePhotosProvider,
  usePlacePhotos,
] = createCachedServiceProvider(createCachedPlacePhotosQuery());

export { PlacePhotosProvider, usePlacePhotos };
