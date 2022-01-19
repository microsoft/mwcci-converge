// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useState } from "react";

export type ItemRecord<T> = Record<string, T>;

// First index is the record state, second index is function used to update records.
type RecordModel<T> = [
  ItemRecord<T>,
  (imageKey: string, entry: T) => void
]

/**
 * Hook that provides a consistent and controlled API for using
 * Record style JavaScript objects as state.
 */
const useRecord = <T extends unknown>():
  RecordModel<T> => {
  const [record, setRecord] = useState<ItemRecord<T>>({});

  /**
   * Function used to update the state of a particular record
   *
   * @param itemKey key of the record being updated.
   * @param entry value used to replace the existing record state.
   */
  const updateItem = (itemKey: string, entry: T) => {
    setRecord({
      ...record,
      [itemKey]: entry,
    });
  };

  return [
    record,
    updateItem,
  ];
};

export default useRecord;
