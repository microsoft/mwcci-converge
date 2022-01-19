// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Dispatch,
  Reducer, useCallback, useReducer, useRef,
} from "react";

function useEnhancedReducer<S, A>(
  reducer: Reducer<S, A>,
  initState: S,
  initializer?: A | null | undefined,
): [S, Dispatch<A>, () => S] {
  const lastState = useRef(initState);
  const getState = useCallback(() => lastState.current, []);
  return [
    ...useReducer<S, A>(
      (state, action) => {
        lastState.current = reducer(state, action);
        return lastState.current;
      },
      initState,
      initializer,
    ),
    getState,
  ];
}

export default useEnhancedReducer;
