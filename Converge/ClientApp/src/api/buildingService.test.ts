// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import CampusToCollaborate from "../types/CampusToCollaborate";
import { generatePlaceDetailsRetrievalKey, generatePlaceDetailsStoreKey } from "./buildingService";

const dummyData: CampusToCollaborate[] = [
  {
    availableSlots: 12,
    identity: "Campus1Building1",
    displayName: "Campus 1 Building 1",
    street: "Campus1Street",
    city: "CampusTown",
    state: "Campington",
    postalCode: "98124",
    countryOrRegion: "Campusopolis",
    phone: "12345678901",
    capacity: 24,
    building: "Building 1",
    label: "C1B1",
    audioDeviceName: "Campus one Building one",
    videoDeviceName: "Campus one Building one",
    displayDeviceName: "Campus one Building one",
    floor: "1",
    tags: ["Campus 1", "Building 1", "Floor 1"],
    locality: "UTC",
    sharePointID: "Campus1Building1",
  },
  {
    availableSlots: 8,
    identity: "Campus1Building2",
    displayName: "Campus 1 Building 2",
    street: "Campus1Street",
    city: "CampusTown",
    state: "Campington",
    postalCode: "98124",
    countryOrRegion: "Campusopolis",
    phone: "12345678902",
    capacity: 34,
    building: "Building 2",
    label: "C1B2",
    audioDeviceName: "Campus one Building two",
    videoDeviceName: "Campus one Building two",
    displayDeviceName: "Campus one Building two",
    floor: "1",
    tags: ["Campus 1", "Building 2", "Floor 1"],
    locality: "UTC",
    sharePointID: "Campus1Building2",
  },
  {
    availableSlots: 16,
    identity: "Campus2Building1",
    displayName: "Campus 2 Building 1",
    street: "Campus2Street",
    city: "CampusTown",
    state: "Campington",
    postalCode: "98124",
    countryOrRegion: "Campusopolis",
    phone: "12345678903",
    capacity: 24,
    building: "Building 1",
    label: "C2B1",
    audioDeviceName: "Campus two Building one",
    videoDeviceName: "Campus two Building one",
    displayDeviceName: "Campus two Building one",
    floor: "2",
    tags: ["Campus 2", "Building 1", "Floor 2"],
    locality: "UTC",
    sharePointID: "Campus2Building1",
  },
];

describe("place details caching dependencies", () => {
  const firstItem = dummyData[0];
  const secondItem = dummyData[1];

  const originalDateRange = {
    start: new Date("2021-12-17T03:15:00"),
    end: new Date("2021-12-17T05:15:00"),
  };
  const matchingDateRange = {
    start: new Date("2021-12-17T03:50:00"),
    end: new Date("2021-12-17T05:50:00"),
  };
  const nonMatchingDateRange = {
    start: new Date("2021-12-17T04:50:00"),
    end: new Date("2021-12-17T06:50:00"),
  };

  const originalStoreKey = generatePlaceDetailsStoreKey(firstItem, originalDateRange);
  const matchingStoreKey = generatePlaceDetailsStoreKey(firstItem, matchingDateRange);
  const nonMatchingDateStoreKey = generatePlaceDetailsStoreKey(firstItem, nonMatchingDateRange);
  const nonMatchingCampusStoreKey = generatePlaceDetailsStoreKey(secondItem, matchingDateRange);

  const originalRetrievalKey = generatePlaceDetailsRetrievalKey(
    firstItem.identity,
    originalDateRange,
  );
  const matchRetrievalKey = generatePlaceDetailsRetrievalKey(
    firstItem.identity,
    matchingDateRange,
  );
  const nonMatchDateRetrievalKey = generatePlaceDetailsRetrievalKey(
    firstItem.identity,
    nonMatchingDateRange,
  );
  const nonMatchingCampusRetrievalKey = generatePlaceDetailsRetrievalKey(
    secondItem.identity,
    matchingDateRange,
  );

  test("Expect retrieval key with same params to match storeKey.", () => {
    expect(originalRetrievalKey).toBe(originalStoreKey);
  });

  test("Buildings with same storekey and but different minute on date still return same key.", () => {
    expect(matchingStoreKey).toBe(originalStoreKey);
    expect(matchingStoreKey).toBe(originalRetrievalKey);
  });

  test("Expect store key with different hours to not match.", () => {
    expect(nonMatchingDateStoreKey).not.toBe(originalStoreKey);
    expect(nonMatchingDateStoreKey).not.toBe(originalRetrievalKey);
  });

  test("Expect store key with different campus to not match.", () => {
    expect(nonMatchingCampusStoreKey).not.toBe(originalStoreKey);
    expect(nonMatchingCampusStoreKey).not.toBe(originalRetrievalKey);
  });

  test("Expect retrieval key with same hour to match.", () => {
    expect(matchRetrievalKey).toBe(originalStoreKey);
    expect(matchRetrievalKey).toBe(originalRetrievalKey);
  });

  test("Expect retrieval key with different hour to not match.", () => {
    expect(nonMatchDateRetrievalKey).not.toBe(originalStoreKey);
    expect(nonMatchDateRetrievalKey).not.toBe(originalRetrievalKey);
  });

  test("Expect retrieval key with different campus to not match.", () => {
    expect(nonMatchingCampusRetrievalKey).not.toBe(originalStoreKey);
    expect(nonMatchingCampusRetrievalKey).not.toBe(originalRetrievalKey);
  });
});
