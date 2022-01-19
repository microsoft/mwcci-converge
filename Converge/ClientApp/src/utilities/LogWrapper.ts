// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as microsoftTeams from "@microsoft/teams-js";
import { ApplicationInsights } from "@microsoft/applicationinsights-web";
import { ReactPlugin } from "@microsoft/applicationinsights-react-js";
import {
  COLLABORATE_COUNT, DESCRIPTION, IMPORTANT_ACTION, OVERLAP_PERCENTAGE, VIRALITY_MEASURE,
} from "../types/LoggerTypes";
import Settings from "../types/Settings";
import EventProperty from "../types/EventProperty";

let appInsights: ApplicationInsights;
const reactPlugin = new ReactPlugin();

const setup = (context: microsoftTeams.Context, appSettings:Settings): void => {
  // do not set up if instrumentation key is missing
  if (appSettings.instrumentationKey !== "#{AppInsightsInstrumentationKey}#") {
    appInsights = new ApplicationInsights({
      config: {
        instrumentationKey: appSettings.instrumentationKey,
        autoTrackPageVisitTime: true,
        disableFetchTracking: false,
        appId: appSettings.clientId,
        enableUnhandledPromiseRejectionTracking: true,
        extensions: [reactPlugin],
      },
    });
    appInsights.loadAppInsights();
    appInsights.trackPageView();
  }

  if (context.userPrincipalName) {
    if (appInsights) {
      appInsights.setAuthenticatedUserContext(context.userPrincipalName);
    }
  }
  let hostClientType: string;
  if (context.hostClientType) {
    hostClientType = context.hostClientType;
  }
  if (appInsights) {
    appInsights.addTelemetryInitializer((envelope) => {
      const telemetryItem = envelope?.data?.baseData;
      if (!telemetryItem.properties) {
        telemetryItem.properties = {};
      }
      telemetryItem.properties = {
        ...telemetryItem.properties,
        hostClientType,
        pathname: window.location.pathname,
        clientId: appSettings.clientId,
      };
    });
  }
};

const logEvent = (
  name: string,
  properties?: EventProperty[] | undefined,
): void => {
  if (appInsights) {
    appInsights.trackEvent({ name, properties });
    const importantAction = properties?.find((p) => p.name === IMPORTANT_ACTION);
    if (importantAction) {
      appInsights.trackEvent({ name: IMPORTANT_ACTION, properties: [importantAction.value] });
    }
    const description = properties?.find((p) => p.name === DESCRIPTION);
    if (description) {
      appInsights.trackEvent({ name: description.value });
    }
    const viralityMeasure = properties?.find((p) => p.name === VIRALITY_MEASURE);
    if (viralityMeasure) {
      const collaborateCount = properties?.find((p) => p.name === COLLABORATE_COUNT);
      const overlapPercentage = properties?.find((p) => p.name === OVERLAP_PERCENTAGE);
      const key = overlapPercentage ? OVERLAP_PERCENTAGE : COLLABORATE_COUNT;
      const value = overlapPercentage ? overlapPercentage.value : collaborateCount?.value;
      appInsights.trackEvent({
        name: viralityMeasure.value,
        properties: [description?.value],
        measurements: {
          [key]: Number(value),
        },
      });
    }
  }
};

// This wrapper exists so we can easily remove or replace these calls with
// calls to Application Insights
export {
  logEvent,
  setup,
};
