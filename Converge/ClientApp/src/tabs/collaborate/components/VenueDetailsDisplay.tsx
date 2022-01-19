// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  AcceptIcon,
} from "@fluentui/react-icons-northstar";
import {
  Box, Divider, Flex,
} from "@fluentui/react-northstar";
import { Icon } from "office-ui-fabric-react";
import React from "react";
import VenueDetails from "../../../types/VenueDetails";
import VenueToCollaborate from "../../../types/VenueToCollaborate";
import OperationHours from "../../workspace/components/OperationHours";
import VenueDetailsDisplayStyles from "../styles/VenueDetailsDisplayStyles";

interface Props {
  place: VenueToCollaborate;
  details: VenueDetails;
}

const VenueDetailsDisplay:React.FC<Props> = (props) => {
  const { place, details } = props;
  const classes = VenueDetailsDisplayStyles();

  return (
    <Box className={classes.contact}>
      <ul>
        {place.venueAddress && (
        <li>
          <Icon iconName="POI" />
          {place.venueAddress}
        </li>
        )}

        {place.phoneNumber && (
        <li>
          <Icon iconName="Phone" />
          <span>{place.phoneNumber}</span>
        </li>
        )}
        {details.operatingHours && (
          <OperationHours operatingHours={details.operatingHours} />
        )}
        <li>
          {place.transactions?.map((t) => (
            <span>
              <AcceptIcon size="small" className={classes.acceptIcon} />
              {`${t.slice(0, 1).toUpperCase()}${t.slice(1)}`}
            </span>
          ))}
        </li>
      </ul>
      <Divider />
      <Flex vAlign="center">
        Data from:
        {" "}
        <a href="https://www.yelp.com" className={classes.link}>Yelp</a>
      </Flex>
    </Box>
  );
};

export default VenueDetailsDisplay;
