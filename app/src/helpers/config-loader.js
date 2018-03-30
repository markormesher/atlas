const fs = require("fs");

const loadedSecrets = {};

const getSecret = (key) => {
	if (loadedSecrets[key] === undefined) {
		loadedSecrets[key] = fs.readFileSync("/run/secrets/" + key).toString().trim();
	}
	return loadedSecrets[key];
};

module.exports = {
	getSecret: getSecret
};
