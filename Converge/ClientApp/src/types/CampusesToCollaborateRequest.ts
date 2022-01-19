// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

interface CampusesToCollaborateRequest {
  teamMembers: string[];
  startTime: Date;
  endTime: Date;
  capacitySortOrder: string;
  placeType: "space" | "room"
  closeToUser?: string;
  distanceFromSource?: number;
}

export default CampusesToCollaborateRequest;
