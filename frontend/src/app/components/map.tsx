import React from "react";
import { ReactElement } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { createConnectTransport } from "@connectrpc/connect-web";
import { createClient } from "@connectrpc/connect";
import { AtlasService, Place } from "../../api_gen/atlas/v1/atlas_pb.js";
import { toastBus } from "./toaster.js";

const testPlace: Place = {
  $typeName: "atlas.v1.Place",
  id: "0",
  name: "Null Island",
  country: "Nowhere",
  lat: 0,
  lon: 0,
};

function Map(): ReactElement {
  const apiTransport = createConnectTransport({ baseUrl: "/" });
  const apiClient = createClient(AtlasService, apiTransport);

  const mapDivRef = React.useRef<HTMLDivElement>(null);
  const [status, setStatus] = React.useState("Loading...");

  React.useEffect(() => {
    if (mapDivRef.current) {
      const map = L.map(mapDivRef.current, {
        center: [39, 34],
        zoom: 2,
      });

      // base layer
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // fetch places
      apiClient
        .getPlaces({})
        .then((res) => {
          res.places.forEach((p) => addPlace(map, p));

          const placeCount = res.places.length;
          const placeWord = placeCount == 1 ? "place" : "places";
          const countryCount = new Set(res.places.map((p) => p.country)).size;
          const countryWord = countryCount == 1 ? "country" : "countries";

          setStatus(`${placeCount} ${placeWord}; ${countryCount} ${countryWord}`);
        })
        .catch((err) => {
          toastBus.emit({ sentiment: "error", text: "Failed to load places" });
          setStatus("Failed to load places - check the console");
          console.log(err);

          if (window.location.host.includes("localhost")) {
            addPlace(map, testPlace);
          }
        });
    }
  }, []);

  function addPlace(map: L.Map, place: Place) {
    L.circle([place.lat, place.lon], {
      color: "#ff0033",
      fillColor: "#ff0033",
      fillOpacity: 0.4,
      radius: 5000,
    })
      .bindPopup(`${place.name}, ${place.country}`)
      .addTo(map);
  }

  return (
    <>
      <div id="map" ref={mapDivRef}></div>
      <div id="map-status">{status}</div>
    </>
  );
}

export { Map };
