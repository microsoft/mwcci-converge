// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as MicrosoftGraph from "@microsoft/microsoft-graph-types";

interface EventRecipient {
  name?: MicrosoftGraph.NullableOption<string>;
  emailAddress?: MicrosoftGraph.NullableOption<string>;
  type: MicrosoftGraph.AttendeeType
}

export default EventRecipient;
