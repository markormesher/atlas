const path = require('path');
const express = require('express');
const request = require('request');
const Storage = require('node-storage');
const configLoader = require('./helpers/config-loader');

const googleApiKey = configLoader.getSecret('google.api.key');
const placeStore = new Storage('/data/places');

const app = express();

app.use(express.static(path.join(__dirname, 'static')));

app.get('/places', (req, res) => res.json(placeStore.get('places') || []));

app.get('/google-maps-api', (req, res) => {
	request('https://maps.googleapis.com/maps/api/js?key=' + googleApiKey + '&callback=initMap', (err, full, body) => {
		res.send(body);
	});
});

app.listen(3000, () => console.log('Listening on port 3000'));
