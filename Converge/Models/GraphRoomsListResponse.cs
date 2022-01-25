// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Microsoft.Graph;
using System.Collections.Generic;

namespace Converge.Models
{
    public class GraphRoomsListResponse
    {
        public List<Place> RoomsList { get; set; }

        public GraphRoomsListResponse(List<Place> roomsList)
        {
            RoomsList = roomsList;
        }
    }
}
