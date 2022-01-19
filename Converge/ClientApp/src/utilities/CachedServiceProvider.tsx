// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useContext } from "react";
import usePromise from "../hooks/usePromise";
import { CachedQuery } from "./CachedQuery";

type CachedServiceProvider = React.FC;
type GetFunction<P> = (searchStrings: string[], params: P) => Promise<void>;
type UpdateFunction<P> = (searchStrings: string[], params: P) => Promise<void>;

type UseCachedServiceHook<T, P = void> = () => [
  boolean,
  T[] | undefined | null,
  unknown,
  GetFunction<P>,
  UpdateFunction<P>
];
type CachedServiceProviderReturnType<T, P = void> = [
  CachedServiceProvider,
  UseCachedServiceHook<T, P>
];

/**
 * Function that generates context provider and hook for cached queries
 *
 * @param cachedService cached query service being modeled.
 * @returns Returns provider and hook to access cached query state.
 */
const createCachedServiceProvider = <T, P = void>(
  cachedService: CachedQuery<T, P>,
): CachedServiceProviderReturnType<T, P> => {
  const Context = React.createContext<CachedQuery<T, P>>(cachedService);

  const CachedServiceProvider: React.FC = ({ children }) => {
    const value = useContext(Context);
    return (
      <Context.Provider value={value}>
        {children}
      </Context.Provider>
    );
  };

  const useCachedService: UseCachedServiceHook<T, P> = () => {
    const { getItems, forceUpdate } = useContext(Context);
    const [
      loading,
      result,
      error,
      waitFor,
    ] = usePromise<T[]>();

    const get = (
      searchStrings: string[],
      params: P,
    ) => waitFor(getItems(searchStrings, params));

    const update = (
      searchStrings: string[],
      params: P,
    ) => waitFor(forceUpdate(searchStrings, params));

    return [
      loading,
      result,
      error,
      get,
      update,
    ];
  };

  return [
    CachedServiceProvider,
    useCachedService,
  ];
};

export default createCachedServiceProvider;
