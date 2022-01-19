// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

interface BaseVenue {
  venueId: string;
  venueName: string;
  latitude?: string;
  longitude?: string;
  phoneNumber?: string;
  urlReference?: string;
  imageUrl?: string;
  rating?: number;
  reviewCount?: number;
  price?: string;
  categories?: string[];
  transactions?: string[];
}

export default BaseVenue;
