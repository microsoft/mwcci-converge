// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Converge.Services;
using Microsoft.Graph;
using Converge.Models;
using Microsoft.Extensions.Configuration;

namespace Converge.Jobs
{
    /// <summary>
    /// This job runs daily to sync any new data coming from Graph as the source of truth.
    /// If data exists in SharePoint (either a field on a place or the whole place) and does not
    /// exist in Graph then the SharePoint data is not removed.
    /// </summary>
    public class PlaceSyncJob : JobService
    {
        private readonly TelemetryService telemetryService;
        private readonly AppGraphService appGraphService;
        private readonly SyncService syncService;
        private readonly PlacesMonoService placesMonoService;
        private readonly IConfiguration configuration;

        public PlaceSyncJob(
            IScheduleConfig<PlaceSyncJob> config,
            TelemetryService telemetryService,
            AppGraphService appGraphService,
            SyncService syncService,
            PlacesMonoService placesMonoService,
            IConfiguration configuration
        ) : base(config.CronExpression, config.TimeZoneInfo)
        {
            this.telemetryService = telemetryService;
            this.appGraphService = appGraphService;
            this.syncService = syncService;
            this.placesMonoService = placesMonoService;
            this.configuration = configuration;
        }

        public override Task StartAsync(CancellationToken cancellationToken)
        {
            telemetryService.TrackEvent("PlaceSync starts.");
            return base.StartAsync(cancellationToken);
        }

        public async override Task DoWork(CancellationToken cancellationToken)
        {
            telemetryService.TrackEvent("PlaceSync is working.");
            string siteId = configuration["SharePointSiteId"];
            string listId = configuration["SharePointListId"];
            try
            {
                List<GraphPlace> graphPlaces = await syncService.GetAllGraphPlaces();
                List<ExchangePlace> sharePointPlaces = await placesMonoService.GetAllPlaces();
                List<ListItem> updatedSharePointPlaces = syncService.GetSharePointPlacesToUpdate(graphPlaces, sharePointPlaces);
                foreach (ListItem listItem in updatedSharePointPlaces)
                {
                    try
                    {
                        ListItem li = listItem;
                        if (li.Id is null)
                        {
                            li = await appGraphService.CreateListItem(siteId, listId, new ListItem());
                            string newPlacesAvailableByDefault = configuration["NewPlacesAvailableByDefault"];
                            if (!string.IsNullOrEmpty(newPlacesAvailableByDefault) && newPlacesAvailableByDefault == "False")
                            {
                                listItem.Fields.AdditionalData.Add("IsAvailable", "False");
                            }
                            else
                            {
                                listItem.Fields.AdditionalData.Add("IsAvailable", "True");
                            }
                        } 
                        await appGraphService.UpdateListItemFields(siteId, listId, li.Id, new FieldValueSet { AdditionalData = listItem.Fields.AdditionalData }); 

                    } catch (Exception e)
                    {
                        telemetryService.TrackException(e);
                    }
                }
            }
            catch (Exception e)
            {
                telemetryService.TrackException(e);
                return;
            }
        }

        public override Task StopAsync(CancellationToken cancellationToken)
        {
            telemetryService.TrackEvent("Place Sync Ends.");
            return base.StopAsync(cancellationToken);
        }
    }
}
