// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Converge.Helpers;
using Converge.Models;
using Microsoft.Graph;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Security.Principal;
using Converge.Models.Enums;

namespace Converge.Services
{
    public class BuildingsService
    {
        private readonly AppGraphService appGraphService;
        private readonly CachePlacesProviderService cachePlacesProviderService;
        private readonly PlacesService placesService;
        private readonly UserGraphService userGraphService;

        public BuildingsService(AppGraphService appGraphService,
                                CachePlacesProviderService cacheProviderService,
                                PlacesService placesService,
                                UserGraphService userGraphService)
        {
            this.appGraphService = appGraphService;
            this.cachePlacesProviderService = cacheProviderService;
            this.placesService = placesService;
            this.userGraphService = userGraphService;
        }

        private IIdentity principalUserIdentity = null;
        public void SetPrincipalUserIdentity(IIdentity userIdentity)
        {
            principalUserIdentity = userIdentity;
        }

        public async Task<BasicBuildingsResponse> GetBuildings(int? topCount = null, string skipTokenString = null)
        {
            topCount ??= 100;

            BasicBuildingsResponse buildingsResponse = cachePlacesProviderService.GetBuildings(topCount, skipTokenString);
            if (buildingsResponse == null)
            {
                CampusSortRequest buildingSortRequest = new CampusSortRequest(CampusSortByType.DisplayName, topCount.Value, skipTokenString);

                buildingsResponse = await GetBuildingsBySortRequest(buildingSortRequest);

                //Add to Cache.
                cachePlacesProviderService.AddBuildings(buildingsResponse, topCount, skipTokenString);
            }

            return buildingsResponse;
        }
        
        public async Task<BasicBuildingsResponse> GetBuildings(string sourceGeoCoordinates, double? distanceFromSource)
        {
            GPSCoordinates sourceGpsCoords = await DetermineSourceGpsCoordinates(sourceGeoCoordinates);
            if (sourceGpsCoords == null)
            {
                return new BasicBuildingsResponse(new List<BuildingBasicInfo>());
            }

            CampusSortRequest buildingSortRequest = new CampusSortRequest(CampusSortByType.Distance,
                                                                                sourceGpsCoords,
                                                                                distanceFromSource);

            return await GetBuildingsBySortRequest(buildingSortRequest);
        }

        private async Task<GPSCoordinates> DetermineSourceGpsCoordinates(string sourceGeoCoordinates)
        {
            GPSCoordinates sourceGpsCoords;
            //If the coords are not passed in the request, let's consider the user's current Location's Geo-Coords.
            if (sourceGeoCoordinates != null)
            {
                sourceGpsCoords = GPSCoordinates.FromString(sourceGeoCoordinates);
            }
            else
            {
                userGraphService.SetPrincipalUserIdentity(principalUserIdentity);
                try
                {
                    sourceGpsCoords = await userGraphService.GetCurrentUserCoordinates();
                }
                catch
                {
                    sourceGpsCoords = null;
                }
            }

            return sourceGpsCoords;
        }

        private async Task<BasicBuildingsResponse> GetBuildingsBySortRequest(CampusSortRequest buildingSortRequest)
        {
            List<Building> buildingsList = new List<Building>();

            GraphRoomsListResponse roomsListResponse = await appGraphService.GetRoomListsConstrained(buildingSortRequest);
            var roomsList = roomsListResponse.RoomsList.Where(r => r.AdditionalData != null && r.AdditionalData["emailAddress"] != null).ToList();
            if (roomsList.Count == 0)
            {
                return new BasicBuildingsResponse(new List<BuildingBasicInfo>());
            }

            GraphExchangePlacesResponse exchangePlacesResponse = await placesService.GetPlacesBySortRequest(buildingSortRequest);

            foreach (Place room in roomsList)
            {
                room.AdditionalData.TryGetValue("emailAddress", out object buildingObject);
                string buildingEmailAddress = Convert.ToString(buildingObject);
                if (string.IsNullOrWhiteSpace(buildingEmailAddress))
                {
                    continue;
                }
                buildingEmailAddress = buildingEmailAddress.Trim();

                //We need the Places list.
                var exchangePlacesList = exchangePlacesResponse.ExchangePlacesList
                                            .Where(p => p.Locality.SameAs(buildingEmailAddress)).ToList();
                //We just need one of the records to consume & set Building info.
                var exchangePlaceModel = exchangePlacesList.FirstOrDefault();
                if (exchangePlaceModel != null)
                {
                    buildingsList.Add(Building.Instantiate(exchangePlaceModel));
                }
            }

            //Now get the buildings sorted by the distance, when requested.
            if (buildingSortRequest.SortByType == CampusSortByType.Distance)
            {
                //Employed Haversine formula.
                buildingsList = buildingSortRequest.SortBuildingsByDistance(buildingsList);
            }
            else
            {
                buildingsList = buildingSortRequest.SortByName(buildingsList);
            }

            return new BasicBuildingsResponse(buildingsList.Select(b => new BuildingBasicInfo(b.Identity, b.DisplayName)).ToList(), roomsListResponse.SkipToken);
        }

        public async Task<List<BuildingBasicInfo>> GetBuildingsBasicInfo(List<string> buildingsUpnList)
        {
            List<BuildingBasicInfo> buildingsBasicInfoList = new List<BuildingBasicInfo>();

            if (buildingsUpnList == null || buildingsUpnList.All(x => string.IsNullOrWhiteSpace(x)))
            {
                return buildingsBasicInfoList;
            }

            List<Place> roomLists = await appGraphService.GetRoomListsCollectionByIds(buildingsUpnList);
            roomLists = roomLists.Where(r => r.AdditionalData != null && r.AdditionalData["emailAddress"] != null).ToList();
            if (roomLists.Count == 0)
            {
                return buildingsBasicInfoList;
            }

            foreach (Place room in roomLists)
            {
                room.AdditionalData.TryGetValue("emailAddress", out object buildingObject);
                string buildingEmailAddress = Convert.ToString(buildingObject);
                if (string.IsNullOrWhiteSpace(buildingEmailAddress))
                {
                    continue;
                }

                var buildingBasicInfo = new BuildingBasicInfo(buildingEmailAddress, room.DisplayName);
                buildingsBasicInfoList.Add(buildingBasicInfo);
            }

            return buildingsBasicInfoList;
        }

        public async Task<GraphExchangePlacesResponse> GetPlacesOfBuilding(string buildingUpn,
                                                                            PlaceType? placeType = null,
                                                                            int? topCount = null,
                                                                            string skipTokenString = null,
                                                                            ListItemFilterOptions listItemFilterOptions = null)
        {
            if (string.IsNullOrWhiteSpace(buildingUpn))
            {
                return new GraphExchangePlacesResponse(new List<ExchangePlace>(), null);
            }

            GraphExchangePlacesResponse exchangePlacesResponse = null;

            //Data when list-item-filter-options is defined, are not cached.
            if (listItemFilterOptions == null)
            {
                exchangePlacesResponse = cachePlacesProviderService.GetPlacesOfBuilding(buildingUpn, placeType, topCount, skipTokenString);
            }
            if (exchangePlacesResponse == null)
            {
                var buildingsUpnList = new List<string>() { buildingUpn };
                exchangePlacesResponse = await placesService.GetPlacesByBuildingUpns(buildingsUpnList, placeType, topCount, skipTokenString, listItemFilterOptions);
                if (exchangePlacesResponse.ExchangePlacesList == null || exchangePlacesResponse.ExchangePlacesList.Count() == 0)
                {
                    return new GraphExchangePlacesResponse(new List<ExchangePlace>(), null);
                }

                //Add to Cache.
                cachePlacesProviderService.AddPlacesOfBuilding(exchangePlacesResponse.ExchangePlacesList, placeType, topCount, skipTokenString);
            }

            return exchangePlacesResponse;
        }

        public async Task<ExchangePlace> GetPlaceByUpn(string placeUpn, PlaceType? placeType = null)
        {
            if (string.IsNullOrWhiteSpace(placeUpn))
            {
                return null;
            }

            ExchangePlace targetPlace = cachePlacesProviderService.GetPlaceByUpn(placeUpn, placeType);
            if (targetPlace == null)
            {
                GraphExchangePlacesResponse exchangePlacesResponse = await placesService.GetPlacesByPlaceUpns(new List<string>() { placeUpn }, placeType);
                //We expect only one entry of its kind.
                targetPlace = (exchangePlacesResponse.ExchangePlacesList != null && exchangePlacesResponse.ExchangePlacesList.Count() > 0) ?
                                                exchangePlacesResponse.ExchangePlacesList[0] : null;

                //Add to Cache.
                cachePlacesProviderService.AddPlaceByUpn(targetPlace, placeType);
            }
            return targetPlace;
        }

        public async Task<GraphExchangePlacesResponse> GetPlacesByUpnsList(List<string> placesUpnList, PlaceType? placeType = null, int? topCount = null, string skipTokenString = null)
        {
            GraphExchangePlacesResponse exchangePlacesResponse = cachePlacesProviderService.GetPlacesByUpnsList(placesUpnList, placeType, topCount, skipTokenString);
            if (exchangePlacesResponse == null)
            {
                exchangePlacesResponse = await placesService.GetPlacesByPlaceUpns(placesUpnList, placeType, topCount, skipTokenString);

                //Add to Cache.
                cachePlacesProviderService.AddPlacesByUpnsList(exchangePlacesResponse, placeType, topCount, skipTokenString);
            }

            return exchangePlacesResponse;
        }

        public async Task<ConvergeSchedule> GetWorkspacesScheduleForBuilding(string buildingUpn, string start, string end)
        {
            string nonNullEmail = buildingUpn ?? throw new ArgumentNullException(nameof(buildingUpn));
            string nonNullStartString = start ?? throw new ArgumentNullException(nameof(start));
            string nonNullEndString = end ?? throw new ArgumentNullException(nameof(end));

            GraphExchangePlacesResponse exchangePlacesResponse = await GetPlacesOfBuilding(nonNullEmail, PlaceType.Space);
            if (exchangePlacesResponse.ExchangePlacesList == null || exchangePlacesResponse.ExchangePlacesList.Count == 0)
            {
                return new ConvergeSchedule();
            }
            var buildingCapacity = exchangePlacesResponse.ExchangePlacesList.Sum(ws => ws.Capacity);
            if (buildingCapacity == 0)
            {
                return new ConvergeSchedule();
            }

            double reserved = 0;
            foreach (ExchangePlace workspace in exchangePlacesResponse.ExchangePlacesList)
            {
                double workspaceReserved = await placesService.GetReserved(workspace, nonNullStartString, nonNullEndString);
                reserved += workspaceReserved * ((double) workspace.Capacity / (double) buildingCapacity);
            }

            return new ConvergeSchedule
            {
                Reserved = reserved,
                Available = 100 - reserved,
            };
        }

        public async Task<BuildingSearchInfo> SearchForBuildings(string searchString, int? topCount = null, string skipTokenString = null)
        {
            List<BuildingBasicInfo> buildingsBasicInfoList = new List<BuildingBasicInfo>();
            
            if (string.IsNullOrWhiteSpace(searchString))
            {
                return new BuildingSearchInfo(buildingsBasicInfoList, null);
            }

            var skipToken = DeserializeHelper.QueryOption(skipTokenString);
            GraphRoomsListResponse roomListsResponse = await appGraphService.SearchRoomLists(searchString, topCount, skipToken);
            foreach (Place room in roomListsResponse.RoomsList)
            {
                room.AdditionalData.TryGetValue("emailAddress", out object buildingObject);
                string buildingEmailAddress = Convert.ToString(buildingObject);
                if (string.IsNullOrWhiteSpace(buildingEmailAddress) || buildingEmailAddress.OneAmong(buildingsBasicInfoList.Select(x => x.Identity)))
                {
                    continue;
                }

                var buildingBasicInfo = new BuildingBasicInfo(buildingEmailAddress, room.DisplayName);
                buildingsBasicInfoList.Add(buildingBasicInfo);
            }

            return new BuildingSearchInfo(buildingsBasicInfoList, roomListsResponse.SkipToken);
        }
    }
}
