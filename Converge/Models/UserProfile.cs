// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

namespace Converge.Models
{
    public class UserProfile
    {
        public ApiPresence Presence { get; set; }

        public byte[] UserPhoto { get; set; }

        public UserProfile(ApiPresence presence, byte[] userPhoto)
        {
            Presence = presence;
            UserPhoto = userPhoto;
        }
    }
}
