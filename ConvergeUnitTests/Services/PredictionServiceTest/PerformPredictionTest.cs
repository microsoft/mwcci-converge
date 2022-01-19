// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Converge.Helpers;
using Converge.Models;
using Converge.Services;
using ConvergeUnitTests.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Graph;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConvergeUnitTests.Services.PredictionServiceTest
{
    [TestClass]
    public class PerformPredictionTest
    {
        private readonly Mock<IConfiguration> configurationMock;
        private readonly Mock<BuildingsMonoService> buildingsMonoSvcMock;
        private readonly Mock<TelemetryService> telemetryServiceMock;

        private readonly Mock<AppGraphService> appGraphSvcMock;
        private readonly AppGraphService appGraphService;
        private readonly PredictionService predictionService;

        private int maxPredictionWindow = 14;

        public PerformPredictionTest()
        {
            configurationMock = new Mock<IConfiguration>();
            configurationMock.Setup(a => a["MaxPredictionWindow"]).Returns(maxPredictionWindow.ToString());

            telemetryServiceMock = new Mock<TelemetryService>();

            appGraphSvcMock = new Mock<AppGraphService>();
            appGraphService = appGraphSvcMock.Object;

            buildingsMonoSvcMock = new Mock<BuildingsMonoService>();
            predictionService = new PredictionService(configurationMock.Object,
                                                        telemetryServiceMock.Object,
                                                        appGraphService,
                                                        buildingsMonoSvcMock.Object);
        }

        private List<User> GetSampleUsers(params string[] usersUpns)
        {
            string testFile = new StringBuilder(System.IO.Directory.GetCurrentDirectory() + @"\..\..\..\TestData\")
                                        .Append("SampleUsers_TestData.json").ToString();

            string testFileData = System.IO.File.ReadAllText(testFile);
            dynamic usersObject = JsonConvert.DeserializeObject(testFileData);
            dynamic usersArray = usersObject["users"];
            
            //Back to serialize to deserialize next to proper List<User> object.
            string backToJson = JsonConvert.SerializeObject(usersArray);
            List<User> testFileUsers = JsonConvert.DeserializeObject<List<User>>(backToJson);

            if (usersUpns != null)
            {
                List<User> sampleUsers = new List<User>();
                foreach (var upn in usersUpns)
                {
                    var user = testFileUsers.FirstOrDefault(x => x.UserPrincipalName.SameAs(upn));
                    sampleUsers.Add(user);
                }

                return sampleUsers;
            }

            return testFileUsers;
        }

        private WorkingHours GetSampleWorkingHours(string userUpn)
        {
            string testFile = new StringBuilder(System.IO.Directory.GetCurrentDirectory() + @"\..\..\..\TestData\")
                                        .Append("SampleWorkingHours_TestData.json").ToString();

            string testFileData = System.IO.File.ReadAllText(testFile);
            dynamic workingHoursObject = JsonConvert.DeserializeObject(testFileData);
            dynamic workingHoursCollection = workingHoursObject["workingHoursCollection"];

            //Back to serialize to deserialize next to proper List<User> object.
            string backToJson = JsonConvert.SerializeObject(workingHoursCollection);
            List<WorkingHoursJson> workingHoursAsList = JsonConvert.DeserializeObject<List<WorkingHoursJson>>(backToJson);

            WorkingHoursJson workingHoursForUser = workingHoursAsList.FirstOrDefault(whc => whc.UserEmail.SameAs(userUpn));
            return workingHoursForUser?.UserWorkingHours;
        }

        private List<Event> GetSampleEvents(string id)
        {
            string testFile = new StringBuilder(System.IO.Directory.GetCurrentDirectory() + @"\..\..\..\TestData\")
                                        .Append("SampleEvents_TestData.json").ToString();

            string testFileData = System.IO.File.ReadAllText(testFile);
            List<Event> eventsList = JsonConvert.DeserializeObject<List<Event>>(testFileData);

            return eventsList;
        }

        private List<string> GetPlacesFromEvents(List<Event> eventsList)
        {
            List<string> placeUpnsList = new List<string>();
            eventsList.Where(e => e.Location != null).Select(x => x.Location)
                        .Where(y => !string.IsNullOrWhiteSpace(y.UniqueId) && !string.IsNullOrWhiteSpace(y.LocationUri))
                        .ToList()
                        .ForEach(x =>
                        {
                            if (!x.LocationUri.OneAmong(placeUpnsList))
                            {
                                placeUpnsList.Add(x.LocationUri);
                            }
                        });

            return placeUpnsList;
        }

        private GraphExchangePlacesResponse GetSamplePlaces()
        {
            string testFile = new StringBuilder(System.IO.Directory.GetCurrentDirectory() + @"\..\..\..\TestData\")
                                        .Append("SamplePlaces_TestData.json").ToString();

            string testFileData = System.IO.File.ReadAllText(testFile);
            List<ExchangePlace> placesList = JsonConvert.DeserializeObject<List<ExchangePlace>>(testFileData);

            return new GraphExchangePlacesResponse(placesList);
        }

        private void TestPrediction(User user, Dictionary<string, ExchangePlace> placesDictionary, PredictionMetrics predictionMetrics)
        {
            WorkingHours workingHours = GetSampleWorkingHours(user.UserPrincipalName);

            DateTime today = DateTime.Now.Initialize(new TimeOfDay(0, 0, 0));
            string startDateTime = today.ToString("o");
            string endDateTime = today.AddDays(maxPredictionWindow).ToString("o");

            List<Event> sampleEvents = GetSampleEvents(user.Id);
            appGraphSvcMock.Setup(a => a.GetAllEvents(user.Id, startDateTime, endDateTime, "isCancelled eq false"))
                                        .Returns(() => Task.FromResult(sampleEvents));

            List<string> placeUpnsList = GetPlacesFromEvents(sampleEvents);
            GraphExchangePlacesResponse sampleExchangePlacesResponse = GetSamplePlaces();
            buildingsMonoSvcMock.Setup(a => a.GetPlacesByUpnsList(placeUpnsList, null, null, null))
                                        .Returns(() => Task.FromResult(sampleExchangePlacesResponse));

            appGraphSvcMock.Setup(a => a.GetConvergeCalendar(user.Id)).Returns(() => Task.FromResult<Calendar>(null));
            telemetryServiceMock.Setup(l => l.TrackEvent(It.IsAny<string>(), null));

            //Perform prediction for user.
            predictionService.PerformPrediction(user.Id, workingHours, placesDictionary, predictionMetrics).GetAwaiter().GetResult();
        }


        [TestMethod]
        public void Test_ConvergeUser_WithAllEvents_WithSuccess()
        {
            bool exceptionOccurred = false;
            PredictionMetrics predictionMetrics = new PredictionMetrics();
            Dictionary<string, ExchangePlace> placesDictionary = new Dictionary<string, ExchangePlace>();

            try
            {
                List<User> usersList = GetSampleUsers("admin@example.com");
                User user = usersList.FirstOrDefault();

                TestPrediction(user, placesDictionary, predictionMetrics);
            }
            catch
            {
                exceptionOccurred = true;
            }

            Assert.IsTrue(predictionMetrics.FailedUsersCount == 0 && !exceptionOccurred,
                            "Failure occurred, check the exceptions list on the predictionReponse for the details.");
        }

        [TestMethod]
        public void Test_ConvergeUser_WithNoEvents_WithSuccess()
        {
            bool exceptionOccurred = false;
            PredictionMetrics predictionMetrics = new PredictionMetrics();
            Dictionary<string, ExchangePlace> placesDictionary = new Dictionary<string, ExchangePlace>();
            try
            {
                List<User> usersList = GetSampleUsers("ChrisRigby@example.com");
                User user = usersList.FirstOrDefault();

                TestPrediction(user, placesDictionary, predictionMetrics);
            }
            catch
            {
                exceptionOccurred = true;
            }

            Assert.IsTrue(predictionMetrics.FailedUsersCount == 0 && !exceptionOccurred,
                            "Failure occurred, check the exceptions list on the predictionReponse for the details.");
        }

        [TestMethod]
        public void Test_ConvergeUser_ButExUser_WithFailure()
        {
            bool exceptionOccurred = false;
            PredictionMetrics predictionMetrics = new PredictionMetrics();
            Dictionary<string, ExchangePlace> placesDictionary = new Dictionary<string, ExchangePlace>();
            try
            {
                List<User> usersList = GetSampleUsers("Oda@example.com");
                User user = usersList.FirstOrDefault();

                try
                {
                    TestPrediction(user, placesDictionary, predictionMetrics);
                }
                catch (Exception ex)
                {
                    string previousMessage = predictionMetrics.ExceptionUser.ContainsKey(user.Id) ? predictionMetrics.ExceptionUser[user.Id] : string.Empty;
                    predictionMetrics.ExceptionUser[user.Id] = new StringBuilder(previousMessage + ex.Message + ". ").ToString();
                    predictionMetrics.ExceptionsList.Add(ex);
                }
            }
            catch
            {
                exceptionOccurred = true;
            }

            Assert.IsTrue(predictionMetrics.FailedUsersCount != 0 && !exceptionOccurred, "Something wrong if this didn't fail.");
        }

        [TestMethod]
        public void Test_NonConvergeUser_WithFailure()
        {
            bool exceptionOccurred = false;
            PredictionMetrics predictionMetrics = new PredictionMetrics();
            Dictionary<string, ExchangePlace> placesDictionary = new Dictionary<string, ExchangePlace>();
            try
            {
                List<User> usersList = GetSampleUsers("v-al@example.com");
                User user = usersList.FirstOrDefault();

                TestPrediction(user, placesDictionary, predictionMetrics);
            }
            catch
            {
                exceptionOccurred = true;
            }

            Assert.IsTrue(exceptionOccurred, "Something wrong if this didn't fail.");
        }

        [TestMethod]
        public void Test_AllSampleUsers_WithSuccess()
        {
            bool exceptionOccurred = false;
            PredictionMetrics predictionMetrics = new PredictionMetrics();
            Dictionary<string, ExchangePlace> placesDictionary = new Dictionary<string, ExchangePlace>();
            try
            {
                string[] users = new string[3]
                {
                    "admin@example.com",
                    "ChrisRigby@example.com",
                    "NAdriana@example.com"
                };

                List<User> usersList = GetSampleUsers(users);
                foreach (User user in usersList)
                {
                    try
                    {
                        TestPrediction(user, placesDictionary, predictionMetrics);
                    }
                    catch (Exception ex)
                    {
                        string previousMessage = predictionMetrics.ExceptionUser.ContainsKey(user.Id) ? predictionMetrics.ExceptionUser[user.Id] : string.Empty;
                        predictionMetrics.ExceptionUser[user.Id] = new StringBuilder(previousMessage + ex.Message + ". ").ToString();
                        predictionMetrics.ExceptionsList.Add(ex);
                    }
                }
            }
            catch
            {
                exceptionOccurred = true;
            }

            Assert.IsTrue(predictionMetrics.FailedUsersCount == 0 && !exceptionOccurred,
                            "Failure occurred, check the exceptions list on the predictionReponse for the details.");
        }
    }
}