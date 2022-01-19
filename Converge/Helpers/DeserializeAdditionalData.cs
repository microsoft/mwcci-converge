// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using System.Collections.Generic;
using System.Linq;

namespace Converge.Helpers
{
    /// <summary>
    /// A helper to deserialize properties stored in "AdditionalData" coming from Graph.
    /// </summary>
    public static class DeserializeAdditionalData
    {
        /// <summary>
        /// Gets a string property from additional data. Returns null if not found.
        /// </summary>
        /// <param name="additionalData">The data that owns the property.</param>
        /// <param name="key">The key of the property.</param>
        /// <returns>The value of the property.</returns>
        public static string GetStringProperty(IDictionary<string, object> additionalData, string key)
        {
            bool success = additionalData.TryGetValue(key, out object value);
            if (success)
            {
                return value != null ? value.ToString() : null;
            }
            return null;
        }

        /// <summary>
        /// Gets an int property from additional data. Returns 0 if not found.
        /// </summary>
        /// <param name="additionalData">The data that owns the property.</param>
        /// <param name="key">The key of the property.</param>
        /// <returns>The value of the property.</returns>
        public static int GetIntProperty(IDictionary<string, object> additionalData, string key)
        {
            bool success = additionalData.TryGetValue(key, out object value);
            if (success)
            {
                if (value == null)
                {
                    return 0;
                }
                bool isInt = int.TryParse(value.ToString(), out int result);
                if (isInt)
                {
                    return result;
                }
            }
            return 0;
        }

        /// <summary>
        /// Gets a boolean property from additional data. Returns false if not found.
        /// </summary>
        /// <param name="additionalData">The data that owns the property.</param>
        /// <param name="key">The key of the property.</param>
        /// <returns>The value of the property.</returns>
        public static bool GetBoolProperty(IDictionary<string, object> additionalData, string key)
        {
            bool success = additionalData.TryGetValue(key, out object value);
            if (success)
            {
                return value != null ? value.ToString() == "True" : false;
            }
            return false;
        }

        /// <summary>
        /// Gets a list of string property from additional data. Returns an empty list if not found.
        /// </summary>
        /// <param name="additionalData">The data that owns the property.</param>
        /// <param name="key">The key of the property.</param>
        /// <returns>Teh value of the property.</returns>
        public static List<string> GetListStringProperty(IDictionary<string, object> additionalData, string key)
        {
            bool success = additionalData.TryGetValue(key, out object value);
            var collection = value as System.Collections.IEnumerable;
            if (collection != null)
            {
                return collection.Cast<object>()
                    .Select(x => x.ToString().Split(","))
                    .SelectMany(x => x)
                    .ToList();
            }
            return new List<string>();
        }
    }
}