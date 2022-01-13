const path = require("path");
const uuid = require("uuid");
const Express = require("express");
const BodyParser = require("body-parser");
const Request = require("request");
const Sequelize = require("sequelize");
const SequelizeDb = require("./helpers/db");
const ConfigLoader = require("./helpers/config-loader");

const editKey = uuid.v4().replace(/-/g, "");

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

const handleError = (err, res) => {
	console.log("Error", err);
	res.status(500).end();
};

const app = Express();

app.use(BodyParser.urlencoded({ extended: false }));

app.use(Express.static(path.join(__dirname, "../assets")));

app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "pug");

app.get("/", (req, res) => {
	res.render("index");
});

app.get("/places", (req, res, next) => {
	Place.findAll()
			.then(places => res.json(places))
			.catch((err) => handleError(err, res));
});

app.get(`/edit/${editKey}`, (req, res, next) => {
	Place.findAll()
			.then(places => res.render("edit", { editKey, places }))
			.catch((err) => handleError(err, res));
});

app.post(`/edit/create/${editKey}`, (req, res, next) => {
	const name = req.body["name"];
	const country = req.body["country"];
	const lat = parseFloat(req.body["lat"]);
	const lon = parseFloat(req.body["lon"]);

	Place.create({ name, country, lat, lon })
			.then(() => res.redirect(`/edit/${editKey}`))
			.catch((err) => handleError(err, res));
});

app.get(`/edit/delete/${editKey}/:placeId`, (req, res, next) => {
	const placeId = req.params["placeId"];
	Place.destroy({ where: { id: placeId } })
			.then(() => res.redirect(`/edit/${editKey}`))
			.catch((err) => handleError(err, res));
});

app.get("/google-maps-api", (req, res) => {
	const apiKey = ConfigLoader.getSecret("GOOGLE_API_KEY_FILE");
	Request(`https://maps.googleapis.com/maps/api/js?callback=initMap&key=${apiKey}`, (err, full, body) => {
		res.send(body);
	});
});

console.log(`Editor URL: .../edit/${editKey}`);

const server = app.listen(3000, () => console.log("Listening on port 3000"));
process.on("SIGTERM", () => server.close(() => process.exit(0)));
