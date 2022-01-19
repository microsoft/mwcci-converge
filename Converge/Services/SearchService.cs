// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Converge.Helpers;
using Converge.Models;
using Converge.Models.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Principal;
using System.Threading;
using System.Threading.Tasks;

namespace Converge.Services
{
    public class SearchService
    {
        private readonly UserGraphService userGraphService;
        private readonly PlacesService placesService;
        private readonly ScheduleService scheduleService;
        private readonly SearchBingMapsService searchBingMapsService;
        private readonly SearchYelpApiService searchYelpApiService;

        public SearchService(
                    UserGraphService paramUserGraphService,
                    PlacesService paramPlacesService,
                    ScheduleService paramScheduleService,
                    SearchBingMapsService paramSearchBingMapsService,
                    SearchYelpApiService paramSearchYelpApiService)
        {
            userGraphService = paramUserGraphService;
            placesService = paramPlacesService;
            scheduleService = paramScheduleService;
            searchBingMapsService = paramSearchBingMapsService;
            searchYelpApiService = paramSearchYelpApiService;
        }

        public void SetPrincipalUserIdentity(IIdentity principalUserIdentity)
        {
            userGraphService.SetPrincipalUserIdentity(principalUserIdentity);
        }

        private string EvaluateYelpVenueType(string venueTypeRequest)
        {
            return Constant.YelpDefinedVenueTypes[venueTypeRequest.FirstMatchIndex(Constant.AcceptableVenueTypes)];
        }

        public async Task<List<VenuesToCollaborate>> GetVenuesToCollaborate(VenuesToCollaborateRequest request)
        {
            Dictionary<string, GPSCoordinates> memberGeoCoordsDictionary;

            try
            {
                memberGeoCoordsDictionary = await userGraphService.GetGeoCoordsForAllMembers(request.TeamMembers, request.StartTime);
            }
            catch
            {
                throw;
            }
            //Get Central point in Lat/Long for list of Members' Latitude/Longitude.
            var centralGeoCoordinates = LocationHelper.GetCentralGeoCoordinates(memberGeoCoordsDictionary.Values.ToList());

            if (!string.IsNullOrEmpty(request.CloseToUser))
            {
                GPSCoordinates closeToUserGpsCoords = memberGeoCoordsDictionary[request.CloseToUser];
                if (closeToUserGpsCoords != null)
                {
                    //50% closer to the CloseToUser.
                    centralGeoCoordinates = LocationHelper.GetCentralGeoCoordinates(new List<GPSCoordinates>() 
                                                                                    { centralGeoCoordinates, closeToUserGpsCoords } );
                    //25% closer to the CloseToUser.
                    centralGeoCoordinates = LocationHelper.GetCentralGeoCoordinates(new List<GPSCoordinates>()
                                                                                    { centralGeoCoordinates, closeToUserGpsCoords });
                }
            }

            var venueType = string.IsNullOrWhiteSpace(request.VenueType) ? string.Empty : EvaluateYelpVenueType(request.VenueType);

            return await searchYelpApiService.GetBusinesses(centralGeoCoordinates, venueType, request.Keywords, request.Skip, request.Limit);
        }

        public async Task<VenueDetails> GetVenueDetails(string venueId)
        {
            return await searchYelpApiService.GetBusinessDetails(venueId);
        }

        public async Task<ServiceJsonResponse> GetVenueReviews(string venueId)
        {
            return await searchYelpApiService.GetBusinessReviews(venueId);
        }

        private async Task AssignRankToPlacesByDistance(string[] sourceCoordinatesList, List<ExchangePlace> placesList)
        {
            //Get the Distance-matrix
            string[] destinationCoordinatesList = placesList.Select(g => g.GeoCoordinates).Where(x => !string.IsNullOrWhiteSpace(x)).ToArray();
            List<BingMapsDistanceMatrix> distanceMatrixList = null;
            try
            {
                distanceMatrixList = await searchBingMapsService.GetDistanceMatrix(sourceCoordinatesList, destinationCoordinatesList);
            }
            catch
            {
                throw;
            }

            var matrixList = distanceMatrixList.OrderBy(o => o.TravelDistance).Select(x => x.DestinationGeoCoordinates).Distinct().ToList();
            for (int index = 0; index < matrixList.Count(); ++index)
            {
                var targetList = placesList.Where(x => x.GeoCoordinates == matrixList[index]).ToList();
                foreach (var each in targetList)
                {
                    each.RankByDistance = index + 1;
                }
            }
        }

        public async Task<CampusesToCollaborateResponse> GetCampusesListToCollaborate(CampusesToCollaborateRequest request)
        {
            GPSCoordinates centralGeoCoordinates = null;
            GraphExchangePlacesResponse exchangePlacesResponse = null;

            try
            {
                Dictionary<string, GPSCoordinates> memberGeoCoordsDictionary = await userGraphService.GetGeoCoordsForAllMembers(request.TeamMembers, request.StartTime);

                //Get Central point in Lat/Long for list of Members' Latitude/Longitude.
                centralGeoCoordinates = LocationHelper.GetCentralGeoCoordinates(memberGeoCoordsDictionary.Values.ToList());

                if (!string.IsNullOrEmpty(request.CloseToUser))
                {
                    GPSCoordinates closeToUserGpsCoords = memberGeoCoordsDictionary[request.CloseToUser];
                    if (closeToUserGpsCoords != null)
                    {
                        //50% closer to the CloseToUser.
                        centralGeoCoordinates = LocationHelper.GetCentralGeoCoordinates(new List<GPSCoordinates>()
                                                                                { centralGeoCoordinates, closeToUserGpsCoords });
                        //25% closer to the CloseToUser.
                        centralGeoCoordinates = LocationHelper.GetCentralGeoCoordinates(new List<GPSCoordinates>()
                                                                                { centralGeoCoordinates, closeToUserGpsCoords });
                    }
                }

                PlaceType targetPlaceType = Enum.Parse<PlaceType>(request.PlaceType, true);
                CampusSortRequest placeSortRequest = new CampusSortRequest(Models.Enums.CampusSortByType.Distance, centralGeoCoordinates, request.DistanceFromSource);
                exchangePlacesResponse = await placesService.GetPlacesBySortRequest(placeSortRequest, targetPlaceType);

                if (placeSortRequest.SortByType == CampusSortByType.Distance)
                {
                    //Employed Haversine formula.
                    exchangePlacesResponse.ExchangePlacesList = placeSortRequest.SortPlacesByDistance(exchangePlacesResponse.ExchangePlacesList);
                }

                Parallel.ForEach(exchangePlacesResponse.ExchangePlacesList, campus =>
                {
                    if (campus.Type == PlaceType.Space)
                    {
                        //Check Max-Reservations for a place - Workspace.
                        int maxReserved = scheduleService.GetMaxReserved(request.StartTime, request.EndTime, campus.Identity).Result;
                        //Save Unreserved slots @ Workspace.
                        campus.AvailableSlots = campus.Capacity - maxReserved;
                    }
                    else if (campus.Type == PlaceType.Room)
                    {
                        //Check TotalAvailability of a place - Conference Room.
                        bool totalAvailability = scheduleService.GetAvailability(request.StartTime, request.EndTime, campus.Identity).Result;
                        //Save Unreserved slots @ Conference Room.
                        campus.AvailableSlots = totalAvailability ? campus.Capacity : 0;
                    }
                });
            }
            catch
            {
                throw;
            }

            return new CampusesToCollaborateResponse(exchangePlacesResponse.ExchangePlacesList, exchangePlacesResponse.SkipToken);
        }
    }
}
