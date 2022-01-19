// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import AutoWrapperResponse from "../types/AutoWrapperResponse";
import getAxiosClient from "./AuthenticationService";

const getPlaceMaxReserved = async (
  id: string, start: string, end: string,
): Promise<number> => {
  const axios = await getAxiosClient();
  const request = await axios.get<AutoWrapperResponse<number>>(`/api/places/${id}/maxReserved`, {
    params: {
      start,
      end,
    },
  });
  return request.data.result;
};

export const getRoomAvailability = async (
  id: string, start: string, end: string,
): Promise<boolean> => {
  const axios = await getAxiosClient();
  const request = await axios.get<AutoWrapperResponse<boolean>>(`/api/places/${id}/availability`, {
    params: {
      start,
      end,
    },
  });
  return request.data.result;
};

export default getPlaceMaxReserved;
