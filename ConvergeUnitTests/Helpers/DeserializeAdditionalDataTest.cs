// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Converge.Helpers;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Collections.Generic;

namespace ConvergeUnitTests.Helpers
{
    [TestClass]
    public class DeserializeAdditionalDataTest
    {
        [TestMethod]
        public void TestGetStringProperty_IsPopulated()
        {
            // Arrange
            IDictionary<string, object> dict = new Dictionary<string, object>();
            dict.Add("key", "value");

            // Act
            string result = DeserializeAdditionalData.GetStringProperty(dict, "key");

            // Assert
            Assert.AreEqual("value", result, "Dictionary should contain a value of 'value'.");
        }

        [TestMethod]
        public void TestGetStringProperty_IsNull()
        {
            // Arrange
            IDictionary<string, object> dict = new Dictionary<string, object>();
            dict.Add("key", null);

            // Act
            string result = DeserializeAdditionalData.GetStringProperty(dict, "key");

            // Assert
            Assert.AreEqual(null, result, "Dictionary should contain a value of null.");
        }

        [TestMethod]
        public void TestGetStringProperty_IsNotDefined()
        {
            // Arrange
            IDictionary<string, object> dict = new Dictionary<string, object>();

            // Act
            string result = DeserializeAdditionalData.GetStringProperty(dict, "key");

            // Assert
            Assert.AreEqual(null, result, "Dictionary does not contain value, returns null.");
        }

        [TestMethod]
        public void TestGetIntProperty_IsPopulated()
        {
            // Arrange
            IDictionary<string, object> dict = new Dictionary<string, object>();
            dict.Add("key", 4);

            // Act
            int result = DeserializeAdditionalData.GetIntProperty(dict, "key");

            // Assert
            Assert.AreEqual(4, result, "Dictionary should contain a value of '4'.");
        }

        [TestMethod]
        public void TestGetIntProperty_IsZero()
        {
            // Arrange
            IDictionary<string, object> dict = new Dictionary<string, object>();
            dict.Add("key", 0);

            // Act
            int result = DeserializeAdditionalData.GetIntProperty(dict, "key");

            // Assert
            Assert.AreEqual(0, result, "Dictionary should contain a value of 0.");
        }

        [TestMethod]
        public void TestGetIntProperty_IsNotDefined()
        {
            // Arrange
            IDictionary<string, object> dict = new Dictionary<string, object>();

            // Act
            int result = DeserializeAdditionalData.GetIntProperty(dict, "key");

            // Assert
            Assert.AreEqual(0, result, "Dictionary does not contain value, returns 0.");
        }

        [TestMethod]
        public void TestGetIntProperty_IsNan()
        {
            // Arrange
            IDictionary<string, object> dict = new Dictionary<string, object>();
            dict.Add("key", "not a number");

            // Act
            int result = DeserializeAdditionalData.GetIntProperty(dict, "key");

            // Assert
            Assert.AreEqual(0, result, "Dictionary should contain a value of 0.");
        }

        [TestMethod]
        public void TestGetBoolProperty_IsPopulated()
        {
            // Arrange
            IDictionary<string, object> dict = new Dictionary<string, object>();
            dict.Add("key", true);

            // Act
            bool result = DeserializeAdditionalData.GetBoolProperty(dict, "key");

            // Assert
            Assert.IsTrue(result, "Dictionary should contain a value of 'true'.");
        }

        [TestMethod]
        public void TestGetBoolProperty_IsFalse()
        {
            // Arrange
            IDictionary<string, object> dict = new Dictionary<string, object>();
            dict.Add("key", false);

            // Act
            bool result = DeserializeAdditionalData.GetBoolProperty(dict, "key");

            // Assert
            Assert.IsFalse(result, "Dictionary should contain a value of false.");
        }

        [TestMethod]
        public void TestGetBoolProperty_IsNotDefined()
        {
            // Arrange
            IDictionary<string, object> dict = new Dictionary<string, object>();

            // Act
            bool result = DeserializeAdditionalData.GetBoolProperty(dict, "key");

            // Assert
            Assert.IsFalse(result, "Dictionary does not contain value, returns false.");
        }

        [TestMethod]
        public void TestGetListStringProperty_IsPopulated()
        {
            // Arrange
            var expected = new List<string> { "thing1", "thing2" };
            IDictionary<string, object> dict = new Dictionary<string, object>();
            dict.Add("key", expected);

            // Act
            List<string> result = DeserializeAdditionalData.GetListStringProperty(dict, "key");

            // Assert
            CollectionAssert.AreEqual(expected, result, "Dictionary should contain a list of two things.");
        }

        [TestMethod]
        public void TestGetListStringProperty_IsEmpty()
        {
            // Arrange
            IDictionary<string, object> dict = new Dictionary<string, object>();
            dict.Add("key", new List<string>());

            // Act
            List<string> result = DeserializeAdditionalData.GetListStringProperty(dict, "key");

            // Assert
            CollectionAssert.AreEqual(new List<string>(), result, "Dictionary should contain an empty list.");
        }

        [TestMethod]
        public void TestGetListStringProperty_IsNotDefined()
        {
            // Arrange
            IDictionary<string, object> dict = new Dictionary<string, object>();

            // Act
            List<string> result = DeserializeAdditionalData.GetListStringProperty(dict, "key");

            // Assert
            CollectionAssert.AreEqual(new List<string>(), result, "Dictionary does not contain value, returns an empty list.");
        }
    }
}
