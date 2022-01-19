// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import YelpUser from "./YelpUser";

interface YelpReview {
  id: string;
  rating: number;
  text: string;
  // eslint-disable-next-line camelcase
  time_created: string;
  url: string;
  user: YelpUser;
}

export default YelpReview;
