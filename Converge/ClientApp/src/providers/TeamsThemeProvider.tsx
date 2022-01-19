// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Provider,
  teamsTheme,
  ThemePrepared,
  mergeThemes,
} from "@fluentui/react-northstar";
import React, { useEffect, useState } from "react";
import defaultV2ThemeOverrides from "../themes";

/**
 * Pulls the theme from the host Teams instance and shoves it into
 * a Fluent UI theme provider.
 *
 * Requires a Teams context via {@link TeamsContextProvider}
 *
 * @param props Just standard React children
 */
const TeamsThemeProvider: React.FC = (props) => {
  const { children } = props;

  const [theme, setTheme] = useState<ThemePrepared<Record<string, unknown>>>(teamsTheme);

  useEffect(() => {
    setTheme(mergeThemes(
      teamsTheme,
      defaultV2ThemeOverrides,
    ));
  }, []);

  return (
    <Provider style={{ backgroundColor: "transparent" }} theme={theme}>
      {children}
    </Provider>
  );
};

export default TeamsThemeProvider;
