const fs = require("fs");

const loadedSecrets = {};

const getEnv = (key) => {
	return process.env[key] || "";
};

const getSecret = (key) => {
	if (loadedSecrets[key] === undefined) {
		loadedSecrets[key] = fs.readFileSync(process.env[key]).toString().trim();
	}
	return loadedSecrets[key];
};

module.exports = {
	getEnv: getEnv,
	getSecret: getSecret
};
