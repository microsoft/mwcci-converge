// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Converge.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Converge.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/v1.0/groupChat")]
    public class GroupChatV1Controller : Controller
    {
        private readonly ChatGraphService graphChatService;

        public GroupChatV1Controller(ChatGraphService paramGraphChatService)
        {
            graphChatService = paramGraphChatService;
        }
    }
}
