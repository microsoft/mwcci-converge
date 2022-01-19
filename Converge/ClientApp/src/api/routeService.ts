// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import AutoWrapperResponse from "../types/AutoWrapperResponse";
import RouteResponse from "../types/RouteResponse";
import getAxiosClient from "./AuthenticationService";

const getRoute = async (start: string, end: string): Promise<RouteResponse> => {
  const axios = await getAxiosClient();
  const request = await axios.get<AutoWrapperResponse<RouteResponse>>(
    "/api/route/travelTime",
    { params: { start, end } },
  );
  return request.data.result;
};

export default getRoute;
