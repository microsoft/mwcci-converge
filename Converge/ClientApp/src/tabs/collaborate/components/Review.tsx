// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable camelcase */
import { Image, Flex, Box } from "@fluentui/react-northstar";
import React from "react";
import dayjs from "dayjs";
import YelpReview from "../../../types/Review";
import YelpStars from "../../workspace/components/yelp/YelpStars";
import ReviewStyles from "../styles/ReviewStyles";

interface Props {
  review: YelpReview;
}

const Review:React.FC<Props> = (props) => {
  const classes = ReviewStyles();
  const {
    review: {
      rating, user: { image_url, name }, text, time_created, url,
    },
  } = props;

  return (
    <Flex column gap="gap.small" className={classes.review} vAlign="center">
      <Flex gap="gap.small">
        <Box className={classes.flexBox}>
          <Box className={classes.imgCtr}>
            <Image
              className={classes.imgStyles}
              src={image_url}
              avatar
            />
          </Box>
        </Box>
        <span className={classes.name}>{name}</span>
      </Flex>
      <Flex gap="gap.small">
        <span>
          <YelpStars rating={rating} />
        </span>
        <span>{`${dayjs(time_created).format("MM/DD/YYYY")}`}</span>
      </Flex>
      <Box>
        {text}
        {text.endsWith("...")
           && (
           <a href={url} target="_blank" className={classes.link} rel="noreferrer">
             {" "}
             Read more
           </a>
           )}
      </Box>
    </Flex>
  );
};

export default Review;
