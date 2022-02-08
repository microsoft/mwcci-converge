// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using System;
using System.Collections.Generic;
using System.Linq;

namespace Converge.Helpers
{
    public static class StringTypeHelper
    {
        /// <summary>
        /// Case-insensitive String equality comparer.
        /// </summary>
        /// <param name="firstString"></param>
        /// <param name="secondString"></param>
        /// <param name="considerNullAndEmptySame"></param>
        /// <returns></returns>
        public static bool SameAs(this string firstString, string secondString, bool considerNullAndEmptySame = false)
        {
            if(considerNullAndEmptySame && string.IsNullOrEmpty(firstString) && string.IsNullOrEmpty(secondString))
            {
                return true;
            }
            return (string.Compare(firstString, secondString, true) == 0);
        }

        /// <summary>
        /// Case-insensitive Sub-string functionality.
        /// </summary>
        /// <param name="actualString"></param>
        /// <param name="partString"></param>
        /// <returns></returns>
        public static bool Comprises(this string actualString, string partString)
        {
            return actualString.ToLower().Contains(partString.ToLower());
        }

        /// <summary>
        /// Case-insensitive search for an element in a given collection.
        /// </summary>
        /// <param name="element"></param>
        /// <param name="elementCollection"></param>
        /// <param name="ignoreCase"></param>
        /// <returns></returns>
        public static bool OneAmong(this string element, IEnumerable<string> elementCollection, bool ignoreCase = true)
        {
            return elementCollection.Any(x => x.Equals(element, ignoreCase? StringComparison.OrdinalIgnoreCase : StringComparison.Ordinal));
        }

        /// <summary>
        /// Case-insensitive search for element-match in a given collection and the first match index is returned.
        /// </summary>
        /// <param name="element"></param>
        /// <param name="elementCollection"></param>
        /// <param name="startIndex"></param>
        /// <returns></returns>
        public static int FirstMatchIndex(this string element, IEnumerable<string> elementCollection, int startIndex = 0)
        {
            return elementCollection.ToList().FindIndex(startIndex, x => x.SameAs(element));
        }
    }
}
