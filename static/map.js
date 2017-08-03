function initMap() {
	var map = new google.maps.Map(document.getElementById("map"), {
		zoom: 2,
		center: {
			lat: 39,
			lng: 34
		}
	});

	var http = new XMLHttpRequest();
	http.onreadystatechange = () => {
		if (http.readyState === 4 && http.status === 200) {
			addPlaces(map, JSON.parse(http.responseText));
		}
	};
	http.open("GET", "/places", true);
	http.send(null);
}

function addPlaces(map, places) {
	var countries = [];

	for (var i = 0; i < places.length; ++i) {
		if (countries.indexOf(places[i]["country"]) === -1) {
			countries.push(places[i]["country"]);
		}
		new google.maps.Marker({
			map: map,
			position: {
				lat: places[i]["lat"],
				lng: places[i]["lon"]
			}
		});
	}
	
	document.getElementById("overlay").innerHTML = places.length + " places in " + countries.length + " countries";
};
