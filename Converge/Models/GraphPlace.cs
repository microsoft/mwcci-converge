// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Converge.Helpers;
using Microsoft.Graph;
using System.Collections.Generic;

namespace Converge.Models
{
    /// <summary>
    /// A model that represents all possible available data about a place coming from Graph.
    /// </summary>
    public class GraphPlace : Place
    {
        /// <summary>
        /// Constructor left empty for testing.
        /// </summary>
        public GraphPlace() { }

        /// <summary>
        /// Gets or sets the nickname of the place. May be null.
        /// </summary>
        public virtual string Nickname { get; set; }

        /// <summary>
        /// Gets or sets the email address of the place.
        /// </summary>
        public virtual string EmailAddress { get; set; }

        /// <summary>
        /// Gets or sets the name of the building for this place. May be null.
        /// </summary>
        public virtual string Building { get; set; }

        /// <summary>
        /// Gets or sets the floor number for this place. May be null.
        /// </summary>
        public virtual int? FloorNumber { get; set; }

        /// <summary>
        /// Gets or sets the floor label for this place. May be null.
        /// </summary>
        public virtual string FloorLabel { get; set; }

        /// <summary>
        /// Gets or sets the label for this place. May be null.
        /// </summary>
        public virtual string Label { get; set; }

        /// <summary>
        /// Gets or sets the capacity for this place. Zero is a valid value.
        /// </summary>
        public virtual int Capacity { get; set; }

        /// <summary>
        /// Gets or sets the booking type for this place.
        /// </summary>
        public virtual BookingType BookingType { get; set; }

        /// <summary>
        /// Gets or sets whether this place is wheelchair accessible.
        /// </summary>
        public virtual bool IsWheelChairAccessible { get; set; }

        /// <summary>
        /// Gets or sets the tags for this place.
        /// </summary>
        public virtual List<string> Tags { get; set; }

        /// <summary>
        /// Gets or sets the type for this place.
        /// </summary>
        public virtual PlaceType SpaceType { get; set; }

        /// <summary>
        /// Gets or sets the audio device name for this place. May be null.
        /// </summary>
        public virtual string AudioDeviceName { get; set; }

        /// <summary>
        /// Gets or sets the video device name for this place. May be null.
        /// </summary>
        public virtual string VideoDeviceName { get; set; }

        /// <summary>
        /// Gets or sets the display device name for this place. May be null.
        /// </summary>
        public virtual string DisplayDeviceName { get; set; }

        /// <summary>
        /// Gets or sets the locality of this place, which is the upn of the room list that owns it.
        /// </summary>
        public virtual string Locality { get; set; }

        /// <summary>
        /// A constructor that creates a graph place from the place object received from the C# Graph library.
        /// </summary>
        /// <param name="place">The place object received from the C# Graph Library.</param>
        /// <param name="placeType">The type of this place (workspace or conference room).</param>
        /// <param name="locality">The upn of the room list (building) that owns this place.</param>
        public GraphPlace(Place place, PlaceType placeType, string locality)
        {
            Locality = locality;
            Address = place.Address;
            DisplayName = place.DisplayName;
            GeoCoordinates = place.GeoCoordinates;
            Phone = place.Phone;
            Nickname = DeserializeAdditionalData.GetStringProperty(place.AdditionalData, "nickname");
            EmailAddress = DeserializeAdditionalData.GetStringProperty(place.AdditionalData, "emailAddress");
            Building = DeserializeAdditionalData.GetStringProperty(place.AdditionalData, "building");
            FloorLabel = DeserializeAdditionalData.GetStringProperty(place.AdditionalData, "floorLabel");
            FloorNumber = DeserializeAdditionalData.GetIntProperty(place.AdditionalData, "floorNumber");
            Label = DeserializeAdditionalData.GetStringProperty(place.AdditionalData, "label");
            Capacity = DeserializeAdditionalData.GetIntProperty(place.AdditionalData, "capacity");
            string bookingType = DeserializeAdditionalData.GetStringProperty(place.AdditionalData, "bookingType");
            BookingType = BookingType.Unknown;
            switch (bookingType)
            {
                case "reserved":
                    BookingType = BookingType.Reserved;
                    break;
                case "standard":
                    BookingType = BookingType.Standard;
                    break;
            }
            IsWheelChairAccessible = DeserializeAdditionalData.GetBoolProperty(place.AdditionalData, "isWheelChairAccessible");
            AudioDeviceName = DeserializeAdditionalData.GetStringProperty(place.AdditionalData, "audioDeviceName");
            VideoDeviceName = DeserializeAdditionalData.GetStringProperty(place.AdditionalData, "videoDeviceName");
            DisplayDeviceName = DeserializeAdditionalData.GetStringProperty(place.AdditionalData, "displayDeviceName");
            SpaceType = placeType;
            Tags = DeserializeAdditionalData.GetListStringProperty(place.AdditionalData, "tags");
        }
    }
}