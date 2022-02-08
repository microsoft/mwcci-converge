// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Converge.Models;
using Converge.Services;
using Microsoft.Graph;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ConvergeUnitTests.Services
{
    [TestClass]
    public class SyncServiceTest
    {
        [TestMethod]
        public void TestGetAllGraphPlaces_NoRoomLists()
        {
            // Arrange
            var telemetryService = new Mock<TelemetryService>();
            var appGraphService = new Mock<AppGraphService>();
            var bingMapService = new Mock<SearchBingMapsService>();
            var cachePlacesProviderService = new Mock<CachePlacesProviderService>();
            appGraphService.Setup(x => x.GetAllRoomLists()).Returns(() => Task.FromResult(new List<Place>()));
            SyncService syncService = new SyncService(
                telemetryService.Object, 
                appGraphService.Object, 
                bingMapService.Object,
                cachePlacesProviderService.Object
            );

            // Act
            List<GraphPlace> places = syncService.GetAllGraphPlaces().GetAwaiter().GetResult();

            // Assert
            CollectionAssert.AreEqual(new List<GraphPlace>(), places, "No places should be returned if no room lists exist.");
        }

        [TestMethod]
        public void TestGetAllGraphPlaces_NoWorkspacesNoConferenceRooms()
        {
            // Arrange
            var telemetryService = new Mock<TelemetryService>();
            var appGraphService = new Mock<AppGraphService>();
            var bingMapService = new Mock<SearchBingMapsService>();
            var cachePlacesProviderService = new Mock<CachePlacesProviderService>();
            appGraphService.Setup(x => x.GetAllRoomLists()).Returns(() => Task.FromResult(new List<Place>
                {
                    It.IsAny<Place>()
                }));
            appGraphService.Setup(x => x.GetAllWorkspaces(It.IsAny<string>())).Returns(() => Task.FromResult(new List<GraphPlace>()));
            appGraphService.Setup(x => x.GetAllConferenceRooms(It.IsAny<string>())).Returns(() => Task.FromResult(new List<GraphPlace>()));
            SyncService syncService = new SyncService(telemetryService.Object, appGraphService.Object, bingMapService.Object, cachePlacesProviderService.Object);

            // Act
            List<GraphPlace> places = syncService.GetAllGraphPlaces().GetAwaiter().GetResult();

            // Assert
            CollectionAssert.AreEqual(new List<GraphPlace>(), places, "No places should be returned if no room list has places.");
        }

        [TestMethod]
        public void TestGetAllGraphPlaces_WorkspacesAndConferenceRoomsAreFlattened()
        {
            // Arrange
            var telemetryService = new Mock<TelemetryService>();
            var appGraphService = new Mock<AppGraphService>();
            var bingMapService = new Mock<SearchBingMapsService>();
            var cachePlacesProviderService = new Mock<CachePlacesProviderService>();

            string testRoomListEmail1 = "roomList1@example.com";
            string testRoomListEmail2 = "roomList2example.com";
            Place room1 = JsonConvert.DeserializeObject<Place>($"{{ \"emailAddress\": \"{testRoomListEmail1}\" }}");
            Place room2 = JsonConvert.DeserializeObject<Place>($"{{ \"emailAddress\": \"{testRoomListEmail2}\" }}");

            appGraphService.Setup(x => x.GetAllRoomLists()).Returns(() => Task.FromResult(new List<Place>
                {
                    room1,
                    room2
                }));

            var workspace = new Mock<GraphPlace>();
            workspace.SetupGet(ws => ws.EmailAddress).Returns("workspace@example.com");
            var conferenceRoom = new Mock<GraphPlace>();
            conferenceRoom.SetupGet(cr => cr.EmailAddress).Returns("conferenceRoom@example.com");

            appGraphService.Setup(x => x.GetAllWorkspaces(testRoomListEmail1)).Returns(() => Task.FromResult(new List<GraphPlace> { workspace.Object }));
            appGraphService.Setup(x => x.GetAllConferenceRooms(testRoomListEmail2)).Returns(() => Task.FromResult(new List<GraphPlace> { conferenceRoom.Object }));
            SyncService syncService = new SyncService(telemetryService.Object, appGraphService.Object, bingMapService.Object, cachePlacesProviderService.Object);

            // Act
            List<GraphPlace> places = syncService.GetAllGraphPlaces().GetAwaiter().GetResult();

            // Assert
            CollectionAssert.AreEqual(new List<GraphPlace> { workspace.Object, conferenceRoom.Object }, places, "No places should be returned if no room list has places.");
        }

        [TestMethod]
        public void TestGetSharePointPlacesToUpdate_NoGraphOrSharePointPlaces()
        {
            // Arrange
            List<GraphPlace> graphPlaces = new List<GraphPlace>();
            List<ExchangePlace> exchangePlaces = new List<ExchangePlace>();
            var telemetryService = new Mock<TelemetryService>();
            var appGraphService = new Mock<AppGraphService>();
            var bingMapService = new Mock<SearchBingMapsService>();
            var cachePlacesProviderService = new Mock<CachePlacesProviderService>();
            var syncService = new SyncService(telemetryService.Object, appGraphService.Object, bingMapService.Object, cachePlacesProviderService.Object);

            // Act
            List<ListItem> placesToUpdate = syncService.GetSharePointPlacesToUpdate(graphPlaces, exchangePlaces);

            // Assert
            CollectionAssert.AreEqual(new List<ListItem>(), placesToUpdate, "There are no places to update.");
        }

        [TestMethod]
        public void TestGetSharePointPlacesToUpdate_NoGraphPlaces()
        {
            // Arrange
            List<GraphPlace> graphPlaces = new List<GraphPlace>();
            List<ExchangePlace> exchangePlaces = new List<ExchangePlace> { new Mock<ExchangePlace>().Object };
            var telemetryService = new Mock<TelemetryService>();
            var appGraphService = new Mock<AppGraphService>();
            var bingMapService = new Mock<SearchBingMapsService>();
            var cachePlacesProviderService = new Mock<CachePlacesProviderService>();
            var syncService = new SyncService(telemetryService.Object, appGraphService.Object, bingMapService.Object, cachePlacesProviderService.Object);

            // Act
            List<ListItem> placesToUpdate = syncService.GetSharePointPlacesToUpdate(graphPlaces, exchangePlaces);

            // Assert
            CollectionAssert.AreEqual(new List<ListItem>(), placesToUpdate, "There are no places to update.");
        }

        [TestMethod]
        public void TestGetSharePointPlacesToUpdate_GraphPlacesNotInSharePoint()
        {
            // Arrange
            List<GraphPlace> graphPlaces = new List<GraphPlace>
            {
                new GraphPlace
                {
                    EmailAddress = "workspace@example.com"
                }
            };
            List<ExchangePlace> exchangePlaces = new List<ExchangePlace>();
            var telemetryService = new Mock<TelemetryService>();
            var appGraphService = new Mock<AppGraphService>();
            var bingMapService = new Mock<SearchBingMapsService>();
            var cachePlacesProviderService = new Mock<CachePlacesProviderService>();
            var syncService = new SyncService(telemetryService.Object, appGraphService.Object, bingMapService.Object, cachePlacesProviderService.Object);

            // Act
            List<ListItem> placesToUpdate = syncService.GetSharePointPlacesToUpdate(graphPlaces, exchangePlaces);

            // Assert
            placesToUpdate.FirstOrDefault().Fields.AdditionalData.TryGetValue("EmailAddress", out object updatedEmail);
            Assert.AreEqual("workspace@example.com", updatedEmail, "All Graph places not in SharePoint should be updated");
        }

        [TestMethod]
        public void TestGetSharePointPlacesToUpdate_NewDataFromGraph()
        {
            // Arrange
            List<GraphPlace> graphPlaces = new List<GraphPlace>
            {
                new GraphPlace
                {
                    EmailAddress = "workspace@example.com",
                    Capacity = 20,
                }
            };
            List<ExchangePlace> exchangePlaces = new List<ExchangePlace>
            {
                new ExchangePlace
                {
                    Identity = "workspace@example.com",
                    Capacity = 10,
                }
            };
            var telemetryService = new Mock<TelemetryService>();
            var appGraphService = new Mock<AppGraphService>();
            var bingMapService = new Mock<SearchBingMapsService>();
            var cachePlacesProviderService = new Mock<CachePlacesProviderService>();
            var syncService = new SyncService(telemetryService.Object, appGraphService.Object, bingMapService.Object, cachePlacesProviderService.Object);

            // Act
            // fix this
            List<ListItem> placesToUpdate = syncService.GetSharePointPlacesToUpdate(graphPlaces, exchangePlaces);

            // Assert
            placesToUpdate.FirstOrDefault().Fields.AdditionalData.TryGetValue("Capacity", out object updatedCapacity);
            Assert.AreEqual(updatedCapacity, 20, "The SharePoint place capacity should be updated");
            Assert.AreEqual(1, placesToUpdate.Count, "Only one place should be updated");
        }
    }
}
