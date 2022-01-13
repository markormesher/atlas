const Sequelize = require("sequelize");
const ConfigLoader = require("./config-loader");

const sequelize = new Sequelize({
	host: ConfigLoader.getEnv("POSTGRES_HOST"),
	username: ConfigLoader.getEnv("POSTGRES_USER"),
	password: ConfigLoader.getSecret("POSTGRES_PASSWORD_FILE"),
	database: ConfigLoader.getEnv("POSTGRES_DATABASE"),
	dialect: "postgres",
	operatorsAliases: false,
});

module.exports = sequelize;
