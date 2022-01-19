// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { MessageBar, MessageBarType } from "@fluentui/react";
import { Loader } from "@fluentui/react-northstar";
import React from "react";

interface AwaitProps {
  loading: boolean;
  error?: Error | null;
  ErrorComponent?: React.ComponentType<Error>;
  LoadingComponent?: React.ComponentType;
}

/**
 * Component used with usePromise hook to simplify
 * how asynchronous code is handled.
 */
const Await: React.FC<AwaitProps> = ({
  loading,
  error,
  ErrorComponent,
  LoadingComponent,
  children,
}) => {
  if (error) {
    return (
      ErrorComponent ? (
        <ErrorComponent
          name={error.name}
          message={error.message}
        />
      ) : (
        <DefaultErrorComponent
          name={error.name}
          message={error.message}
        />
      )
    );
  }
  if (loading) {
    return (
      LoadingComponent ? (
        <LoadingComponent />
      ) : (
        <DefaultLoadingComponent />
      )
    );
  }
  return <>{children}</>;
};

const DefaultErrorComponent: React.FC<Error> = ({ name, message }) => (
  <MessageBar messageBarType={MessageBarType.error} isMultiline>
    {name}
    &nbsp;
    {message}
  </MessageBar>
);

const DefaultLoadingComponent: React.FC = () => <Loader />;

export default Await;
