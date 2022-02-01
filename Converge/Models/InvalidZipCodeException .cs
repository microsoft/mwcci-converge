// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using System;

namespace Converge.Models
{
    public class InvalidZipCodeException : Exception
    {
        public InvalidZipCodeException() { }

        public InvalidZipCodeException(string zipCode)
            : base(String.Format("Invalid ZipCode: {0}", zipCode))
        {

        }
    }
}
