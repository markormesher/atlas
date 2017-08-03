const path = require("path");
const Storage = require("node-storage");

var getPlaces = () => {
	const store = new Storage(path.join(__dirname, "data/places"));
	var places = store.get("places");
	if (!places) {
		places = [];
	}
	return places;
};

module.exports = getPlaces;
