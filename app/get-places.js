const Storage = require("node-storage");

const getPlaces = () => {
	const store = new Storage("/data/places");
	return store.get("places") || [];
};

module.exports = getPlaces;
