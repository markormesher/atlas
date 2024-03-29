const path = require("path");
const uuid = require("uuid");
const Express = require("express");
const ExpressBasicAuth = require("express-basic-auth");
const BodyParser = require("body-parser");
const Sequelize = require("sequelize");
const SequelizeDb = require("./helpers/db");
const ConfigLoader = require("./helpers/config-loader");

let adminPassword = ConfigLoader.getSecret("ADMIN_PASSWORD_FILE");
if (!adminPassword) {
  adminPassword = uuid.v4().replace(/-/g, "");
  console.log(`Randomly generated admin password: ${adminPassword}`);
}

const authMiddleware = ExpressBasicAuth({
  users: { admin: adminPassword },
  challenge: true,
  realm: `atlas-${new Date().getTime()}}`,
});

// db

const Place = SequelizeDb.define("place", {
  name: Sequelize.STRING,
  country: Sequelize.STRING,
  lat: Sequelize.DOUBLE,
  lon: Sequelize.DOUBLE,
});

SequelizeDb.sync()
  .then(() => {
    console.log("Database models synced successfully");
  })
  .catch((err) => {
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
    .then((places) => res.json(places))
    .catch((err) => handleError(err, res));
});

app.get(`/mapbox-token`, (req, res, next) => {
  res.send(ConfigLoader.getSecret("MAPBOX_TOKEN_FILE"));
});

app.get(`/edit`, authMiddleware, (req, res, next) => {
  Place.findAll()
    .then((places) => res.render("edit", { places }))
    .catch((err) => handleError(err, res));
});

app.post(`/edit/create`, authMiddleware, (req, res, next) => {
  const name = req.body["name"];
  const country = req.body["country"];
  const lat = parseFloat(req.body["lat"]);
  const lon = parseFloat(req.body["lon"]);

  Place.create({ name, country, lat, lon })
    .then(() => res.redirect(`/edit`))
    .catch((err) => handleError(err, res));
});

app.get(`/edit/delete/:placeId`, authMiddleware, (req, res, next) => {
  const placeId = req.params["placeId"];
  Place.destroy({ where: { id: placeId } })
    .then(() => res.redirect(`/edit`))
    .catch((err) => handleError(err, res));
});

const server = app.listen(3000, () => console.log("Listening on port 3000"));
process.on("SIGTERM", () => server.close(() => process.exit(0)));
