// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Converge.Helpers;
using Converge.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Graph;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;

namespace Converge.Services
{
    public class PlacesMonoService
    {
        /// <summary>
        /// Logs errors and information.
        /// </summary>
        private readonly ILogger logger;
        private readonly IConfiguration configuration;
        private readonly AppGraphService appGraphService;

        public PlacesMonoService(ILogger<PlacesMonoService> logger, IConfiguration configuration, AppGraphService appGraphService)
        {
            this.logger = logger ?? throw new ArgumentNullException(nameof(logger));
            this.configuration = configuration;
            this.appGraphService = appGraphService;
        }

        public async Task<List<ExchangePlace>> GetAllPlaces()
        {
            string sharePointSiteId = configuration["SharePointSiteId"];
            string sharePointListId = configuration["SharePointListId"];
            List placesList = await appGraphService.GetList(sharePointSiteId, sharePointListId);
            if (placesList == null)
            {
                this.logger.LogInformation(string.Format(CultureInfo.InvariantCulture, "Places list is empty for SharePoint site Id {0} and SharePoint list id {1}.", sharePointSiteId, sharePointListId));
                return new List<ExchangePlace>();
            }
            List<ListItem> listItems = await appGraphService.GetListItems(sharePointSiteId, placesList.Id);
            List<ExchangePlace> places = new List<ExchangePlace>();
            foreach (ListItem listItem in listItems)
            {
                ExchangePlace place = DeserializeHelper.DeserializeExchangePlace(listItem.Fields.AdditionalData, this.logger);
                place.SharePointID = listItem.Fields.Id;
                places.Add(place);
            }
            return places.ToList();
        }
    }
}
