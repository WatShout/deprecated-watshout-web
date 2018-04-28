
const ref = database.ref();

const orgLat = 37.427148;
const orgLong = -122.10964;

let devices = [];

var dict = {};


let initMap = () => {

    var deviceDict = {};

    ref.once('value').then(function(snapshot) {

        let deviceList;

        try {
            deviceList = Object.keys(snapshot.val());
        } catch (TypeError) {
            deviceList = [];
        }

        for(let i = 0; i < deviceList.length; i++){

            deviceDict[String(deviceList[i])] = [[], [], []];

        }

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
        //let markerPos = [];

        let processPoints = (snapshot) => {

            let deviceID = snapshot.key;

            let keyList = Object.keys(deviceDict)

            if(!keyList.includes(deviceID)){
                deviceDict[deviceID] = [[], [], []];
            }

            let test = snapshot.val();
            let keys = Object.keys(test);

            totalList = [];

            for(var i = 0; i < keys.length; i++){
                totalList.push(test[keys[i]]);
            }

            var latestValue = totalList[totalList.length - 1];

            let lat = latestValue["lat"];
            let long = latestValue["long"];

            let currentLocation = {lat: lat, lng: long};

            // Center the map on current location
            //map.panTo(currentLocation);

            deviceDict[deviceID][2].push("test");

            addMarker(lat, long, 0, deviceID);

        };

        ref.on(`child_added`, function (snapshot) {

            processPoints(snapshot);
        });

        ref.on(`child_changed`, function (snapshot) {

            processPoints(snapshot);

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


            let currentMarker = new google.maps.Marker({
                position: currentCoords,
                map: map,
                icon: current
            });

            deviceDict[id][0].push(currentMarker);
            deviceDict[id][1].push(currentCoords);

            flightPath = new google.maps.Polyline({
              path: deviceDict[id][1],
              geodesic: true,
              strokeColor: '#FF0000',
              strokeOpacity: 1.0,
              strokeWeight: 2
            });

            flightPath.setMap(map);

            flightPathArray.push(flightPath);

            if (deviceDict[id][0].length > 0){

                for (let i = 0; i < deviceDict[id][0].length - 1; i++){

                    deviceDict[id][0][i].setIcon(null);
                    deviceDict[id][0][i].setVisible(false);

                }
            }
        };

        let setMapOnAll = (map) => {

            for (let i = 0; i < deviceDict.length; i++) {

                for (let j = 0; j < deviceDict.length; j++){

                    deviceDict[i][j] = [[], []];

                }
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
    });
};

initMap();
