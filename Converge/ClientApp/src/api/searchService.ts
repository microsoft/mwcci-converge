// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import AutoWrapperResponse from "../types/AutoWrapperResponse";
import CampusesToCollaborateResponse from "../types/CampusesToCollaborateResponse";
import CampusesToCollaborateRequest from "../types/CampusesToCollaborateRequest";
import VenuesToCollaborateRequest from "../types/VenuesToCollaborateRequest";
import VenuesToCollaborateResponse from "../types/VenuesToCollaborateResponse";
import VenueReviewsResponse from "../types/VenueReviewsResponse";
import VenueDetails from "../types/VenueDetails";
import AuthenticationService from "./AuthenticationService";
import Constants from "../utilities/Constants";

export default class SearchService {
  private authenticationService: AuthenticationService;

  constructor(authenticationService: AuthenticationService) {
    this.authenticationService = authenticationService;
  }

  searchCampusesToCollaborate = async (
    campusesToCollaborateRequest: CampusesToCollaborateRequest,
  ): Promise<CampusesToCollaborateResponse> => {
    const axios = await this.authenticationService.getAxiosClient();
    const request = await axios.post<AutoWrapperResponse<CampusesToCollaborateResponse>>(
      "/api/v1.0/search/campusesToCollaborate",
      campusesToCollaborateRequest, { params: {} },
    );
    return request.data.result;
  };

  searchVenuesToCollaborate = async (
    venuesToCollaborateRequest: VenuesToCollaborateRequest,
  ): Promise<VenuesToCollaborateResponse> => {
    const axios = await this.authenticationService.getAxiosClient();
    const request = await axios.post<AutoWrapperResponse<VenuesToCollaborateResponse>>("/api/v1.0/search/venuesToCollaborate", venuesToCollaborateRequest);
    return request.data.result;
  };

  getVenueDetails = async (
    venueId: string,
  ): Promise<VenueDetails> => {
    const axios = await this.authenticationService.getAxiosClient();
    const request = await axios.get<AutoWrapperResponse<VenueDetails>>(`/api/v1.0/search/venues/${venueId}/details`, {
      cache: {
        maxAge: Constants.TWO_HOURS_IN_MILLISECONDS,
      },
    });
    return request.data.result;
  };

  getReviews = async (
    venueId: string,
  ): Promise<VenueReviewsResponse> => {
    const axios = await this.authenticationService.getAxiosClient();
    const request = await axios.get<AutoWrapperResponse<VenueReviewsResponse>>(`/api/v1.0/search/venues/${venueId}/reviews`);
    return request.data.result;
  };
}
