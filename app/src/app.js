const path = require("path");
const Express = require("express");
const request = require("request");
const Sequelize = require("sequelize");
const SequelizeDb = require("./helpers/db");
const ConfigLoader = require("./helpers/config-loader");

// db

const Place = SequelizeDb.define("place", {
	name: Sequelize.STRING,
	country: Sequelize.STRING,
	lat: Sequelize.DOUBLE,
	lon: Sequelize.DOUBLE
});

SequelizeDb.sync().then(() => {
	console.log("Database models synced successfully");
}).catch(err => {
	console.log("Failed to sync database models");
	console.log(err);
});

// app

const app = Express();

app.use(Express.static(path.join(__dirname, "../assets")));
app.use(Express.static(path.join(__dirname, "../views")));

app.get("/places", (req, res, next) => {
	Place.findAll()
			.then(places => res.json(places))
			.catch(next);
});

app.get("/edit", (req, res, next) => {
	if (req.query.secret !== ConfigLoader.getSecret("auth.secret")) {
		res.redirect("/");
		return;
	}

	Place.findAll()
			.then(places => res.json(places))
			.catch(next);
});

app.get("/google-maps-api", (req, res) => {
	const apiKey = ConfigLoader.getSecret("google.api.key");
	request(`https://maps.googleapis.com/maps/api/js?callback=initMap&key=${apiKey}`, (err, full, body) => {
		res.send(body);
	});
});

const server = app.listen(3000, () => console.log("Listening on port 3000"));
process.on("SIGTERM", () => server.close(() => process.exit(0)));
