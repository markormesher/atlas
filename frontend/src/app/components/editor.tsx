import React from "react";
import { ReactElement } from "react";
import { createConnectTransport } from "@connectrpc/connect-web";
import { createClient } from "@connectrpc/connect";
import { AtlasService, Place } from "../../api_gen/atlas/v1/atlas_pb.js";
import { toastBus } from "./toaster.js";

type OrderedPlace = Place & { order: number };

function Editor(): ReactElement {
  const zeroId = "00000000-0000-0000-0000-000000000000";

  const apiTransport = createConnectTransport({ baseUrl: "/" });
  const apiClient = createClient(AtlasService, apiTransport);

  const [reloadTrigger, setReloadTrigger] = React.useState(0);
  const [loggedIn, setLoggedIn] = React.useState<boolean | null>(null);
  const [places, setPlaces] = React.useState<Record<string, OrderedPlace>>({});

  React.useEffect(() => {
    apiClient
      .authCheck({})
      .then(() => setLoggedIn(true))
      .catch((err) => {
        console.log(err);
        window.location.assign("/login");
      });
  }, []);

  React.useEffect(() => {
    apiClient
      .getPlaces({})
      .then((res) => {
        const placeMap: Record<string, OrderedPlace> = {};
        res.places
          .sort((a, b) => `${a.country}, ${a.name}`.localeCompare(`${b.country}, ${b.name}`))
          .forEach((p, i) => (placeMap[p.id] = { ...p, order: i }));

        placeMap[zeroId] = {
          $typeName: "atlas.v1.Place",
          id: zeroId,
          name: "",
          country: "",
          lat: NaN,
          lon: NaN,
          order: -1,
        };

        setPlaces(placeMap);
      })
      .catch((err) => {
        toastBus.emit({ sentiment: "error", text: "Failed to load places" });
        console.log(err);
      });
  }, [reloadTrigger]);

  function setStringValue(id: string, key: "name" | "country", evt: React.ChangeEvent<HTMLInputElement>): void {
    const value = evt.target.value;
    setPlaces((p) => {
      if (p[id]) {
        p[id][key] = value;
      }

      return { ...p };
    });
  }

  function setFloatValue(id: string, key: "lat" | "lon", evt: React.ChangeEvent<HTMLInputElement>): void {
    let value = parseFloat(evt.target.value.trim());
    setPlaces((p) => {
      if (p[id]) {
        p[id][key] = value;
      }

      return { ...p };
    });
  }

  function updatePlace(id: string) {
    const place = places[id];
    if (!place) {
      return;
    }

    apiClient
      .updatePlace({ place })
      .then(() => {
        toastBus.emit({ sentiment: "success", text: "Place updated" });
        setReloadTrigger(new Date().getTime());
      })
      .catch((err) => {
        toastBus.emit({ sentiment: "error", text: "Failed to update place" });
        console.log(err);
      });
  }

  function deletePlace(id: string) {
    apiClient
      .deletePlace({ id })
      .then(() => {
        toastBus.emit({ sentiment: "success", text: "Place deleted" });
        setReloadTrigger(new Date().getTime());
      })
      .catch((err) => {
        toastBus.emit({ sentiment: "error", text: "Failed to delete place" });
        console.log(err);
      });
  }

  if (!loggedIn) {
    return (
      <div className={"editor-wrapper"}>
        <p>Waiting for login...</p>
      </div>
    );
  }

  return (
    <div className={"editor-wrapper"}>
      <h1>Atlas - Editor</h1>
      <p>
        <em>To delete a place, clear both the name and country fields then click "delete".</em>
      </p>
      <table>
        <thead>
          <tr>
            <td>Name</td>
            <td>Country</td>
            <td>Latitude</td>
            <td>Longitude</td>
            <td>Actions</td>
          </tr>
        </thead>
        <tbody>
          {Object.entries(places)
            .sort((a, b) => a[1].order - b[1].order)
            .map(([id, place]) => {
              const isValid =
                place.name.length > 0 && place.country.length > 0 && !isNaN(place.lat) && !isNaN(place.lon);
              const isBlank = place.name == "" && place.country == "";
              const isNew = id == zeroId;

              return (
                <tr key={id}>
                  <td>
                    <input
                      type={"text"}
                      placeholder={isNew ? "Create new..." : undefined}
                      value={place.name}
                      onChange={(evt) => setStringValue(id, "name", evt)}
                    />
                  </td>
                  <td>
                    <input
                      type={"text"}
                      placeholder={isNew ? "Create new..." : undefined}
                      value={place.country}
                      onChange={(evt) => setStringValue(id, "country", evt)}
                    />
                  </td>
                  <td>
                    <input
                      type={"number"}
                      placeholder={isNew ? "Create new..." : undefined}
                      value={isNaN(place.lat) ? "" : place.lat}
                      onChange={(evt) => setFloatValue(id, "lat", evt)}
                      step={"0.0001"}
                    />
                  </td>
                  <td>
                    <input
                      type={"number"}
                      placeholder={isNew ? "Create new..." : undefined}
                      value={isNaN(place.lon) ? "" : place.lon}
                      onChange={(evt) => setFloatValue(id, "lon", evt)}
                      step={"0.0001"}
                    />
                  </td>
                  <td>
                    {isBlank && !isNew ? (
                      <input type={"button"} className={"outline"} value={"Delete"} onClick={() => deletePlace(id)} />
                    ) : (
                      <input
                        type={"button"}
                        className={"outline"}
                        value={isNew ? "Create" : "Save"}
                        disabled={!isValid}
                        onClick={() => updatePlace(id)}
                      />
                    )}
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}

export { Editor };
