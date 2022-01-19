// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Flex } from "@fluentui/react-northstar";
import React from "react";
import VenueToCollaborate from "../../../types/VenueToCollaborate";

interface Props {
  place: VenueToCollaborate;
}

const VenueEventTitle:React.FC<Props> = (props) => {
  const {
    place,
  } = props;
  return (
    <Flex gap="gap.large" vAlign="center">
      <h1>
        {place.venueName}
      </h1>
      <span>{place.venueAddress}</span>
    </Flex>
  );
};

export default VenueEventTitle;
