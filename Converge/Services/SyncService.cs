// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Converge.Helpers;
using Converge.Models;
using Microsoft.Graph;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Converge.Services
{
    public class SyncService
    {
        private readonly TelemetryService telemetryService;
        private readonly AppGraphService appGraphService;
        private readonly SearchBingMapsService searchBingMapsService;
        private readonly CachePlacesProviderService cachePlacesProviderService;

        public SyncService(
            TelemetryService telemetryService, 
            AppGraphService appGraphService, 
            SearchBingMapsService searchBingMapsSvc,
            CachePlacesProviderService cachePlacesProviderService)
        {
            this.telemetryService = telemetryService;
            this.appGraphService = appGraphService;
            this.searchBingMapsService = searchBingMapsSvc;
            this.cachePlacesProviderService = cachePlacesProviderService;
        }

        /// <summary>
        /// Fetches all the workspaces and conference rooms per building available in Graph for this tenant.
        /// </summary>
        /// <returns>A list of Graph Places.</returns>
        public async Task<List<GraphPlace>> GetAllGraphPlaces()
        {
            try
            {
                List<Place> roomLists = await appGraphService.GetAllRoomLists();
                cachePlacesProviderService.AddBuildings(new BasicBuildingsResponse(roomLists.Select(rl => new BuildingBasicInfo(rl.AdditionalData["emailAddress"].ToString(),rl.DisplayName)).ToList()));
                List<GraphPlace> allGraphPlaces = new List<GraphPlace>();
                foreach (Place roomList in roomLists)
                {
                    string roomListEmailAddress = DeserializeAdditionalData.GetStringProperty(roomList.AdditionalData, "emailAddress");
                    if (!string.IsNullOrEmpty(roomListEmailAddress))
                    {
                        try
                        {
                            List<GraphPlace> workspaces = await appGraphService.GetAllWorkspaces(roomListEmailAddress);
                            allGraphPlaces.AddRange(workspaces);
                        } catch (Exception e)
                        {
                            telemetryService.TrackException(e);
                        }
                        try
                        {
                            List<GraphPlace> conferenceRooms = await appGraphService.GetAllConferenceRooms(roomListEmailAddress);
                            allGraphPlaces.AddRange(conferenceRooms);
                        } catch (Exception e)
                        {
                            telemetryService.TrackException(e);
                        }

                    }
                }
                return allGraphPlaces;
            } 
            catch (Exception e)
            {
                telemetryService.TrackException(e);
                return new List<GraphPlace>();
            }
        }

        /// <summary>
        /// Compares Graph places to SharePoint places and returns places that need to be updated in SharePoint.
        /// </summary>
        /// <param name="graphPlaces">The places found in Graph.</param>
        /// <param name="sharePointPlaces">The places found in SharePoint.</param>
        /// <returns></returns>
        public List<ListItem> GetSharePointPlacesToUpdate(List<GraphPlace> graphPlaces, List<ExchangePlace> sharePointPlaces)
        {
            List<ListItem> result = new List<ListItem>();

            if (graphPlaces.Count == 0)
            {
                return result;
            }

            IDictionary<string, ExchangePlace> sharePointPlaceIndex = new Dictionary<string, ExchangePlace>();
            foreach (ExchangePlace place in sharePointPlaces)
            {
                if (!string.IsNullOrEmpty(place.Identity) && !sharePointPlaceIndex.TryGetValue(place.Identity.ToLower(), out _))
                {
                    sharePointPlaceIndex.Add(place.Identity.ToLower(), place);
                }
            }

            foreach (GraphPlace graphPlace in graphPlaces)
            {
                bool exists = sharePointPlaceIndex.TryGetValue(graphPlace.EmailAddress.ToLower(), out ExchangePlace exchangePlace);

                if (!exists)
                {
                    SyncGraphExchangePlace(graphPlace, new ExchangePlace(), out ListItem updatedPlace);
                    result.Add(updatedPlace);
                }
                else
                {
                    bool shouldUpdate = SyncGraphExchangePlace(graphPlace, exchangePlace, out ListItem updatedPlace);
                    if (shouldUpdate)
                    {
                        result.Add(updatedPlace);
                    }
                }
            }

            return result;
        }

        /// <summary>
        /// Provides an updated SharePoint list item with any new data that exists on the Graph Place that does not exist in SharePoint.
        /// </summary>
        /// <param name="graphPlace">The place in Graph.</param>
        /// <param name="exchangePlace">The place stored in SharePoint.</param>
        /// <param name="updatedPlace">The ListItem with updated fields in additional data.</param>
        /// <returns></returns>
        private bool SyncGraphExchangePlace(GraphPlace graphPlace, ExchangePlace exchangePlace, out ListItem updatedPlace)
        {
            IDictionary<string, object> additionalData = new Dictionary<string, object>();
            if (!string.IsNullOrEmpty(graphPlace.EmailAddress) && !graphPlace.EmailAddress.SameAs(exchangePlace.Identity))
            {
                additionalData.Add("EmailAddress", graphPlace.EmailAddress);
            }
            if (!string.IsNullOrEmpty(graphPlace.Building) && !graphPlace.Building.SameAs(exchangePlace.Building))
            {
                additionalData.Add("Building", graphPlace.Building);
            }
            if (graphPlace.FloorNumber?.ToString() != exchangePlace.Floor && graphPlace.FloorNumber?.ToString() != "0")
            {
                additionalData.Add("Floor", graphPlace.FloorNumber.ToString());
            }
            if (!string.IsNullOrEmpty(graphPlace.Label) && !graphPlace.Label.SameAs(exchangePlace.Label))
            {
                additionalData.Add("Label", graphPlace.Label);
            }
            if (graphPlace.Capacity != exchangePlace.Capacity)
            {
                additionalData.Add("Capacity", graphPlace.Capacity);
            }
            if (graphPlace.BookingType != exchangePlace.BookingType)
            {
                string bookingType = "Unknown";
                switch (graphPlace.BookingType)
                {
                    case BookingType.Reserved:
                        bookingType = "Reserved";
                        break;
                    case BookingType.Standard:
                        bookingType = "Standard";
                        break;
                }
                additionalData.Add("BookingType", bookingType);
            }
            if (graphPlace.IsWheelChairAccessible != exchangePlace.IsWheelChairAccessible)
            {
                additionalData.Add("IsWheelChairAccessible", graphPlace.IsWheelChairAccessible == true ? "True" : "False");
            }
            if ((graphPlace.Tags != null && exchangePlace.Tags is null) && (graphPlace.Tags.Count > 0))
            {
                additionalData.Add("Tags", string.Join(",", graphPlace.Tags));
            }
            if (graphPlace.Tags != null && exchangePlace.Tags != null && string.Join("", graphPlace.Tags) != string.Join("", exchangePlace.Tags))
            {
                additionalData.Add("Tags", string.Join(",", graphPlace.Tags));
            }
            if (graphPlace.SpaceType != exchangePlace.Type)
            {
                additionalData.Add("PlaceType", graphPlace.SpaceType == PlaceType.Space ? "Space" : "Room");
            }
            if (!string.IsNullOrEmpty(graphPlace.AudioDeviceName) && !graphPlace.AudioDeviceName.SameAs(exchangePlace.AudioDeviceName))
            {
                additionalData.Add("AudioDeviceName", graphPlace.AudioDeviceName);
            }
            if (!string.IsNullOrEmpty(graphPlace.VideoDeviceName) && !graphPlace.VideoDeviceName.SameAs(exchangePlace.VideoDeviceName))
            {
                additionalData.Add("VideoDeviceName", graphPlace.VideoDeviceName);
            }
            if (!string.IsNullOrEmpty(graphPlace.DisplayDeviceName) && !graphPlace.DisplayDeviceName.SameAs(exchangePlace.DisplayDeviceName))
            {
                additionalData.Add("DisplayDeviceName", graphPlace.DisplayDeviceName);
            }
            if (!string.IsNullOrEmpty(graphPlace.Locality) && !graphPlace.Locality.SameAs(exchangePlace.Locality))
            {
                additionalData.Add("Locality", graphPlace.Locality);
            }
            if (!string.IsNullOrEmpty(graphPlace.DisplayName) && !graphPlace.DisplayName.SameAs(exchangePlace.DisplayName))
            {
                additionalData.Add("Title", graphPlace.DisplayName);
                additionalData.Add("Name", graphPlace.DisplayName);
            }
            if (!string.IsNullOrEmpty(graphPlace.Phone) && graphPlace.Phone != exchangePlace.Phone)
            {
                additionalData.Add("Phone", graphPlace.Phone);
            }
            if (graphPlace.Address != null)
            {
                if (!string.IsNullOrEmpty(graphPlace.Address.City) && !graphPlace.Address.City.SameAs(exchangePlace.City))
                {
                    additionalData.Add("City", graphPlace.Address.City);
                }
                if (!string.IsNullOrEmpty(graphPlace.Address.CountryOrRegion) && !graphPlace.Address.CountryOrRegion.SameAs(exchangePlace.CountryOrRegion))
                {
                    additionalData.Add("CountryOrRegion", graphPlace.Address.CountryOrRegion);
                }
                if (!string.IsNullOrEmpty(graphPlace.Address.PostalCode) && graphPlace.Address.PostalCode != exchangePlace.PostalCode)
                {
                    additionalData.Add("PostalCode", graphPlace.Address.PostalCode);
                }
                if (!string.IsNullOrEmpty(graphPlace.Address.State) && !graphPlace.Address.State.SameAs(exchangePlace.State))
                {
                    additionalData.Add("State", graphPlace.Address.State);
                }
                if (!string.IsNullOrEmpty(graphPlace.Address.Street) && !graphPlace.Address.Street.SameAs(exchangePlace.Street))
                {
                    additionalData.Add("Street", graphPlace.Address.Street);
                }
                if (graphPlace.GeoCoordinates != null && graphPlace.GeoCoordinates.Latitude != null && graphPlace.GeoCoordinates.Longitude != null)
                {
                    double latitude = Convert.ToDouble(graphPlace.GeoCoordinates.Latitude);
                    double longitude = Convert.ToDouble(graphPlace.GeoCoordinates.Longitude);
                    additionalData.Add("Latitude", $"{latitude}");
                    additionalData.Add("Longitude", $"{longitude}");
                }
                else if (string.IsNullOrEmpty(exchangePlace.GeoCoordinates))
                {
                    string errorMsg = $"Error while trying to get GPS co-ordinates from Graph for {exchangePlace.Identity}";
                    try
                    {
                        GPSCoordinates gpsCoordinates = searchBingMapsService.GetGeoCoordsForAnAddress(graphPlace.Address.Street, graphPlace.Address.City, graphPlace.Address.State, graphPlace.Address.PostalCode)
                                .Result;
                        if (gpsCoordinates != null)
                        {
                            additionalData.Add("Latitude", $"{gpsCoordinates.Latitude}");
                            additionalData.Add("Longitude", $"{gpsCoordinates.Longitude}");
                        }
                    }
                    catch(Exception e)
                    {
                        telemetryService.TrackException(e, errorMsg);
                    }
                }
            }
            updatedPlace = new ListItem { 
                Id = exchangePlace.SharePointID,
                Fields = new FieldValueSet
                {
                    AdditionalData = additionalData,
                }
            };
            return additionalData.Count > 0;
        }
    }
}
