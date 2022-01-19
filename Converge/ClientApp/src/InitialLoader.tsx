// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, useEffect } from "react";
import { Box, Loader } from "@fluentui/react-northstar";

const InitialLoader: React.FC = () => {
  const [message, setMessage] = useState("");
  const messages = [
    { message: "This will take a minute...", time: 0 },
    { message: "Processing your information...", time: 10000 },
    { message: "Syncing your calendar...", time: 30000 },
    { message: "Organizing your contacts...", time: 50000 },
  ];

  useEffect(() => {
    messages.forEach((item) => {
      setTimeout(() => {
        setMessage(item.message);
      }, item.time);
    });
  }, []);

  return (
    <Box styles={{
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1em 0",
      height: "100vh",
    }}
    >
      <Loader label={message} size="small" />
    </Box>
  );
};

export default InitialLoader;
