// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import CampusToCollaborate from "./CampusToCollaborate";
import QueryOption from "./QueryOption";

interface CampusesToCollaborateResponse {
  campusesToCollaborateList: CampusToCollaborate[];
  skipToken?: QueryOption;
}

export default CampusesToCollaborateResponse;
