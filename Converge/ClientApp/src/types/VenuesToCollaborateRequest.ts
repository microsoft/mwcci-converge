// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

interface VenuesToCollaborateRequest {
  venueType: string;
  teamMembers: string[];
  startTime?: Date;
  endTime?: Date;
  closeToUser:string;
  skip?: number;
  limit?: number;
}

export default VenuesToCollaborateRequest;
