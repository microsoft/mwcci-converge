// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

type SubEntityId = {
  [key: string]: string,
}

const DELIMITER_VALUES = ",";
const DELIMITER_KEYS = "*";

function serializeSubEntityId(subEntityId: SubEntityId): string {
  return Object.keys(subEntityId).reduce(
    (id, key) => {
      const value = subEntityId[key];
      let newId = id;
      if (id !== "") {
        newId += DELIMITER_VALUES;
      }
      newId += `${key}${DELIMITER_KEYS}${value}`;
      return newId;
    }, "",
  );
}

function createDeepLink(tab: string, subEntityId: SubEntityId, clientId:string): string {
  const encodedContext = encodeURI(`{"subEntityId": "${serializeSubEntityId(subEntityId)}"}`);
  return `https://teams.microsoft.com/l/entity/${clientId}/${tab}?context=${encodedContext}`;
}

export function deserializeSubEntityId(subEntityId: string): SubEntityId {
  return subEntityId
    .split(DELIMITER_VALUES)
    .reduce<SubEntityId>((seid, kvp) => {
      const copy = { ...seid };
      const [key, value] = kvp.split(DELIMITER_KEYS);
      copy[key] = value;
      return copy;
    }, {});
}

export default createDeepLink;
