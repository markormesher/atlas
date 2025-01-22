import React from "react";
import { ReactElement } from "react";
import { createConnectTransport } from "@connectrpc/connect-web";
import { createClient } from "@connectrpc/connect";
import { AtlasService, Place } from "../../gen/atlas/v1/atlas_pb";

function Editor(): ReactElement {
  const apiTransport = createConnectTransport({ baseUrl: "/" });
  const apiClient = createClient(AtlasService, apiTransport);

  const [loggedIn, setLoggedIn] = React.useState<boolean | null>(null);
  const [places, setPlaces] = React.useState<Record<string, Place>>({});

  React.useEffect(() => {
    apiClient
      .authCheck({})
      .then(() => setLoggedIn(true))
      .catch((err) => {
        console.log(err);
        setLoggedIn(false);
      });
  }, []);

  React.useEffect(() => {
    apiClient
      .getPlaces({})
      .then((res) => {
        const placeMap: Record<string, Place> = {};
        res.places.forEach((p) => (placeMap[p.id] = p));
        setPlaces(placeMap);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  function setStringValue(id: string, key: "name" | "country", evt: React.ChangeEvent<HTMLInputElement>): void {
    const value = evt.target.value.trim();
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

  if (loggedIn === null) {
    return (
      <div className={"editor-wrapper"}>
        <p>Waiting for login...</p>
      </div>
    );
  } else if (!loggedIn) {
    window.location.assign("/");
    return (
      <div className={"editor-wrapper"}>
        <p>Redirecting...</p>
      </div>
    );
  }

  return (
    <div className={"editor-wrapper"}>
      <h1>Atlas - Editor</h1>
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
            .sort((a, b) => `${a[1].country}, ${a[1].name}`.localeCompare(`${b[1].country}, ${b[1].name}`))
            .map(([id, place]) => {
              const isValid =
                place.name.length > 0 && place.country.length > 0 && !isNaN(place.lat) && !isNaN(place.lon);
              const isBlank = place.name == "" && place.country == "";

              return (
                <tr key={id}>
                  <td>
                    <input type={"text"} value={place.name} onChange={(evt) => setStringValue(id, "name", evt)} />
                  </td>
                  <td>
                    <input type={"text"} value={place.country} onChange={(evt) => setStringValue(id, "country", evt)} />
                  </td>
                  <td>
                    <input
                      type={"number"}
                      value={isNaN(place.lat) ? "" : place.lat}
                      onChange={(evt) => setFloatValue(id, "lat", evt)}
                      step={"0.0001"}
                    />
                  </td>
                  <td>
                    <input
                      type={"number"}
                      value={isNaN(place.lon) ? "" : place.lon}
                      onChange={(evt) => setFloatValue(id, "lon", evt)}
                      step={"0.0001"}
                    />
                  </td>
                  <td>
                    {isBlank ? (
                      <input type={"button"} value={"Delete"} />
                    ) : (
                      <input type={"button"} value={"Save"} disabled={!isValid} />
                    )}
                  </td>
                </tr>
              );
            })}

          <tr>
            <td>
              <input type={"text"} placeholder={"Add new"} />
            </td>
            <td>
              <input type={"text"} placeholder={"Add new"} />
            </td>
            <td>
              <input type={"text"} placeholder={"Add new"} />
            </td>
            <td>
              <input type={"text"} placeholder={"Add new"} />
            </td>
            <td>
              <input type={"button"} value={"Save"} />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export { Editor };
