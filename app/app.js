const path = require('path');
const Express = require('express');
const request = require('request');
const Sequelize = require('sequelize');
const SequelizeDb = require('./helpers/db');
const ConfigLoader = require('./helpers/config-loader');

// db

const Place = SequelizeDb.define('place', {
	name: Sequelize.STRING,
	country: Sequelize.STRING,
	lat: Sequelize.DOUBLE,
	lon: Sequelize.DOUBLE
});

SequelizeDb.sync().then(() => {
	console.log('Database models synced successfully');
}).catch(err => {
	console.log('Failed to sync database models');
	console.log(err);
});

// app

const app = Express();

app.use(Express.static(path.join(__dirname, 'static')));

app.get('/places', (req, res, next) => Place.findAll().then(places => res.json(places)).catch(next));

app.get('/google-maps-api', (req, res) => {
	request('https://maps.googleapis.com/maps/api/js?key=' + ConfigLoader.getSecret('google.api.key') + '&callback=initMap', (err, full, body) => {
		res.send(body);
	});
});

app.listen(3000, () => console.log('Listening on port 3000'));
