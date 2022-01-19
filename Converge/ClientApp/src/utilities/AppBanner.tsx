// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { Alert } from "@fluentui/react-northstar";
import * as React from "react";
import { useAppSettingsProvider } from "../providers/AppSettingsProvider";

const AppBanner: React.FC = () => {
  const { appBanner } = useAppSettingsProvider().appSettings ?? {};

  return (
    <>
      {appBanner && (
        <Alert info>
          <span>{appBanner}</span>
        </Alert>
      )}
    </>

  );
};

export default AppBanner;
