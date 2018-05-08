// Makes sure to get the REFERENCE of the Firebase
const ref = database.ref();

// Ideally these will be set as 'home' coordinate
const orgLat = 37.427148;
const orgLong = -122.10964;

const beachFlag =`https://github.com/WatShout/watch-gps/raw/master/app/src/main/res/drawable/beachflag.png`;
const blueFlag = `https://github.com/WatShout/watch-gps/raw/master/app/src/main/res/drawable/blueflag.png`;
const current = `https://github.com/WatShout/watch-gps/raw/master/app/src/main/res/drawable/current.png`;

let initMap = () => {

    /* Dictionary that keeps track of every device
    deviceDict = {
                    0                1                  2
        deviceID = [[Marker Values],[Co-Ordinate Value],[Test]]

    }
    */

    var deviceDict = {};

    // When the page is loaded, runs an initial ONCE function to
    // check for values that are already present in Firebase
    ref.once(`value`).then(function(snapshot) {

        let deviceList;

        // Populates the list with the device IDs (given by the parent names
        // in the database strcuture). If database is empty, just initializes
        // a blank array.
        try {
            deviceList = Object.keys(snapshot.val());
        } catch (TypeError) {
            deviceList = [];
        }

        // Updates the page with the 'active' devices list.
        document.getElementById(`connected`).innerHTML += deviceList;

        // Goes through deviceList, and initializes a key/value pair inspect
        // in the dictionary with the device name, and the array of three
        // blank arrays.
        for (let i = 0; i < deviceList.length; i++){

            deviceDict[String(deviceList[i])] = [[], [], []];

        }

        let startingPosition = {lat: orgLat, lng: orgLong};

        // polylineArray is an ARRAY of polylines
        var polylineArray = [];

        // Initializes the Google Map.
        const map = new google.maps.Map(document.getElementById(`map`), {
            zoom: 16,
            center: startingPosition
        });

        // This function is run for every new 'child' added to the database
        let processPoints = (snapshot, alreadyExists) => {

            let deviceID = snapshot.key;

            // Current list of all the 'keys' in deviceDict
            let keyList = Object.keys(deviceDict)

            // If the currently device isn't defined in the dict,
            // define it. Also updates front-end.
            if(!keyList.includes(deviceID)){
                deviceDict[deviceID] = [[], [], []];
                document.getElementById(`connected`).innerHTML += deviceID;
            }

            // snapShotValue is an array(?) containing every child in that
            // specific device's part of the database. Keys is just a list of
            // all the Firebase-generated names e.g. "-LF329fAjf0sAf0"
            let snapshotValue = snapshot.val();
            let keys = Object.keys(snapshotValue);

            totalList = [];

            // Takes EVERYTHING from the snapshot, parses each 'child' as an
            // individual object, then pushes to totalList
            for(var i = 0; i < keys.length; i++){
                totalList.push(snapshotValue[keys[i]]);
            }

            // This occurs as device location is being updated in real-time.
            // It just gets the last value from totalList and adds that
            // ONE marker to the map.
            // 'child_changed'
            if (!alreadyExists){
                var latestValue = totalList[totalList.length - 1];

                let lat = latestValue[`lat`];
                let long = latestValue[`long`];
                let time = latestValue[`time`];

                let currentLocation = {lat: lat, lng: long};

                // Center the map on current location
                //map.panTo(currentLocation);

                addMarker(lat, long, time, deviceID);
            }

            // On page load, this makes sure that all the previously-added
            // points are still put on the map.
            // 'child_added'
            else {

                for (let j = 0; j < totalList.length; j++){

                    let currentValue = totalList[j];
                    let lat = currentValue[`lat`];
                    let long = currentValue[`long`];
                    let time = currentValue[`time`];

                    let currentLocation = {lat: lat, lng: long};

                    addMarker(lat, long, time, deviceID);

                }
            }
        };

        ref.on(`child_added`, function (snapshot) {

            processPoints(snapshot, true);

        });

        ref.on(`child_changed`, function (snapshot) {

            processPoints(snapshot, false);

        });

        ref.on(`child_removed`, function (snapshot) {

            clearMarkers();

        });

        // Adds a marker to the map and push to the array.
        let addMarker = (lat, long, time, id) => {

            // Creates a LatLng object (needed for the Marker)
            let currentCoords = new google.maps.LatLng(lat, long);

            // Creates a reference to a Marker that is automatically
            // added to the map. By default, this marker has the
            // 'current location' icon.
            let currentMarker = new google.maps.Marker({
                position: currentCoords,
                map: map,
                icon: current
            });

            // Right now this just displays the time the marker was added
            let infowindow = new google.maps.InfoWindow({
                content: `Time: ` + time
            });

            // Adds info window listener
            currentMarker.addListener('click', function() {
                infowindow.open(currentMarker.get(`map`), currentMarker);
            });

            // When any marker is clicked, the map zooms into 'street-level'
            currentMarker.addListener(`click`, function() {
                map.setZoom(16);
                map.setCenter(currentMarker.getPosition());
            });

            // Pushes to the current device's arrays
            deviceDict[id][0].push(currentMarker);
            deviceDict[id][1].push(currentCoords);

            // Creates polyline
            let currentPolyLine = new google.maps.Polyline({
              path: deviceDict[id][1],
              geodesic: true,
              strokeColor: `#FF0000`,
              strokeOpacity: 1.0,
              strokeWeight: 2
            });

            // Adds polyline to map
            currentPolyLine.setMap(map);

            // Adds the current polyline reference to one big array.
            // This helps with clearing the map supposedly
            polylineArray.push(currentPolyLine);

            // For devices with more than one plotted location
            // (i.e. almost all of them), this makes sure that only the
            // most recent location has the icon. The previous points are
            // just a poleline
            if (deviceDict[id][0].length > 0){

                for (let i = 0; i < deviceDict[id][0].length - 1; i++){

                    deviceDict[id][0][i].setIcon(null);
                    deviceDict[id][0][i].setVisible(false);

                }
            }
        };

        // Obliterates everything (locally).
        let setMapOnAll = (map) => {

            let keyList = Object.keys(deviceDict);

            console.log(keylist);

            for (let i = 0; i < deviceDict.length; i++) {


                for (let j = 0; j < deviceDict.length; j++){

                    deviceDict[i][j] = [[], []];

                }
            }
        };
    });
};

initMap();
