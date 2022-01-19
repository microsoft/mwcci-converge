// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Microsoft.ApplicationInsights;
using Microsoft.ApplicationInsights.DataContracts;
using Microsoft.ApplicationInsights.Extensibility;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;

namespace Converge.Services
{
    public class TelemetryService
    {
        public const string CONVERGE_CALEDNAR_REMOVED = "CONVERGE_CALEDNAR_REMOVED";
        public const string USER_UNINSTALLED_CONVERGE = "USER_UNINSTALLED_CONVERGE";
        public const string USER_NO_ZIP_CODE = "USER_NO_ZIP_CODE";

        /// <summary>
        /// The empty constructor exists for testing purposes.
        /// </summary>
        public TelemetryService() { }

        private static TelemetryClient _telemetryClient;

        /// <summary>
        /// A constructor that takes environment information about the application insights instrumentation key.
        /// </summary>
        /// <param name="instrumentationKey">The Instrumentation key as found in the Azure portal. Will depend on the environment.</param>
        public TelemetryService(string instrumentationKey)
        {
            if (_telemetryClient == null)
            {
                using (TelemetryConfiguration telemetryConfiguration = new TelemetryConfiguration(instrumentationKey))
                {
                    _telemetryClient = new TelemetryClient(telemetryConfiguration);
                }
            }
        }

        /// <summary>
        /// The default constructor.
        /// </summary>
        public TelemetryService(TelemetryClient tc)
        {
            if (_telemetryClient == null)
            {
                _telemetryClient = tc;
            }
        }

        /// <summary>
        /// Tracks event
        /// </summary>
        /// <param name="eventName"></param>
        /// <param name="propName"></param>
        /// <param name="propValue"></param>
        public virtual void TrackEvent(string eventName, string propName, string propValue)
        {
            Dictionary<string, string> eventInformation = new Dictionary<string, string>
            {
                { propName, propValue }
            };

            TrackEvent(eventName, eventInformation);
        }

        /// <summary>
        /// Tracks any sort of custom event.
        /// </summary>
        /// <param name="eventName">The name of the event.</param>
        /// <param name="message">Any message about the event.</param>
        /// <param name="customEvent">An object with more information about the event.</param>
        public void TrackEvent(string eventName, string message, object customEvent)
        {
            Dictionary<string, string> eventInformation = new Dictionary<string, string>
            {
                { message, JsonConvert.SerializeObject(customEvent) }
            };

            TrackEvent(eventName, eventInformation);
        }

        /// <summary>
        /// Tracks an event with custom properties
        /// </summary>
        /// <param name="eventStr">Name of the Event</param>
        /// <param name="properties">Named string values you can use to classify and search for this exception.</param>
        public virtual void TrackEvent(string eventStr, IDictionary<string, string> properties = null)
        {
            if (properties == null)
            {
                properties = new Dictionary<string, string>();
            }
            _telemetryClient.TrackEvent(eventStr, properties);
        }

        /// <summary>
        /// Track any exception.
        /// </summary>
        /// <param name="exception">The exception to track.</param>
        /// <param name="exceptionName">exception name.</param>
        public virtual void TrackException(Exception exception, string exceptionName)
        {
            Dictionary<string, string> exceptionInformation = new Dictionary<string, string>
            {
                { "ExceptionName", exceptionName }
            };

            TrackException(exception, exceptionInformation);
        }

        public virtual void TrackException(Exception exception, string propName, string propValue)
        {
            Dictionary<string, string> exceptionInformation = new Dictionary<string, string>
            {
                { propName, propValue }
            };

            TrackException(exception, exceptionInformation);
        }

        public virtual void TrackException(Exception exception, string exceptionName, IDictionary<string, string> properties, IDictionary<string, double> metrics = null)
        {
            if (properties == null)
            {
                properties = new Dictionary<string, string>();
            }

            if (!properties.ContainsKey("ExceptionName"))
            {
                properties.Add("ExceptionName", exceptionName);
            }

            TrackException(exception, properties, metrics);
        }

        /// <summary>
        /// Track any exception.
        /// </summary>
        /// <param name="exception">The exception to track.</param>
        /// <param name="properties">Named string values(dictionary) you can use to classify and search for this exception.</param>
        /// <param name="metrics">metrics in the dictionary.</param>
        public virtual void TrackException(Exception exception, IDictionary<string, string> properties = null, IDictionary<string, double> metrics = null)
        {
            if (properties == null)
            {
                properties = new Dictionary<string, string>();
            }

            if (metrics == null)
            {
                metrics = new Dictionary<string, double>();
            }

            _telemetryClient.TrackException(exception, properties, metrics);
        }
    }
}
