// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ThemePrepared, teamsTheme } from "@fluentui/react-northstar";
import defaultSiteVariables from "./teams-v2/site-variables";

const defaultV2ThemeOverrides: Partial<ThemePrepared> = {
  siteVariables: {
    ...teamsTheme.siteVariables,
    ...defaultSiteVariables,
  },
};

export default defaultV2ThemeOverrides;
