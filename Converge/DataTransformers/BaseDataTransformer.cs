// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

namespace Converge.DataTransformers
{
    public class BaseDataTransformer
    {
        public static dynamic GetProperty(dynamic resource, string elementName, string dataJoinSeparator = null)
        {
            dynamic data = null;
            try
            {
                data = resource[elementName];
                if(dataJoinSeparator != null && data != null && data.Count > 0)
                {
                    return string.Join(dataJoinSeparator, data);
                }
            }
            catch
            {
            }

            return data;
        }
    }
}
