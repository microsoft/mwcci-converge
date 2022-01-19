// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import createCachedQuery from "./CachedQuery";

interface ITestDataItem {
  id: string;
  name: string;
}

interface ITestCacheParams {
  timestamp: string;
}

const dummyData: ITestDataItem[] = [
  {
    id: "1",
    name: "Bob",
  },
  {
    id: "2",
    name: "Joe",
  },
  {
    id: "3",
    name: "Phil",
  },
  {
    id: "4",
    name: "Bubbles",
  },
  {
    id: "5",
    name: "Sally",
  },
  {
    id: "6",
    name: "Ricky",
  },
  {
    id: "7",
    name: "Lucy",
  },
  {
    id: "8",
    name: "Jill",
  },
  {
    id: "9",
    name: "Julian",
  },
  {
    id: "10",
    name: "Susy",
  },
];

function isTestDataItem(item: ITestDataItem) {
  return item && item.id && item.name;
}

const generateStoreKey = ({ name }: ITestDataItem, { timestamp }: ITestCacheParams) => `${name}-${timestamp}`;
const generateRetrievalKey = (search: string, { timestamp }: ITestCacheParams) => `${search}-${timestamp}`;

const findMisses = (
  missedKeys: string[],
) => Promise.resolve(missedKeys
  .map((key) => {
    const indexOfItem = dummyData.findIndex((item) => item.name === key);
    return dummyData[indexOfItem];
  }));

describe("createCachedQuery function", () => {
  const searchSet1 = [dummyData[8].name, dummyData[5].name, dummyData[6].name, dummyData[3].name];
  const searchSet2 = [dummyData[8].name, dummyData[0].name, dummyData[1].name];
  const params1 = { timestamp: "1990/10/16" };
  const params2 = { timestamp: "1992/10/16" };

  function generateMockCache() {
    // Function should be called every time an item is added to cache.
    const mockStoreKey = jest.fn(generateStoreKey);
    // Function should be called once for every searched item
    const mockRetrieveKey = jest.fn(generateRetrievalKey);
    /*
      Function should be called with array of searches strings that didn't hit cache and params.
      and only when items that miss cache are greater than 0
    */
    const mockFindMisses = jest.fn(findMisses);
    const createTestCache = () => createCachedQuery<ITestDataItem, ITestCacheParams>(
      mockStoreKey,
      mockRetrieveKey,
      mockFindMisses,
    );
    return {
      mockStoreKey,
      mockRetrieveKey,
      mockFindMisses,
      createTestCache,
    };
  }

  test("Add 6 news items, then check that all items have been added to the cache.", async () => {
    const {
      mockStoreKey,
      mockRetrieveKey,
      mockFindMisses,
      createTestCache,
    } = generateMockCache();

    const { getItems: getCachedItems } = createTestCache();
    const result = await getCachedItems(searchSet1, params1);

    expect(result.every(isTestDataItem)).toEqual(true);
    expect(result).toHaveLength(searchSet1.length);
    expect(mockRetrieveKey).toBeCalledTimes(searchSet1.length);
    expect(mockFindMisses).toBeCalledTimes(1);
    expect(mockFindMisses).toHaveBeenCalledWith(searchSet1, params1);
    expect(mockStoreKey).toBeCalledTimes(searchSet1.length);
  });

  test("Add items then query them again to see if they hit cache", async () => {
    const {
      mockStoreKey,
      mockRetrieveKey,
      mockFindMisses,
      createTestCache,
    } = generateMockCache();

    const { getItems: getCachedItems } = createTestCache();
    await getCachedItems(searchSet1, params1);
    const results2 = await getCachedItems(searchSet1, params1);

    expect(results2.every(isTestDataItem)).toEqual(true);
    expect(results2).toHaveLength(searchSet1.length);
    expect(mockRetrieveKey).toBeCalledTimes(searchSet1.length * 2);
    expect(mockFindMisses).toBeCalledTimes(1);
    expect(mockFindMisses).toHaveBeenCalledWith(searchSet1, params1);
    expect(mockStoreKey).toBeCalledTimes(searchSet1.length);
  });

  test("Add items then query them again with different params", async () => {
    const {
      mockStoreKey,
      mockRetrieveKey,
      mockFindMisses,
      createTestCache,
    } = generateMockCache();

    const { getItems: getCachedItems } = createTestCache();
    await getCachedItems(searchSet1, params1);
    const result = await getCachedItems(searchSet1, params2);

    expect(result.every(isTestDataItem)).toEqual(true);
    expect(result).toHaveLength(searchSet1.length);
    expect(mockRetrieveKey).toBeCalledTimes(searchSet1.length * 2);
    expect(mockFindMisses).toBeCalledTimes(2);
    expect(mockFindMisses).toHaveBeenCalledWith(searchSet1, params2);
    expect(mockStoreKey).toBeCalledTimes(searchSet1.length * 2);
  });

  test("Add items then add set of some new and some old to see if old items hit cache and new don't", async () => {
    const {
      mockStoreKey,
      mockRetrieveKey,
      mockFindMisses,
      createTestCache,
    } = generateMockCache();

    const { getItems: getCachedItems } = createTestCache();
    const numberNewItems = 2;
    await getCachedItems(searchSet1, params1);
    const result = await getCachedItems(searchSet2, params1);

    expect(result.every(isTestDataItem)).toEqual(true);
    expect(result).toHaveLength(searchSet2.length);
    expect(mockRetrieveKey).toBeCalledTimes(searchSet1.length + searchSet2.length);
    expect(mockFindMisses).toBeCalledTimes(2);
    expect(mockFindMisses).toHaveBeenCalledWith([
      dummyData[0].name,
      dummyData[1].name,
    ], params1);
    expect(mockStoreKey).toBeCalledTimes(searchSet1.length + numberNewItems);
  });

  test("Add items then query them again with different params, then again with original params", async () => {
    const {
      mockStoreKey,
      mockRetrieveKey,
      mockFindMisses,
      createTestCache,
    } = generateMockCache();
    const { getItems: getCachedItems } = createTestCache();

    await getCachedItems(searchSet1, params1);
    await getCachedItems(searchSet1, params2);
    const result = await getCachedItems(searchSet1, params1);

    expect(result.every(isTestDataItem)).toEqual(true);
    expect(result).toHaveLength(searchSet1.length);
    expect(mockRetrieveKey).toBeCalledTimes(searchSet1.length * 3);
    expect(mockFindMisses).toBeCalledTimes(2);
    expect(mockStoreKey).toBeCalledTimes(searchSet1.length * 2);
  });
});
