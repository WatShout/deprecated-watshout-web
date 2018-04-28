
const ref = database.ref();

const orgLat = 37.427148;
const orgLong = -122.10964;

let devices = [];

var dict = {};


let initMap = () => {

    var test = {};

    ref.once('value').then(function(snapshot) {

        let deviceList = Object.keys(snapshot.val());

        for(let i = 0; i < deviceList.length; i++){

            test[String(deviceList[i])] = [[], []];

        }
    });

    console.log(deviceList);

    let uluru = {lat: orgLat, lng: orgLong};

    // flightPath is a SINGLE polyline
    var flightPath;

    // flightPathArray is an ARRAY of polylines
    var flightPathArray = [];

    const map = new google.maps.Map(document.getElementById(`map`), {
        zoom: 1,
        center: uluru
    });

    //let markers = [];
    let markerPos = [];

    let processPoints = (snapshot, child) => {

        let deviceID = snapshot.key;

        if(!devices.includes(deviceID)){
            devices.push(deviceID);
        }

        let key = child.key;
        let value = child.val();

        let keys = Object.keys(value);

        let lat = value["lat"];
        let long = value["long"];
        let time = value["time"];

        let currentLocation = {lat: lat, lng: long};

        // Center the map on current location
        //map.panTo(currentLocation);

        addMarker(lat, long, time, deviceID);

    };

    ref.on(`child_added`, function (snapshot) {

        snapshot.forEach(function(child){

            processPoints(snapshot, child);

        });
    });

    ref.on(`child_changed`, function (snapshot) {

        snapshot.forEach(function(child){

            processPoints(snapshot, child);

        });
    });

    ref.on(`child_removed`, function (snapshot) {

        clearMarkers();

    });

    // Adds a marker to the map and push to the array.
    let addMarker = (lat, long, time, id) => {

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

        var test = {
            one: "one",
            two: "two"
        }

        test["three"] = "three";

        //markerPos.push(currentCoords);

        //console.log(Object.keys(test));

        //onsole.log(Object.keys(dict));

        /*
        dict[id][0].push(marker);
        dict[id][1].push(currentCoords);

        flightPath = new google.maps.Polyline({
          path: dict[id][1],
          geodesic: true,
          strokeColor: '#FF0000',
          strokeOpacity: 1.0,
          strokeWeight: 2
        });

        flightPath.setMap(map);

        flightPathArray.push(flightPath);

        if (dict[id][0].length > 0){

            for (let i = 0; i < dict[id][0].length - 1; i++){

                dict[id][0][i].setIcon(null);
                dict[id][0][i].setVisible(false);

            }
        }

        */
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
};

initMap();
