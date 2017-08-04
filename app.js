const path = require("path");
const express = require("express");
const request = require("request");
const getPlaces = require("./get-places");

const CONSTANTS = require("./constants.json");
const SECRETS = require("./secrets.json");
const googleApiKey = SECRETS["google_api_key"];

const app = express();

app.use(express.static(path.join(__dirname, "static")));

app.get("/places", (req, res) => {
	res.json(getPlaces());
});

app.get("/google-maps-api", (req, res) => {
	request("https://maps.googleapis.com/maps/api/js?key=" + googleApiKey + "&callback=initMap", (err, full, body) => {
		res.send(body);
	});
});

app.listen(CONSTANTS["port"], () => {
	console.log("Listening on port " + CONSTANTS["port"]);
});
