// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useState } from "react";

export type ILoadingState = boolean;
type IPromiseResult<T> = T | undefined | null;
export type IPromiseError<E> = E | undefined | null | unknown;
type IAwaitPromiseFunction<T> = (promise: Promise<T>) => Promise<void>;

interface IPromiseState<T, E = unknown> {
  loading: ILoadingState;
  result: IPromiseResult<T>;
  error: IPromiseError<E>;
}

type IUsePromiseReturnType<T, E = unknown> = [
  ILoadingState,
  IPromiseResult<T>,
  IPromiseError<E>,
  IAwaitPromiseFunction<T>
]

/**
 * Hook used to elegantly handle asynchronous state in react.
 *
 * @param initialResult State populated as the initial result.
 * @returns Returns an array that contains state and update function.
 */
function usePromise<T, E = unknown>(
  initialResult?: IPromiseResult<T>,
  initialLoading = false,
): IUsePromiseReturnType<T, E> {
  const defaultState = {
    loading: initialLoading,
    result: initialResult,
    error: null,
  };
  const [promiseState, setPromiseState] = useState<IPromiseState<T>>(defaultState);

  async function awaitPromise(promise: Promise<T>) {
    // Set loading state while waiting.
    setPromiseState({
      loading: true,
      result: null,
      error: null,
    });
    try {
      // Store promise results into state.
      const promiseResult = await promise;
      setPromiseState({
        loading: false,
        result: promiseResult,
        error: null,
      });
    } catch (error) {
      // Set errors if they occur
      setPromiseState({
        loading: false,
        result: null,
        error: error as E,
      });
    }
  }

  return [
    promiseState.loading,
    promiseState.result,
    promiseState.error,
    awaitPromise,
  ];
}

export default usePromise;
