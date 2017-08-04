const path = require("path");
const request = require("request");
const prompt = require("prompt");
const Storage = require("node-storage");

const SECRETS = require("./secrets.json");
const googleApiKey = SECRETS["google_api_key"];

prompt.message = "";
prompt.colors = false;
prompt.start();

const startSearch = () => {
	prompt.get({name: "term", description: "Search term (or quit/q)"}, (err, result) => {
		if (err) {
			console.log(err);
			return;
		}

		const term = result["term"].toLowerCase();
		if (term === "") {
			startSearch();
		} else if (term === "quit" || term === "q") {
			console.log("Bye!");
		} else {
			doSearch(term);
		}
	});
};

const doSearch = (searchTerm) => {
	request("https://maps.googleapis.com/maps/api/geocode/json?address=" + encodeURIComponent(searchTerm) + "&key=" + googleApiKey, (err, res, body) => {
		if (err) {
			console.log("Error: " + err);
			return;
		}

		const raw = JSON.parse(body);
		if (raw["status"] !== "OK") {
			console.log("Reply status: " + raw["status"]);
			startSearch();
		} else {
			parsePlaces(raw["results"]);
		}
	});
};

const parsePlaces = (results) => {
	const options = [];

	for (let i = 0; i < results.length; ++i) {
		const result = results[i];
		const lat = result["geometry"]["location"]["lat"];
		const lon = result["geometry"]["location"]["lng"];
		let country;
		for (let j = 0; j < result["address_components"].length; ++j) {
			const component = result["address_components"][j];
			if (component["types"].indexOf("country") >= 0) {
				country = component["long_name"];
				break;
			}
		}
		if (!country) {
			continue;
		}

		const targets = ["locality", "administrative_area_level_1", "administrative_area_level_2", "colloquial_area", "establishment"];

		for (let j = 0; j < result["address_components"].length; ++j) {
			const component = result["address_components"][j];
			for (let k = 0; k < targets.length; ++k) {
				if (component["types"].indexOf(targets[k]) >= 0) {
					options.push({
						lat: lat,
						lon: lon,
						country: country,
						name: component["long_name"]
					});
				}
			}
		}
	}

	choosePlace(options);
};

const choosePlace = (options) => {
	if (options.length === 0) {
		console.log("No places found!");
		startSearch();
	} else {
		console.log("Select a place to add:");
		console.log("0) Search again");
		for (let i = 0; i < options.length; ++i) {
			console.log((i + 1) + ") " + options[i]["name"] + ", " + options[i]["country"] + " @ " + options[i]["lat"] + ", " + options[i]["lon"]);
		}
		prompt.get({name: "selection", description: "Choose place"}, (err, result) => {
			if (err) {
				console.log(err);
				return;
			}

			const selection = parseInt(result["selection"]) - 1;
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

const savePlace = (place) => {
	const store = new Storage(path.join(__dirname, "data/places"));
	const places = store.get("places") || [];

	if (placeIsDuplicate(place, places)) {
		console.log("This place has already been added!");
	} else {
		places.push(place);
		store.put("places", places);
		console.log("Added!");
	}
	startSearch();
};

const placeIsDuplicate = (place, places) => {
	for (let i = 0; i < places.length; ++i) {
		if (place["name"] === places[i]["name"]
				&& place["country"] === places[i]["country"]) {
			return true;
		}
	}
	return false;
};

startSearch();
