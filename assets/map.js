async function init() {
  const token = (await axios.get("/mapbox-token")).data;

  const map = L.map("map", {
    center: [39, 34],
    zoom: 2,
  });

  L.tileLayer(
    "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
    {
      id: "mapbox/streets-v11",
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery &copy; <a href="https://www.mapbox.com/">Mapbox</a>',
      zoomOffset: -1,
      tileSize: 512,
      accessToken: token,
    }
  ).addTo(map);

  const places = (await axios.get("/places")).data;
  for (let place of places) {
    L.marker([place.lat, place.lon]).addTo(map);
  }

  const countryCount = new Set([...places.map((p) => p.country)]).size;
  document.getElementById("overlay").innerHTML =
    places.length + " places in " + countryCount + " countries";
}

init();
