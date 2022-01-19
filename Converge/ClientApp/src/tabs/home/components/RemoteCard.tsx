// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from "react";
import {
  Box, Text, Image,
} from "@fluentui/react-northstar";
import WorkFromHome from "../WorkFromHome.svg";
import OutOfOffice from "../OutOfOffice.svg";
import RemoteCardStyles from "../styles/RemoteCardStyles";

interface Props {
  title: string;
  description: string;
}

const RemoteCard: React.FC<Props> = (props) => {
  const { title, description } = props;
  const classes = RemoteCardStyles();

  return (
    <Box className={classes.root}>
      <Text
        as="h2"
        content={title}
        className={classes.title}
      />
      <Text
        as="p"
        content={description}
        className={classes.description}
      />
      <Box className={classes.image}>
        {title === "Work from home" && <Image className={classes.imgStyles} src={WorkFromHome} />}
        {title === "Out of office" && <Image src={OutOfOffice} /> }
      </Box>
    </Box>
  );
};

export default RemoteCard;
