const path = require("path");
const request = require("request");
const prompt = require("prompt");
const Storage = require("node-storage");

const SECRETS = require("./secrets.json");
const googleApiKey = SECRETS["google_api_key"];

prompt.start();

var getSearchTerm = function() { 
	prompt.get("Search term", function(err, result) {
		if (err) {
			console.log(err);
			return;
		}

		if (!result["Search term"] || result["Search term"] == "") {
			getSearchTerm();
		} else {
			doSearch(result["Search term"]);
		}
	});
};

var doSearch = function(searchTerm) {
	request("https://maps.googleapis.com/maps/api/geocode/json?address=" + encodeURIComponent(searchTerm) + "&key=" + googleApiKey, function(err, res, body) {
		if (err) {
			console.log("Error: " + err);
		} else {
			var raw = JSON.parse(body);
			if (raw["status"] !== "OK") {
				console.log("Reply status: " + raw["status"]);
			} else if (raw["results"].length === 0) {
				console.log("No results");
			} else {
				parsePlace(raw["results"][0]);
			}
		}
	});
};

var parsePlace = function(result) {
	var place = {};

	place["lat"] = result["geometry"]["location"]["lat"];
	place["lon"] = result["geometry"]["location"]["lng"];

	var locality = null;
	var country = null;
	for (var i = 0; i < result["address_components"].length; ++i) {
		var name = result["address_components"][i];
		if (name["types"].indexOf("locality") >= 0) {
			locality = name["long_name"];
		}
		if (name["types"].indexOf("country") >= 0) {
			country = name["long_name"];
		}
	}

	place["locality"] = locality;
	place["country"] = country;

	if (isNaN(place["lat"]) || isNaN(place["lon"]) || !locality || !country) {
		console.log("Error: place was not fully defined.");
		console.log(place);
	} else {
		savePlace(place);
	}
};

var savePlace = function(place) {
	console.log("Saving " + place["locality"] + ", " + place["country"] + " @ " + place["lat"] + ", " + place["lon"]);
	console.log("Is this right?");
	prompt.get("yes/no", function(err, result) {
		if (err) {
			console.log(err);
		} else if (result["yes/no"] === "yes") {
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
				console.log("Done!");
			}
		} else {
			getSearchTerm();
		}
	});
};

var placeIsDuplicate = function(place, places) {
	for (var i = 0; i < places.length; ++i) {
		if (place["locality"] === places[i]["locality"]
			&& place["country"] === places[i]["country"]) {
			return true;
		}
	}
	return false;
};

getSearchTerm();
