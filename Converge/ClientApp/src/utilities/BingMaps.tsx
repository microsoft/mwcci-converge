// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from "react";
import CampusToCollaborate from "../types/CampusToCollaborate";
import VenueToCollaborate from "../types/VenueToCollaborate";
import { Microsoft } from "./BingMapLoader";
import createCustomClusteredPin from "./ClusteredPushpin";
import pushpin from "./pushpin.svg";
import pushpinBlue from "./pushpinBlue.svg";

interface IMapProps {
    coordinates: { latitude: number; longitude: number } | null;
    placesToCollaborate: (CampusToCollaborate|VenueToCollaborate)[],
    peoplePushpins: Microsoft.Maps.Pushpin[],
    propsUpdated: boolean,
    eventCallback: (props: CampusToCollaborate|VenueToCollaborate) => void,
    openPanel: boolean;
}

const tooltipTemplate = "<div style=\"background-color:#6264A7;height:40px;width:auto;padding:10px;text-align:center;color: #fff;border-radius: 10px; \"><b>{title}</b></div>";

// Reason for this component being a class component instead of functional component
// is that we have to use createRef which will always create a new reference
// as opposed to useRef which will return the same reference each time and
// we can't use createRef in functional component
export default class BingMap extends React.Component<IMapProps> {
  private mapRef = React.createRef<HTMLDivElement>();

  private map: Microsoft.Maps.Map | undefined;

  private clusterLayer: Microsoft.Maps.ClusterLayer | undefined;

  public componentDidMount(): void {
    this.initMap();
  }

  public componentDidUpdate(prevProps: IMapProps): void {
    const { openPanel, placesToCollaborate, peoplePushpins } = this.props;
    if (openPanel !== prevProps.openPanel && !openPanel) {
      this.paintEntities();
    }
    if ((prevProps.placesToCollaborate !== placesToCollaborate)
      || (prevProps.peoplePushpins !== peoplePushpins)
    ) {
      this.paintEntities();
    }
  }

  private setView = (view: Microsoft.Maps.IViewOptions, map: Microsoft.Maps.Map) => {
    map.setView(view);
  }

  private setPlacesToCollaborate = async (
    places: (CampusToCollaborate|VenueToCollaborate)[],
    map: Microsoft.Maps.Map,
  ) => {
    // Create an infobox to use as a tooltip when hovering.
    const tooltip = new Microsoft.Maps.Infobox(map.getCenter(), {
      visible: false,
      showPointer: true,
      showCloseButton: false,
      offset: new Microsoft.Maps.Point(-75, 22),
    });

    tooltip.setMap(map);

    // Create an infobox for displaying detailed information.
    const infobox = new Microsoft.Maps.Infobox(map.getCenter(), {
      visible: false,
    });

    infobox.setMap(map);

    places.forEach((place: CampusToCollaborate | VenueToCollaborate) => {
      let loc;
      const { eventCallback } = this.props;

      if ((place as CampusToCollaborate).identity) {
        const p = place as CampusToCollaborate;
        if (p.geoCoordinates) {
          const [lat, long] = p.geoCoordinates.split(",");
          loc = new Microsoft.Maps.Location(lat, long);
        }
      } else {
        loc = new Microsoft.Maps.Location(
          (place as VenueToCollaborate).latitude,
          (place as VenueToCollaborate).longitude,
        );
      }

      function pushpinHovered(e: {
        target: { metadata: { title: string; }; getLocation: () => Microsoft.Maps.IViewOptions["center"]; }; }) {
        // Hide the infobox
        infobox.setOptions({ visible: false });

        // Make sure the infobox has metadata to display.
        if (e.target.metadata) {
          // Set the infobox options with the metadata of the pushpin.
          tooltip.setOptions({
            location: e.target.getLocation(),
            htmlContent: tooltipTemplate.replace("{title}", e.target.metadata.title),
            visible: true,
          });
        }
      }

      function disableHoverState() {
        tooltip.setOptions({ visible: false });
      }

      if (loc) {
        const pushPin = new Microsoft.Maps.Pushpin(loc, { icon: pushpin });
        map.entities.push(pushPin);
        // Store some metadata with the pushpin.
        pushPin.metadata = {
          title: (place as CampusToCollaborate).identity
            ? `${(place as CampusToCollaborate).displayName}`
            : `${(place as VenueToCollaborate).venueName}`,
        };
        Microsoft.Maps.Events.addHandler(pushPin, "mouseover", pushpinHovered);
        Microsoft.Maps.Events.addHandler(pushPin, "mouseout", disableHoverState);

        Microsoft.Maps.Events.addHandler(pushPin, "click", (args: { target: { getLocation: () => Microsoft.Maps.IViewOptions["center"]; }; }) => {
          pushPin.setOptions({ icon: pushpinBlue });
          setTimeout(() => {
            pushPin.setOptions({ icon: pushpin });
          }, 5000);
          this.setView({
            center: args.target.getLocation(),
            zoom: 15,
          }, map);
          eventCallback(place);
        });
      }
    });
  }

  private setPeople = (
    peoplePushpins: Microsoft.Maps.Pushpin[],
  ) => {
    this.clusterLayer?.setPushpins(peoplePushpins);
  }

  private initMap() {
    this.map = new Microsoft.Maps.Map(this.mapRef.current);
    Microsoft.Maps.loadModule("Microsoft.Maps.Clustering", async () => {
      const { peoplePushpins } = this.props;
      this.clusterLayer = new Microsoft.Maps.ClusterLayer(peoplePushpins, {
        clusteredPinCallback: createCustomClusteredPin,
        gridSize: 80,
      }) as Microsoft.Maps.ClusterLayer;
      if (this.clusterLayer) {
        this.map?.layers.insert(this.clusterLayer);
      }
    });
    this.paintEntities();
  }

  private paintEntities() {
    const {
      coordinates,
      placesToCollaborate,
      peoplePushpins,
    } = this.props;

    this.map?.entities.clear();

    const locs = [];

    for (let i = 0; i < peoplePushpins.length; i += 1) {
      locs.push(peoplePushpins[i].getLocation());
    }

    placesToCollaborate.forEach((place: CampusToCollaborate | VenueToCollaborate) => {
      let placeLocation;

      if ((place as CampusToCollaborate).identity) {
        const p = place as CampusToCollaborate;
        if (p.geoCoordinates) {
          const [lat, long] = p.geoCoordinates.split(",");
          placeLocation = new Microsoft.Maps.Location(lat, long);
        }
      } else {
        placeLocation = new Microsoft.Maps.Location(
          (place as VenueToCollaborate).latitude,
          (place as VenueToCollaborate).longitude,
        );
      }

      locs.push(placeLocation);
    });

    if (coordinates && this.map) {
      if (locs.length > 1) {
        this.setView({
          center: new Microsoft.Maps.Location(coordinates.latitude, coordinates.longitude),
          bounds: Microsoft.Maps.LocationRect.fromLocations(locs),
          padding: 100,
        }, this.map);
      } else {
        this.setView({
          center: new Microsoft.Maps.Location(coordinates.latitude, coordinates.longitude),
          zoom: 10,
        }, this.map);
      }
    }

    if (placesToCollaborate.length > 0 && this.map) {
      this.setPlacesToCollaborate(placesToCollaborate, this.map);
    }

    if (peoplePushpins.length > 0 && this.map) {
      this.setPeople(peoplePushpins);
    }
  }

  public render(): JSX.Element {
    return <div id="bingMaps" ref={this.mapRef} />;
  }
}
