// Makes sure to get the REFERENCE of the Firebase
const ref = database.ref();

// Ideally these will be set as 'home' coordinate
const orgLat = 37.427148;
const orgLong = -122.10964;

const beachFlag =`https://github.com/WatShout/watch-gps/raw/master/app/src/main/res/drawable/beachflag.png`;
const blueFlag = `https://github.com/WatShout/watch-gps/raw/master/app/src/main/res/drawable/blueflag.png`;
const current = `https://github.com/WatShout/watch-gps/raw/master/app/src/main/res/drawable/current.png`;

const north = `https://raw.githubusercontent.com/WatShout/watshout.github.io/master/public/res/north.png`
const east = `https://raw.githubusercontent.com/WatShout/watshout.github.io/master/public/res/east.png`
const south = `https://raw.githubusercontent.com/WatShout/watshout.github.io/master/public/res/south.png`
const west = `https://raw.githubusercontent.com/WatShout/watshout.github.io/master/public/res/west.png`

const zoomedOut = 1;

const markers = 0;
const coords = 1;
const polylines = 2;
const time = 3;
const visible = 4;

let initMap = () => {

    /* Dictionary that keeps track of every device
    deviceDict = {
    0                1                  2               3                 4
    deviceID = [[Marker Values],[Co-Ordinate Value],[Polylines], [most recent time], [lines toggled]]

}
*/

window.onload = function() {
    firebase.auth().onAuthStateChanged(function(user) {
        //var user = firebase.auth().currentUser;
        if (user) {
            console.log('logged in');
        } else {
            console.log('logged out');
        }
    });
}

var deviceDict = {};

let createHTMLEntry = (id) => {

    let html =
    `<div class="deviceinfo" id="` + id + `">` +
    `\n<h5 id="device` + id + `">Device Name: ` + id + `</h1>` +
    `\n<div id="battery` + id + `">Battery: </div>` +
    `\n<div id="lat` + id + `">Lat: </div>` +
    `\n<div id="long` + id + `">Long: </div>` +
    `\n<div id="update` + id + `">Last Update: </div>` +
    `\n<div id="time` + id + `">Time: </div>` +
    `\n<div id="speed` + id + `">Speed: </div>` +
    `\n<div id="bearing` + id + `">Bearing: </div>` +
    `\n<div><img id="bearingimg` + id + `"></div>` +
    `\n<input id="toggle` + id +`" type="button" value="Toggle" />` +
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

        let id = String(deviceList[i]);

        deviceDict[id] = [[], [], [], [], []];
        deviceDict[id][visible] = true;

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
            deviceDict[deviceID] = [[], [], [], [], []];
            deviceDict[deviceID][visible] = true;

            let deviceHTML = createHTMLEntry(deviceID);

            deviceList.push(deviceID);

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
            let battery = latestValue[`battery`];

            let currentLocation = {lat: lat, lng: long};

            addMarker(lat, long, time, speed, bearing, battery, deviceID);
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
                let battery = currentValue[`battery`];

                let currentLocation = {lat: lat, lng: long};

                addMarker(lat, long, time, speed, bearing, battery, deviceID);

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

        deviceDict[id] = [[], [], [], [], []];

        document.getElementById(id).innerHTML =
        `<div class="deviceinfo" id="` + id + `">` +
        `\n<h5 id="device` + id + `"></h1>` +
        `\n<div id="battery` + id + `"></div>` +
        `\n<div id="lat` + id + `"></div>` +
        `\n<div id="long` + id + `"></div>` +
        `\n<div id="update` + id + `"></div>` +
        `\n<div id="time` + id + `"></div>` +
        `\n<div id="speed` + id + `"></div>` +
        `\n<div id="bearing` + id + `"></div>` +
        `\n<input id="click` + id +`" type="button" value="Locate" />`;

        document.getElementById(`click` + id).style.visibility = `hidden`;

        let index = deviceList.indexOf(id);

        if (index > -1) {
            deviceList.splice(index, 1);
        }

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

        try{
            document.getElementById(lower + id).innerHTML = newValue;
        } catch(TypeError){
            createHTMLEntry(id);
            document.getElementById(lower + id).innerHTML = newValue;
        }
    };

    let getCompassDirection = (bearing) => {

        if(bearing >= 0 && bearing < 90){
            return north;
        } else if(bearing >= 90 && bearing < 180){
            return east;
        } else if(bearing >= 180 && bearing < 270){
            return south;
        } else if(bearing >= 270 && bearing < 360){
            return west;
        }
    };

    // Adds a marker to the map and push to the array.
    let addMarker = (lat, long, time, speed, bearing, battery, id) => {

        deviceDict[id][3] = time;

        let currentDirection = getCompassDirection(bearing);
        document.getElementById(`bearingimg` + id).src = currentDirection;

        changeHTML(id, `Device`, id);
        changeHTML(id, `Lat`, round(lat, 7));
        changeHTML(id, `Long`, round(long, 7));
        changeHTML(id, `Battery`, round(battery, 0) + `%`);

        changeHTML(id, `Time`, formatTime(time));
        //document.getElementById(`time` + id).innerHTML = `Last Update Time: ` + formatTime(time);

        // TODO: Need to find some way to ensure there is only one EventListener at a time
        // document.getElementById(`click` + id).removeEventListener()
        document.getElementById(`click` + id).addEventListener(`click`,
            function (){
                map.panTo({lat: lat, lng: long});
            });

            document.getElementById(`speed` + id).innerHTML = `Speed: ` + round(speed, 1);
            document.getElementById(`bearing` + id).innerHTML = `Bearing: ` + round(bearing, 0) + `&#176`;

            // This will toggle the polyline on the map and the color of the button
            document.getElementById(`toggle` + id).onclick = function () {

                for(let i = 0; i < deviceDict[id][polylines].length; i++){

                    if(deviceDict[id][visible]){
                        deviceDict[id][polylines][i].strokeOpacity = 0.0;
                        deviceDict[id][polylines][i].setMap(null);
                        //deviceDict[id][markers][i].setVisible(false);
                    } else {
                        deviceDict[id][polylines][i].strokeOpacity = 1.0;
                        deviceDict[id][polylines][i].setMap(map);
                        //deviceDict[id][markers][i].setVisible(true);
                    }
                }

                let element = document.getElementById(`toggle` + id);
                let color;

                if(deviceDict[id][visible]){
                    color = `#FF0000`;
                } else {
                    color = `#838c1d`;
                }

                element.style.background = color;

                deviceDict[id][visible] = !deviceDict[id][visible];

            };

            // Creates a LatLng object (needed for the Marker)
            let currentCoords = new google.maps.LatLng(lat, long);

            // Creates a reference to a Marker that is automatically
            // added to the map. By default, this marker has the
            // 'current location' icon.
            let currentMarker = new google.maps.Marker({
                position: currentCoords,
                map: map,
                icon: current,
                optimized: false,
                size: new google.maps.Size(50, 50),
            });

            // Right now this just displays the time the marker was added
            let test = `<h2>This is a test</h2><h3>Hello</h3>`;

            // Create HTML string to be displayed in infowindow
            let infoContent =
            `<p>Device ID: ` + id + `</p>` +
            `<p>Time: ` + formatTime(time) + `</p>` +
            `<p>Speed: ` + round(speed, 1) + `</p>` +
            `<p>Bearing: ` + round(bearing, 0) + `&#176` + `</p>`;

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

            currentMarker.addListener('mouseover', function() {
                infowindow.open(map, this);
            });

            // assuming you also want to hide the infowindow when user mouses-out
            currentMarker.addListener('mouseout', function() {
                infowindow.close();
            });

            // Pushes to the current device's arrays
            deviceDict[id][0].push(currentMarker);
            deviceDict[id][1].push(currentCoords);

            // Creates polyline
            let currentPolyLine = new google.maps.Polyline({
                path: deviceDict[id][1],
                geodesic: true,
                strokeColor: `#a8a806`,
                strokeOpacity: 1.0,
                strokeWeight: 5
            });

            // // TODO: work on this
            currentPolyLine.addListener('mouseover', function() {

                const clonePath = JSON.parse(JSON.stringify(deviceDict[id][1]))
                const length = deviceDict[id][0].length

                console.log(length);
                let infoContent =
                `<p>Device ID: ` + id + `</p>` +
                `<p>Time: ` + formatTime(time) + `</p>` +
                `<p>Speed: ` + round(speed, 1) + `</p>` +
                `<p>Bearing: ` + round(bearing, 0) + `&#176` + `</p>`;

                let infowindow = new google.maps.InfoWindow({
                    content: infoContent
                });

                infowindow.open(map, this);
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

                    //deviceDict[id][0][i].setIcon(`https://github.com/WatShout/watshout.github.io/raw/cafdb08c6be1a01805e78cde92272fa7072074de/res/blank.png`);
                    deviceDict[id][0][i].setIcon(null);
                    deviceDict[id][0][i].setVisible(false);

                }
            }
        };

        setInterval(function() {

            let date = new Date();
            let time = date.getTime() / 1000;

            for(let i = 0; i < deviceList.length; i++){

                let deviceDate = deviceDict[deviceList[i]][3] / 1000;

                // No clue what this weird constant is 86401 but it works
                // It seems like the Android emulator gives wrong GPS time for some reason
                let difference = (time - deviceDate);

                try {
                    document.getElementById(`update` + deviceList[i])
                    .innerHTML = `Last Update: ` + round(difference, 0) + `s ago`;
                }
                catch(TypeError) {

                }
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
