
const ref = database.ref(`coords`);

const orgLat = 37.427148;
const orgLong = -122.10964;

let initMap = () => {

    let uluru = {lat: orgLat, lng: orgLong};

    // flightPath is a SINGLE polyline
    var flightPath;

    // flightPathArray is an ARRAY of polylines
    var flightPathArray = [];

    const map = new google.maps.Map(document.getElementById('map'), {
        zoom: 14,
        center: uluru
    });

    let markers = [];
    let markerPos = [];

    ref.on(`child_added`, function (snapshot) {

        let value = snapshot.val();

        let lat = value[`lat`];
        let long = value[`long`];
        let time = value[`time`];

        let currentLocation = {lat: lat, lng: long};

        // Center the map on current location
        map.panTo(currentLocation);

        addMarker(lat, long, time);

    });

    // Adds a marker to the map and push to the array.
    let addMarker = (lat, long, time) => {

        const beachFlag ='https://github.com/WatShout/watch-gps/raw/master/app/src/main/res/drawable/beachflag.png';
        const blueFlag = 'https://github.com/WatShout/watch-gps/raw/master/app/src/main/res/drawable/blueflag.png';
        const current = 'https://github.com/WatShout/watch-gps/raw/master/app/src/main/res/drawable/current.png';

        var image;

        let currentCoords = new google.maps.LatLng(lat, long);

        let marker = new google.maps.Marker({
            position: currentCoords,
            map: map,
            icon: current
        });

        markerPos.push(currentCoords);

        markers.push(marker);

        flightPath = new google.maps.Polyline({
          path: markerPos,
          geodesic: true,
          strokeColor: '#FF0000',
          strokeOpacity: 1.0,
          strokeWeight: 2
        });

        flightPath.setMap(map);

        flightPathArray.push(flightPath);

        if (markers.length > 0){

            for (let i = 0; i < markers.length - 1; i++){

                markers[i].setIcon(null);
                markers[i].setVisible(false);

            }
        }
    };

    let setMapOnAll = (map) => {

        for (let i = 0; i < markers.length; i++) {

            markers[i].setMap(map);
        }
    };

    // Removes the markers from the map, but keeps them in the array.
    function clearMarkers() {

        setMapOnAll(null);
        flightPath.setMap(null);

        for (let i=0; i < flightPathArray.length; i++){
              flightPathArray[i].setMap(null); //or line[i].setVisible(false);
        }

        flightPathArray = [];
        markerPos = [];
    }

    ref.on(`child_removed`, function (snapshot) {

        clearMarkers();

    });

};


let addRandomPoints = () => {

    const NorthSouth = Math.random();

    let ns;

    switch (true) {

        case NorthSouth < 0.5:
            ns = -1; // North
            break;
        case NorthSouth >= 0.5 && NorthSouth < 1:
            ns = -1; // South
            break;

    }

    const EastWest = Math.random();

    let ew;

    switch (true) {

        case EastWest < 0.5:
            ew = 1; // East
            break;
        case EastWest >= 0.5 && EastWest < 1:
            ew = -1; // West
            break;
    }

    for (let i = 0; i < 50; i++){

        let scaled = i / 1000;

        let newLat, newLong;

        if (i < 25){
            newLat = orgLat + (scaled * ew);
            newLong = orgLong + (scaled * ns);
        } else {
            newLat = (orgLat + (scaled * ew)) + (scaled * ew) - (25/1000);
            newLong = orgLong + (scaled * ns);
        }

        let time = Math.round((new Date()).getTime() / 1000);

        let newPoint = {
            lat: newLat,
            long: newLong,
            time: time
        };

        ref.push(newPoint);
    }

};


initMap();
