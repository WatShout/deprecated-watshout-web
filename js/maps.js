// Makes sure to get the REFERENCE of the Firebase
const ref = database.ref();

// Ideally these will be set as 'home' coordinate
const orgLat = 37.427148;
const orgLong = -122.10964;

const beachFlag =`https://github.com/WatShout/watch-gps/raw/master/app/src/main/res/drawable/beachflag.png`;
const blueFlag = `https://github.com/WatShout/watch-gps/raw/master/app/src/main/res/drawable/blueflag.png`;
const current = `https://github.com/WatShout/watch-gps/raw/master/app/src/main/res/drawable/current.png`;

const zoomedOut = 1;

let initMap = () => {

    /* Dictionary that keeps track of every device
    deviceDict = {
                    0                1                  2               3
        deviceID = [[Marker Values],[Co-Ordinate Value],[Polylines], [most recent time]]

    }
    */

    var deviceDict = {};

    let createHTMLEntry = (id) => {

      let html =
      `<div class="deviceinfo" sid="` + id + `"><h5>Device Name: ` + id + `</h1>` +
      `\n<div id="lat` + id + `">Lat: </div>` +
      `\n<div id="long` + id + `">Long: </div>` +
      `\n<div id="update` + id + `">Last Update: </div>` +
      `\n<div id="time` + id + `">Time: </div>` +
      `\n<div id="speed` + id + `">Speed: </div>` +
      `\n<div id="bearing` + id + `">Bearing: </div>` +
      `\n<input id="click` + id +`" type="button" value="Locate" />` +
       `</div>`;

       return html;
    };

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

        // Goes through deviceList, and initializes a key/value pair inspect
        // in the dictionary with the device name, and the array of three
        // blank arrays.
        for (let i = 0; i < deviceList.length; i++){

            deviceDict[String(deviceList[i])] = [[], [], [], []];

            let deviceHTML = createHTMLEntry(deviceList[i]);

            document.getElementById(`devices`).innerHTML += deviceHTML;

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
                deviceDict[deviceID] = [[], [], [], []];

                let deviceHTML = createHTMLEntry(deviceID);

                document.getElementById(`devices`).innerHTML += deviceHTML;

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
                let speed = latestValue[`speed`];
                let bearing = latestValue[`bearing`];

                let currentLocation = {lat: lat, lng: long};

                addMarker(lat, long, time, speed, bearing, deviceID);
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
                    let speed = currentValue[`speed`];
                    let bearing = currentValue[`bearing`];

                    let currentLocation = {lat: lat, lng: long};

                    addMarker(lat, long, time, speed, bearing, deviceID);

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

            let id = snapshot.key;

            deviceDict[id] = [[], [], [], []];

            document.getElementById(id).innerHTML = ``;

        });

        let round = (value, decimals) => {

          return Number(Math.round(value+'e'+decimals)+'e-'+decimals);

        };

        // Create a new JavaScript Date object based on the timestamp
        let formatTime = (milliseconds) => {

          // multiplied by 1000 so that the argument is in milliseconds, not seconds.
          let date = new Date(milliseconds);
          // Hours part from the timestamp
          let hours = date.getHours();
          // Minutes part from the timestamp
          let minutes = "0" + date.getMinutes();
          // Seconds part from the timestamp
          let seconds = "0" + date.getSeconds();

          // Will display time in 10:30:23 format
          let formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);

          return formattedTime
        };

        let changeHTML = (id, label, value) => {

            let lower = label.toLowerCase();

            let newValue = label + ": " + value;

            document.getElementById(lower + id).innerHTML = newValue;

        };

        // Adds a marker to the map and push to the array.
        let addMarker = (lat, long, time, speed, bearing, id) => {

            deviceDict[id][3] = time;

            changeHTML(id, `lat`, round(lat, 7));
            changeHTML(id, `long`, round(long, 7));

            changeHTML(id, `time`, formatTime(time));
            //document.getElementById(`time` + id).innerHTML = `Last Update Time: ` + formatTime(time);

            // TODO: Need to find some way to ensure there is only one EventListener at a time
            // document.getElementById(`click` + id).removeEventListener()
            document.getElementById(`click` + id).addEventListener(`click`,
                function (){
                    map.panTo({lat: lat, lng: long});
                });

            document.getElementById(`speed` + id).innerHTML = `Speed: ` + round(speed, 7);
            document.getElementById(`bearing` + id).innerHTML = `Bearing: ` + round(bearing, 7) + `&#176`;

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
            let test = `<h2>This is a test</h2><h3>Hello</h3>`;

            // Create HTML string to be displayed in infowindow
            let infoContent =
            `<p>Device ID: ` + id + `</p>` +
            `<p>Speed: ` + speed + `</p>` +
            `<p>Bearing: ` + bearing + `</p>` +
            `<p>Time: ` + time + `</p>`;

            let infowindow = new google.maps.InfoWindow({
                content: infoContent
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
            deviceDict[id][2].push(currentPolyLine);

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

        // TODO:  This still needs work
        let removeLines = (device, opacity) => {

            for(let i = 0; i < deviceDict[device][2].length; i++){
                deviceDict[device][2][i].strokeOpacity = opacity;
            }

        };

        setInterval(function() {

          let date = new Date();
          let time = date.getTime() / 1000;

          for(let i = 0; i < deviceList.length; i++){

              let deviceDate = deviceDict[deviceList[i]][3] / 1000;

              // No clue what this weird constant is 86401 but it works
              let difference = (time - deviceDate) - 2* 86401;
              document.getElementById(`update` + deviceList[i])
              .innerHTML = `Last Update: ` + round(difference, 0) + `s ago`;

          }
        }, 1000);

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

        document.getElementById(`zoomout`).onclick = function () {

            map.setZoom(zoomedOut);

        };
    });
};

initMap();
