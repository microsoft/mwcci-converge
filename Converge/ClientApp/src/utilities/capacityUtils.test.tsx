// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import capacityUtils from "./capacityUtils";
import Capacity from "../types/Capacity";

describe("The getCapacity method", () => {
  test("zero percent available is full", () => {
    expect(capacityUtils.getCapacity(0)).toBe(Capacity.Full);
  });
  test("100% available is Available", () => {
    expect(capacityUtils.getCapacity(100)).toBe(Capacity.Available);
  });
  test("30% available is Limited", () => {
    expect(capacityUtils.getCapacity(30)).toBe(Capacity.Limited);
  });
  test("10% available is Full", () => {
    expect(capacityUtils.getCapacity(10)).toBe(Capacity.Full);
  });
  test("11% available is Limited", () => {
    expect(capacityUtils.getCapacity(11)).toBe(Capacity.Limited);
  });
  test("31% available is Available", () => {
    expect(capacityUtils.getCapacity(31)).toBe(Capacity.Available);
  });
});
