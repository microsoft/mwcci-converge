// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Alert } from "@fluentui/react-northstar";
import React from "react";

interface ErrorComponentProps {
  error: unknown;
}

/*
  errorMessage should only be used if renderError is
  undefined as renderError overrides errorMessage
*/
type ErrorBoundaryProps = {
  renderError?: (error: unknown) => React.ReactElement<ErrorComponentProps>;
  errorMessage?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: unknown;
}

/*
  Wrap components with this error boundary to ensure app doesn't
  crash if component encounters error during runtime.

  You can also provide a component or message to render when a runtime error is encountered.
*/
class ErrorBoundary extends React.Component<
ErrorBoundaryProps,
ErrorBoundaryState
> {
  private static DEFAULT_ERROR_MESSAGE = "Oops! Something broke!";

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI.
    return {
      hasError: true,
      error,
    };
  }

  private dismissAction = () => {
    this.setState({
      hasError: false,
      error: undefined,
    });
  }

  render(): React.ReactNode {
    const { children, renderError, errorMessage } = this.props;
    const { hasError, error } = this.state;

    if (hasError) {
      return (renderError?.(error) ?? (
        <Alert
          danger
          content={errorMessage ?? ErrorBoundary.DEFAULT_ERROR_MESSAGE}
          dismissible
          onVisibleChange={this.dismissAction}
        />
      ));
    }

    return children;
  }
}

export default ErrorBoundary;
