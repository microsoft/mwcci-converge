// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { GeoCoordinates } from "@microsoft/microsoft-graph-types";

interface ConvergeSettings {
  preferredBuildings?: string[];
  zipCode?: string;
  isConvergeUser?: boolean;
  myList?: string[];
  likedSections?: string[];
  dislikedSections?: string[];
  lastNPSDate?: string;
  favoriteVenuesToCollaborate?: string[];
  favoriteCampusesToCollaborate?: string[];
  convergeInstalledDate?: string;
  recentBuildingUpns?: string[];
  geoCoordinates?: GeoCoordinates;
}

export default ConvergeSettings;
