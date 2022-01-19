// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Converge.Helpers;
using Converge.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Graph;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Converge.Services
{
    public class PlacesService
    {
        /// <summary>
        /// Logs errors and information.
        /// </summary>
        private readonly ILogger<PlacesService> logger;
        private readonly IConfiguration configuration;
        private readonly AppGraphService appGraphService;
        private readonly ScheduleService scheduleService;

        public PlacesService(ILogger<PlacesService> logger, 
                                IConfiguration configuration, 
                                AppGraphService appGraphService, 
                                ScheduleService scheduleService)
        {
            this.logger = logger ?? throw new ArgumentNullException(nameof(logger));
            this.configuration = configuration;
            this.appGraphService = appGraphService;
            this.scheduleService = scheduleService;
        }

        public async Task<int> GetMaxReserved(string upn, string start, string end)
        {
            return await scheduleService.GetMaxReserved(start, end, upn);
        }

        public async Task<bool> GetAvailability(string upn, string start, string end)
        {
            return await scheduleService.GetAvailability(start, end, upn);
        }

        public async Task<double> GetReserved(ExchangePlace workspace, string start, string end)
        {
            return await scheduleService.GetReserved(start, end, workspace);
        }

        public async Task<GraphExchangePlacesResponse> GetPlacesBySortRequest(CampusSortRequest buildingSortRequest, PlaceType? placeType = null)
        {
            GraphListItemsResponse graphListItemsResponse = await appGraphService.GetListItemsBySortRequest(buildingSortRequest, placeType);

            GraphExchangePlacesResponse exchangePlacesResponse = CollectExchangePlaces(graphListItemsResponse);
            return exchangePlacesResponse;
        }

        private GraphExchangePlacesResponse CollectExchangePlaces(GraphListItemsResponse graphListItemsResponse)
        {
            if (graphListItemsResponse == null || graphListItemsResponse.GraphListItems == null || graphListItemsResponse.GraphListItems.Count == 0)
            {
                return new GraphExchangePlacesResponse(new List<ExchangePlace>(), null);
            }

            List<GraphExchangePlace> exchangePlacesList = new List<GraphExchangePlace>();

            object p = new object();
            Parallel.ForEach(graphListItemsResponse.GraphListItems, gli =>
            {
                ExchangePlace place = DeserializeHelper.DeserializeExchangePlace(gli.ListItem.Fields.AdditionalData, logger);
                place.SharePointID = gli.ListItem.Fields.Id;

                if (string.IsNullOrWhiteSpace(place.Building))
                {
                    Place targetRoom = appGraphService.GetRoomListById(place.Locality).Result;
                    place.Building = targetRoom?.DisplayName;
                }

                lock (p)
                {
                    exchangePlacesList.Add(new GraphExchangePlace(place, gli.OrderRank));
                }
            });

            //The parallel execution above would have disrupted the actual order, let's reset that back.
            exchangePlacesList = exchangePlacesList.OrderBy(x => x.OrderRank).ToList();

            return new GraphExchangePlacesResponse(exchangePlacesList, graphListItemsResponse.SkipToken);
        }

        public async Task<GraphExchangePlacesResponse> GetPlacesByBuildingUpns(
            List<string> roomListsIdentifiers, 
            PlaceType? placeType = null, 
            int? topCount = null, 
            string skipTokenString = null,
            ListItemFilterOptions listItemFilterOptions = null)
        {
            QueryOption skipToken = DeserializeHelper.QueryOption(skipTokenString);
            GraphListItemsResponse graphListItemsResponse = await appGraphService.GetListItemsByRoomListIds(roomListsIdentifiers, placeType, topCount, skipToken, listItemFilterOptions);

            GraphExchangePlacesResponse exchangePlacesResponse = CollectExchangePlaces(graphListItemsResponse);
            return exchangePlacesResponse;
        }

        public async Task<GraphExchangePlacesResponse> GetPlacesByPlaceUpns(List<string> placeUpnsList, PlaceType? placeType = null, int? topCount = null, string skipTokenString = null)
        {
            QueryOption skipToken = DeserializeHelper.QueryOption(skipTokenString);
            GraphListItemsResponse graphListItemsResponse = await appGraphService.GetListItemsByPlaceUpns(placeUpnsList, placeType, topCount, skipToken);

            GraphExchangePlacesResponse exchangePlacesResponse = CollectExchangePlaces(graphListItemsResponse);
            return exchangePlacesResponse;
        }

        public async Task<GraphExchangePlacesResponse> GetPlacesByPlaceType(PlaceType? placeType = null, int? topCount = null, string skipTokenString = null)
        {
            QueryOption skipToken = DeserializeHelper.QueryOption(skipTokenString);
            GraphListItemsResponse listItemsResponse = await appGraphService.GetListItemsByPlaceType(placeType, topCount, skipToken);

            GraphExchangePlacesResponse exchangePlacesResponse = CollectExchangePlaces(listItemsResponse);
            return exchangePlacesResponse;
        }

        public async Task<ExchangePlace> GetPlace(string placeUpn, DateTime start, DateTime end)
        {
            ExchangePlace targetPlace = null;
            if (string.IsNullOrWhiteSpace(placeUpn))
            {
                return targetPlace;
            }

            GraphExchangePlacesResponse exchangePlacesResponse = await GetPlacesByPlaceUpns(new List<string>() { placeUpn });
            //Since only one Place is expected, lets refer by its index.
            targetPlace = exchangePlacesResponse.ExchangePlacesList[0];
            if (targetPlace != null)
            {
                if (targetPlace.Type == PlaceType.Space)
                {
                    int maxReserved = await scheduleService.GetMaxReserved(start, end, targetPlace.Identity);
                    targetPlace.AvailableSlots = targetPlace.Capacity - maxReserved;
                }
                else if (targetPlace.Type == PlaceType.Room)
                {
                    bool available = await scheduleService.GetAvailability(start, end, targetPlace.Identity);
                    targetPlace.AvailableSlots = available ? targetPlace.Capacity : 0;
                }
            }
            return targetPlace;
        }

        public async Task<List<ExchangePlacePhoto>> GetPlacePhotos(string placeSharePointID)
        {
            string sharePointSiteId = configuration["SharePointSiteId"];
            string sharePointPhotoListId = configuration["SharePointPhotoListId"];
            List photosList = await appGraphService.GetList(sharePointSiteId, sharePointPhotoListId);
            List<ExchangePlacePhoto> result = new List<ExchangePlacePhoto>();
            if (photosList != null)
            {
                List<ListItem> photoItems = await appGraphService.GetPhotoItems(sharePointSiteId, photosList.Id, placeSharePointID);
                if (photoItems != null)
                {
                    foreach (ListItem photoItem in photoItems)
                    {
                        string type = DeserializeHelper.GetProperty("PhotoType", photoItem.Fields.AdditionalData);
                        string photoUrl = await appGraphService.GetPhotoUrl(sharePointSiteId, photosList.Id, photoItem.Fields.Id);
                        ExchangePlacePhoto photo = new ExchangePlacePhoto();
                        switch (type)
                        {
                            case "FloorPlan":
                                photo.PhotoType = PhotoType.FloorPlan;
                                break;
                            case "Cover":
                                photo.PhotoType = PhotoType.Cover;
                                break;
                            case "Photo":
                                photo.PhotoType = PhotoType.Photo;
                                break;
                        }
                        photo.URL = photoUrl;
                        result.Add(photo);
                    }
                }
            }
            return result;
        }
    }
}
