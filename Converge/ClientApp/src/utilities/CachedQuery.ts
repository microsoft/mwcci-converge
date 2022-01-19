// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface CachedQuery<T, P = void> {
  getItems: (searchStrings: string[], params: P) => Promise<T[]>,
  forceUpdate: (missedKeys: string[], params: P) => Promise<T[]>;
}

/**
 * Returns a function that will first search a cache for results
 * and then use the given function to find the remaining items
 *
 * @param generateStoreKey function used to generate the key used to store a new item.
 * @param generateRetrievalKey function used to generate the key used to retrieve an item later.
 * @param findMisses function called with items not found in the cache.
 * @param initialCache Optional structure used to provide initial values in the cache.
 * @returns function that searches cache before calling findMisses for remaining values.
 */
function createCachedQuery<T, P = void>(
  generateStoreKey: (item: T, params: P) => string,
  generateRetrievalKey: (search: string, params: P) => string,
  findMisses: (replacedKeys: string[], params: P) => Promise<T[]>,
  initialCache?: Record<T[keyof T] & string, T>,
): CachedQuery<T, P> {
  const cache: Record<string, T> = { ...initialCache } ?? {};

  function addItemsToCache(items: T[], params: P) {
    items.forEach((item) => {
      const itemKey = generateStoreKey(item, params);
      cache[itemKey] = item;
    });
  }

  /**
   * function used to retrieve items from cache.
   *
   * @param searchStrings strings used to generate retrievalKey (usually item's unique identifier)
   * @param params custom params shared between searched items (date, location, etc)
   * @returns array where first index is found items and second index is cache misses
   */
  function getItemsFromCache(searchStrings: string[], params: P): [T[], string[]] {
    const cacheHits: T[] = [];
    const cacheMisses: string[] = [];
    searchStrings.forEach((search) => {
      const retrievalKey = generateRetrievalKey(search, params);
      if (cache[retrievalKey]) {
        cacheHits.push(cache[retrievalKey]);
      } else {
        cacheMisses.push(search);
      }
    });

    return [
      cacheHits,
      cacheMisses,
    ];
  }

  /**
   * Function used to retrieve items and update the cache.
   *
   * @param searchStrings strings used in searching and to generate keys
   * @param params custom params shared between searched items (date, location, etc)
   * @returns Returns items using findMisses functions after caching them.
   */
  async function updateItems(missedKeys: string[], params: P) {
    const retrievedItems = await findMisses(missedKeys, params);

    // Add the new items to the cache.
    addItemsToCache(retrievedItems, params);

    return retrievedItems;
  }

  /**
  * Function used to retrieve items from cache and return any misses
  * using findMisses function.
  *
  * @param searchStrings strings used to generate retrievalKey (usually item's unique identifier)
  * @param params custom params shared between searched items (date, location, etc)
  * @returns Array of items of type T
  */
  async function getItems(searchStrings: string[], params: P) {
    const [cacheHits, cacheMisses] = getItemsFromCache(searchStrings, params);

    const retrievedItems = cacheMisses.length > 0 ? await updateItems(cacheMisses, params) : [];

    return [
      ...cacheHits,
      ...retrievedItems,
    ];
  }

  return {
    getItems,
    forceUpdate: updateItems,
  };
}

export default createCachedQuery;
