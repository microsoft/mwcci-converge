// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import AutoWrapperResponse from "../types/AutoWrapperResponse";
import CampusesToCollaborateResponse from "../types/CampusesToCollaborateResponse";
import CampusesToCollaborateRequest from "../types/CampusesToCollaborateRequest";
import VenuesToCollaborateRequest from "../types/VenuesToCollaborateRequest";
import VenuesToCollaborateResponse from "../types/VenuesToCollaborateResponse";
import VenueReviewsResponse from "../types/VenueReviewsResponse";
import VenueDetails from "../types/VenueDetails";
import getAxiosClient from "./AuthenticationService";
import createCachedQuery, { CachedQuery } from "../utilities/CachedQuery";

export const searchCampusesToCollaborate = async (
  campusesToCollaborateRequest: CampusesToCollaborateRequest,
): Promise<CampusesToCollaborateResponse> => {
  const axios = await getAxiosClient();
  const request = await axios.post<AutoWrapperResponse<CampusesToCollaborateResponse>>(
    "/api/search/campusesToCollaborate",
    campusesToCollaborateRequest, { params: {} },
  );
  return request.data.result;
};

export const searchVenuesToCollaborate = async (
  venuesToCollaborateRequest: VenuesToCollaborateRequest,
): Promise<VenuesToCollaborateResponse> => {
  const axios = await getAxiosClient();
  const request = await axios.post<AutoWrapperResponse<VenuesToCollaborateResponse>>("/api/search/venuesToCollaborate", venuesToCollaborateRequest);
  return request.data.result;
};

export const getVenueDetails = async (
  venueId: string,
): Promise<VenueDetails> => {
  const axios = await getAxiosClient();
  const request = await axios.get<AutoWrapperResponse<VenueDetails>>(`/api/search/venues/${venueId}/details`);
  return request.data.result;
};

const generateVenueDetailsStoreKey = (
  venue: VenueDetails,
) => venue.venueId;

const generateVenueDetailsRetrievalKey = (search: string) => search;

type CachedVenueDetailsQuery = CachedQuery<VenueDetails, void>;

// Function that returns a cached getUserCoordinates function.
export function createCachedVenueDetailsQuery(): CachedVenueDetailsQuery {
  return createCachedQuery<VenueDetails>(
    generateVenueDetailsStoreKey,
    generateVenueDetailsRetrievalKey,
    (entities: string[]) => getVenueDetails(entities[0])
      .then((item) => [item]),
  );
}

export const getReviews = async (
  venueId: string,
): Promise<VenueReviewsResponse> => {
  const axios = await getAxiosClient();
  const request = await axios.get<AutoWrapperResponse<VenueReviewsResponse>>(`/api/search/venues/${venueId}/reviews`);
  return request.data.result;
};
