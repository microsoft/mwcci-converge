// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useReducer } from "react";

type IErrorMessageState = {
  message: string;
  id: string;
};

type IToastAction =
  {type: "SET_ERROR_ALERT"; payload: IErrorMessageState}
  | {type: "HIDE_ALERT"; payload: IErrorMessageState}

type IErrorState = {
  messages: IErrorMessageState[]
};

const emptyState: IErrorState = {
  messages: [],
};

const actions = {
  SET_ERROR_ALERT: "SET_ERROR_ALERT",
  HIDE_ALERT: "HIDE_ALERT",
};

type IContextModel = {
  errorState: IErrorState;
  errorDispatch: React.Dispatch<IToastAction>;
};

const Context = React.createContext({} as IContextModel);

const reducer = (errorState: IErrorState, action: IToastAction) => {
  let updatedState = { ...errorState };

  switch (action.type) {
    case actions.SET_ERROR_ALERT:
      updatedState = {
        messages: [...updatedState.messages, action.payload],
      };
      break;
    case actions.HIDE_ALERT:
      updatedState = {
        ...updatedState,
        messages: updatedState.messages.filter((item) => item.id !== action.payload.id),
      };
      break;
    default:
      break;
  }

  return { ...updatedState };
};

const ErrorAlertProvider: React.FC = ({ children }) => {
  const [errorState, errorDispatch] = useReducer(reducer, emptyState);
  return (
    <Context.Provider value={{ errorState, errorDispatch }}>
      {children}
    </Context.Provider>
  );
};

const useProvider = (): IContextModel => React.useContext(Context);

const helpers = {
  getDefaultToastObject: (message: string, id: string): IErrorMessageState => ({
    message,
    id,
  }),
};

export {
  ErrorAlertProvider, useProvider, helpers,
};
