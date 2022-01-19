// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const AddRecentBuildings = (
  recentBuildings: string[] | undefined,
  buildingUpn: string,
)
: string[] => {
  const updatedRecentBuildings = recentBuildings ? [...recentBuildings] : [];
  if (!updatedRecentBuildings?.find((val) => val === buildingUpn)) {
    updatedRecentBuildings.push(buildingUpn);
    if (updatedRecentBuildings.length > 3) {
      updatedRecentBuildings.shift();
    }
  }
  return updatedRecentBuildings;
};

export default AddRecentBuildings;
