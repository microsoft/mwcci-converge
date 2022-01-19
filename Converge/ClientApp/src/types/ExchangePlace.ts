// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export enum PhotoType {
  Cover,
  FloorPlan,
  Photo,
}

export enum PlaceType {
  Space,
  Room
}

enum BookingType {
  Unknown = "unknown",
  Standard = "standard",
  Reserved = "reserved"
}

export enum CollaborationVenueType {
  Workspace = 1,
  ConferenceRoom,
  FoodAndDrink,
  ParksAndRecreation,
}

export const getCollaborationVenueTypeString = (venueType: CollaborationVenueType): string => {
  switch (venueType) {
    case CollaborationVenueType.ConferenceRoom:
      return "Conference Room";
    case CollaborationVenueType.Workspace:
      return "Workspace";
    case CollaborationVenueType.FoodAndDrink:
      return "Food & Drink";
    case CollaborationVenueType.ParksAndRecreation:
      return "Parks & Recreation";
    default:
      return "Campus";
  }
};

interface ExchangePlace {
  identity: string;
  displayName: string;
  type?: PlaceType;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  countryOrRegion: string;
  isManaged?: boolean;
  bookingType?: BookingType;
  phone: string;
  capacity: number;
  building: string;
  label: string;
  audioDeviceName: string;
  videoDeviceName: string;
  displayDeviceName: string;
  isWheelChairAccessible?: boolean;
  floor: string;
  tags: string[];
  locality: string;
  sharePointID: string;
  urlReference?: string;
}

export default ExchangePlace;
