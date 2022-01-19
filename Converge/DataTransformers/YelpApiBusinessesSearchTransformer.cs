// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Converge.Models;
using Converge.Services;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Converge.DataTransformers
{
    public class YelpApiBusinessesSearchTransformer : BaseDataTransformer
    {
        public static async Task<List<VenuesToCollaborate>> Transform(SearchBingMapsService searchBingMapsService, string venuesJson)
        {
            var deserializedObject = JsonConvert.DeserializeObject<dynamic>(venuesJson);
            IEnumerable<dynamic> businessesTag = deserializedObject["businesses"];

            List<VenuesToCollaborate> venuesToCollaborateList = new List<VenuesToCollaborate>();
            foreach (dynamic business in businessesTag)
            {
                VenuesToCollaborate venueToCollaborate = await YelpApiBusinessTransformer.Transform(searchBingMapsService, business);
                venuesToCollaborateList.Add(venueToCollaborate);
            };

            return venuesToCollaborateList;
        }
    }
}
