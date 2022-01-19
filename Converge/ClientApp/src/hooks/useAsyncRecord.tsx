// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import useRecord, { ItemRecord } from "./useRecord";

interface ItemState<T, E = void> {
  loading: boolean;
  item?: T | undefined | null;
  error?: E | unknown | null
}

type ItemRetrievalFunction<T> = (itemKey: string) =>
  Promise<T | undefined | null>;

type AsyncRecordModel<T, E = void> = [
  ItemRecord<ItemState<T, E>>,
  (imageKey: string) => Promise<void>
];

/**
 * Hook used to manage the state of a Record datastructure where
 * entries are updated asynchronously.
 *
 *
 * @param getItem async function that takes a record key and tracks its state as it is updated.
 * @returns the record state and a method used to trigger record updates by key asynchronously.
 */
const useAsyncRecord = <T, E = void>(
  getItem: ItemRetrievalFunction<T>,
): AsyncRecordModel<T, E> => {
  const [
    record,
    updateItem,
  ] = useRecord<ItemState<T, E>>();

  /**
   * Function used to request an update for the record with
   * the matching key.
   *
   * @param itemKey Key of the item to be updated.
   */
  const asyncUpdate = async (itemKey: string) => {
    // Provide loading state while retrieval takes place.
    updateItem(
      itemKey, {
        loading: true,
        item: undefined,
        error: null,
      },
    );
    try {
      // Update state when retrieval completes.
      const newItem = await getItem(itemKey);
      updateItem(itemKey, {
        loading: false,
        item: newItem,
        error: null,
      });
    } catch (error) {
      // Update state if an error occurs during the update.
      updateItem(itemKey, {
        loading: false,
        item: undefined,
        error: error as unknown | E,
      });
    }
  };

  return [
    record,
    asyncUpdate,
  ];
};

export default useAsyncRecord;
