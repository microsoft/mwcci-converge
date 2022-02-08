// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Converge.Models;
using Converge.Services;
using Microsoft.Graph;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Converge.Jobs
{
    public class LocationPredictorJob : JobService
    {
        private readonly TelemetryService telemetryService;
        private readonly AppGraphService appGraphService;
        private readonly PredictionService predictionService;

        public LocationPredictorJob(IScheduleConfig<LocationPredictorJob> config,
                                    TelemetryService telemetryService,
                                    AppGraphService appGraphService,
                                    PredictionService predictionService)
            : base(config.CronExpression, config.TimeZoneInfo)
        {
            this.telemetryService = telemetryService;
            this.appGraphService = appGraphService;
            this.predictionService = predictionService;
        }

        public override Task StartAsync(CancellationToken cancellationToken)
        {
            telemetryService.TrackEvent("LocationPredictor starts.");
            return base.StartAsync(cancellationToken);
        }

        public async override Task DoWork(CancellationToken cancellationToken)
        {
            Stopwatch timePerRun = Stopwatch.StartNew();
            telemetryService.TrackEvent($"LocationPredictor is working.");

            List<User> users;
            try
            {
                users = await appGraphService.GetConvergeUsers();
            }
            catch (Exception ex)
            {
                telemetryService.TrackException(ex, "Failed to get converge users.");
                return;
            }
            if (users == null || users.Count == 0)
            {
                timePerRun.Stop();
                telemetryService.TrackEvent("Users not found", "Location Predictor Job found no Users.", timePerRun.ElapsedMilliseconds);
                return;
            }

            CheckAndUninstallUsers(users);
            users.RemoveAll(u => u.Extensions == null);

            PredictionMetrics predictionMetrics = new PredictionMetrics();
            Dictionary<string, ExchangePlace> placesDictionary = new Dictionary<string, ExchangePlace>();

            foreach (User user in users)
            {
                try
                {
                    WorkingHours workingHours = await appGraphService.GetWorkingHours(user.UserPrincipalName);

                    //Perform prediction for each user.
                    await predictionService.PerformPrediction(user.Id, workingHours, placesDictionary, predictionMetrics);
                }
                catch (Exception ex)
                {
                    string previousMessage = predictionMetrics.ExceptionUser.ContainsKey(user.Id) ? predictionMetrics.ExceptionUser[user.Id] : string.Empty;
                    predictionMetrics.ExceptionUser[user.Id] = new StringBuilder(previousMessage + ex.Message + ". ").ToString();
                    predictionMetrics.ExceptionsList.Add(ex);
                }
            }

            if (predictionMetrics.FailedUsersCount > 0)
            {
                predictionMetrics.SummaryCount.Add("failedUsersCount", predictionMetrics.FailedUsersCount);
                predictionMetrics.SummaryCount.Add("totalUsersCount", users.Count);

                telemetryService.TrackException(new Exception("Location Predictor Job Failure"),
                                                "Prediction failed for users.",
                                                predictionMetrics.ExceptionUser,
                                                predictionMetrics.SummaryCount);
                foreach (var exception in predictionMetrics.ExceptionsList)
                {
                    telemetryService.TrackException(exception);
                }
            }

            timePerRun.Stop();
            telemetryService.TrackEvent("LocationPredictor completed.", "Time Elapsed", timePerRun.ElapsedMilliseconds);
        }

        private void CheckAndUninstallUsers(List<User> users)
        {
            int uninstallFailureCount = 0;
            Dictionary<string, double> summaryCount = null;
            Dictionary<string, string> usersExceptions = new Dictionary<string, string>();

            try
            {
                object locker = new object();
                Parallel.ForEach(users, user =>
                {
                    try
                    {
                        bool isConvergeInstalled = appGraphService.IsConvergeInstalled(user.UserPrincipalName).Result;
                        if (!isConvergeInstalled)
                        {
                            UninstallUser(user.UserPrincipalName).Wait();
                            user.Extensions = null;

                            // cleanup and log
                            this.telemetryService.TrackEvent(TelemetryService.USER_UNINSTALLED_CONVERGE, "UserPrincipalName", user.UserPrincipalName);
                        }
                    }
                    catch (Exception e)
                    {
                        lock (locker)
                        {
                            uninstallFailureCount++;
                            usersExceptions.Add("User", user.UserPrincipalName + " - " + e.Message);
                        }
                    }
                });
            }
            catch (AggregateException ae)
            {
                summaryCount = new Dictionary<string, double>
                {
                    {"failedUsersCount", uninstallFailureCount},
                    {"totalUsersCount", users.Count}
                };
                telemetryService.TrackException(ae, "Uninstall failed for users.", usersExceptions, summaryCount);
            }
        }

        private async Task UninstallUser(string upn)
        {
            await appGraphService.DeleteExtensions(upn);
            await appGraphService.DeleteConvergeCalendar(upn);
        }

        public override Task StopAsync(CancellationToken cancellationToken)
        {
            telemetryService.TrackEvent("LocationPredictor is stopping.");
            return base.StopAsync(cancellationToken);
        }
    }
}
