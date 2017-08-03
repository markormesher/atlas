const path = require("path");
const request = require("request");
const prompt = require("prompt");
const Storage = require("node-storage");

const SECRETS = require("./secrets.json");
const googleApiKey = SECRETS["google_api_key"];

prompt.message = "";
prompt.colors = false;
prompt.start();

var startSearch = () => { 
	prompt.get({ name: "term", description: "Search term (or quit/q)" }, (err, result) => {
		if (err) {
			console.log(err);
			return;
		}

		var term = result["term"].toLowerCase();
		if (result["term"] === "") {
			startSearch();
		} else if (result["term"] === "quit" || result["term"] === "q") {
			console.log("Bye!");
		} else {
			doSearch(result["term"]);
		}
	});
};

var doSearch = (searchTerm) => {
	request("https://maps.googleapis.com/maps/api/geocode/json?address=" + encodeURIComponent(searchTerm) + "&key=" + googleApiKey, (err, res, body) => {
		if (err) {
			console.log("Error: " + err);
			return;
		}

		var raw = JSON.parse(body);
		if (raw["status"] !== "OK") {
			console.log("Reply status: " + raw["status"]);
			startSearch();
		} else {
			parsePlaces(raw["results"]);
		}
	});
};

var parsePlaces = (results) => {
	var options = [];

	for (var i = 0; i < results.length; ++i) {
		var result = results[i];
		var lat = result["geometry"]["location"]["lat"];
		var lon = result["geometry"]["location"]["lng"];
		var country;
		for (var j = 0; j < result["address_components"].length; ++j) {
			var component = result["address_components"][j];
			if (component["types"].indexOf("country") >= 0) {
				country = component["long_name"];
				break;
			}
		}
		if (!country) {
			continue;
		}

		var targets = ["locality", "administrative_area_level_1", "administrative_area_level_2", "colloquial_area", "establishment"];

		for (var j = 0; j < result["address_components"].length; ++j) {
			var component = result["address_components"][j];
			for (var k = 0; k < targets.length; ++k) {
				if (component["types"].indexOf(targets[k]) >= 0) {
					var option = {
						lat: lat,
						lon: lon,
						country: country,
						name: component["long_name"]
					};
					options.push(option);
				}
			}
		}
	}

	choosePlace(options);
};

var choosePlace = (options) => {
	if (options.length === 0) {
		console.log("No places found!");
		startSearch();
	} else {
		console.log("Select a place to add:");
		console.log("0) Search again");
		for (var i = 0; i < options.length; ++i) {
			console.log((i + 1) + ") " + options[i]["name"] + ", " + options[i]["country"] + " @ " + options[i]["lat"] + ", " + options[i]["lon"]);
		}
		prompt.get({ name: "selection", description: "Choose place" }, (err, result) => {
			if (err) {
				console.log(err);
				return;
			}

			var selection = parseInt(result["selection"]) - 1;
			if (selection === -1) {
				startSearch();
			} else if (options[selection]) {
				savePlace(options[selection]);
			} else {
				console.log("Please select a valid option!");
				choosePlace(options);
			}
		});
	}
};

var savePlace = (place) => {
	const store = new Storage(path.join(__dirname, "data/places"));
	var places = store.get("places");
	if (!places) {
		places = [];
	}

	if (placeIsDuplicate(place, places)) {
		console.log("This place has already been added!");
	} else {
		places.push(place);
		store.put("places", places);
		console.log("Added!");
	}
	startSearch();
};

var placeIsDuplicate = (place, places) => {
	for (var i = 0; i < places.length; ++i) {
		if (place["name"] === places[i]["name"]
			&& place["country"] === places[i]["country"]) {
			return true;
		}
	}
	return false;
};

startSearch();
