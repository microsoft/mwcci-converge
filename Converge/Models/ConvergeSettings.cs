// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using System;
using System.Collections.Generic;

namespace Converge.Models
{
    public class ConvergeSettings
    {
        public List<string> PreferredBuildings { get; set; }

        public string ZipCode { get; set; }

        public GPSCoordinates GeoCoordinates { get; set; }

        public bool IsConvergeUser { get; set; }

        public List<string> MyList { get; set; }

        public List<string> LikedSections { get; set; }

        public List<string> DislikedSections { get; set; }

        public DateTime? LastNPSDate { get; set; }

        /// <summary>
        /// This is a list of Yelp IDs.
        /// </summary>
        public List<string> FavoriteVenuesToCollaborate { get; set; }

        /// <summary>
        /// This is a list of identities that correspond to workspaces or conference rooms.
        /// </summary>
        public List<string> FavoriteCampusesToCollaborate { get; set; }

        public DateTime? ConvergeInstalledDate { get; set; }

        public List<string> RecentBuildingUpns { get; set; }
    }
}
