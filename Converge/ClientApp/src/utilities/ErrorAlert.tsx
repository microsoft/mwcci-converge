// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, useEffect } from "react";
import { Alert, Box } from "@fluentui/react-northstar";

import { useProvider as errorAlertProvider } from "../providers/ErrorAlertProvider";

type IErrorMessageState = {
  message: string;
  id: string;
};

const ErrorAlert: React.FC = () => {
  const { errorState, errorDispatch } = errorAlertProvider();
  const [visible, setVisible] = useState<IErrorMessageState>({ message: "", id: "" });

  useEffect(() => {
    errorDispatch({
      type: "HIDE_ALERT",
      payload: { message: visible.message, id: visible.id },
    });
  }, [visible]);

  return (
    <>
      {
      errorState.messages.length > 0
      && errorState.messages.map((error) => (
        <Box styles={{
          display: "flex",
          flexDirection: "column",
          padding: "1em 0",
        }}
        >
          <Alert
            dismissible
            danger
            content={`${error.id} : ${error.message}`}
            key={error.id}
            onVisibleChange={() => setVisible(error)}
          />
        </Box>
      ))
    }
    </>
  );
};

export default ErrorAlert;
