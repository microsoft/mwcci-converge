// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Converge.Models;
using Microsoft.Graph;
using Microsoft.Identity.Web;
using System.Net.Http.Headers;
using System.Threading.Tasks;

namespace Converge.Services
{
    public class ChatGraphService
    {
        private readonly GraphServiceClient graphServiceClient;
        private readonly ITokenAcquisition tokenAcquisition;

        public ChatGraphService(ITokenAcquisition tokenAcquisition)
        {
            this.tokenAcquisition = tokenAcquisition;

            var token = this.tokenAcquisition.GetAccessTokenForUserAsync(Constant.GraphChatScopes).GetAwaiter().GetResult();
            graphServiceClient = new GraphServiceClient(new DelegateAuthenticationProvider((requestMessage) =>
            {
                requestMessage
                    .Headers
                    .Authorization = new AuthenticationHeaderValue("bearer", token);

                return Task.FromResult(0);
            }));
        }
    }
}