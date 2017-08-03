const path = require("path");
const express = require("express");
const request = require("request");
const getPlaces = require("./get-places");

const SECRETS = require("./secrets.json");
const googleApiKey = SECRETS["google_api_key"];

const app = express();

app.use(express.static(path.join(__dirname, "static")));
app.get("/places", (req, res) => {
	var places = getPlaces();
	res.json(places);
});
app.get("/google-maps-api", (req, res) => {
	request("https://maps.googleapis.com/maps/api/js?key=" + googleApiKey + "&callback=initMap", (err, full, body) => {
		res.send(body);
	});
});

app.listen(3003, () => {
	console.log("Listening on port 3003");
});
