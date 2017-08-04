const path = require("path");
const Storage = require("node-storage");

const getPlaces = () => {
	const store = new Storage(path.join(__dirname, "data/places"));
	return store.get("places") || [];
};

module.exports = getPlaces;
