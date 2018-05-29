let startingPosition = {lat: 37, lng: -122};

let deviceDict = {};

// Initializes the Google Map.
const map = new google.maps.Map(document.getElementById(`map`), {
    zoom: 1,
    center: startingPosition,
    clickableIcons: false,
    //disableDefaultUI: true,

});

let initMap = () => {

ref.child(`friend_data`).child(userID).once(`value`).then(function(snapshot) {

    let keys;

    try {
        keys = Object.keys(snapshot.val())
    } catch(TypeError){
        keys = [];
    }

    for(let i = 0; i < keys.length; i++){

        let currentID = String(keys[i]);

        deviceDict[currentID] = [];

        let deviceHTML = createHTMLEntry(currentID);

        document.getElementById(`devices`).innerHTML += deviceHTML;

        let thisRef = ref.child(`users`).child(currentID).child(`device`).child(`current`);

        // Loads points that were made before page load
        thisRef.on(`child_added`, function (snapshot) {

            addPoint(snapshot, currentID, map);

        });

        // Loads real-time points
        thisRef.on(`child_changed`, function (snapshot) {

            addPoint(snapshot, currentID, map);

        });

        thisRef.on(`child_removed`, function (snapshot) {

            document.getElementById(currentID).innerHTML = ``;

            let length = deviceDict[currentID].length;

            deviceDict[currentID][length - 1].setMap(null);

            deviceDict[currentID] = [];

        })
    }

    });
};

// Gets needed values from snapshot object
let getValues = (snapshot) => {

    let values = {};

    values["lat"] = snapshot.val()["lat"];
    values["lon"] = snapshot.val()["lon"];
    values["time"] = snapshot.val()["time"];
    values["speed"] = snapshot.val()["speed"];
    values["bearing"] = snapshot.val()["bearing"];
    values["battery"] = snapshot.val()["battery"];

    return values;

};

// Performs HTML updates for every tag
let updateHTML = (id, values, map) => {

    changeHTMLTag(id, `Device`, id);
    changeHTMLTag(id, `Speed`, values["speed"]);
    changeHTMLTag(id, `Time`, formatTime(values["time"]));
    changeHTMLTag(id, `Battery`, round(values["battery"], 0) + `%`);

    document.getElementById(`click` + id).onclick = function () {
        map.panTo({lat: values["lat"], lng: values["lon"]});
    }

    document.getElementById(`past` + id).onclick = function () {
        getPast(id);
    }

};

let getPast = (id) => {

    ref.child(`users`).child(id).child(`device`).child(`past`).orderByChild(`time`).limitToLast(1).once("value", function(snapshot) {

        let key = Object.keys(snapshot.val());

        let path = snapshot.child(key).child(`path`);

        path.forEach(function (childSnapshot) {

            addPoint(childSnapshot, id, map);

            // Once the button is clicked once, it doesn't do anything
            document.getElementById(`past` + id).onclick = function() {};

        })
    });
}

let addPoint = (snapshot, currentID, map) => {

    // Values contains everything from snapshot
    let values = getValues(snapshot);

    updateHTML(currentID, values, map);

    // Adds marker to map
    let currentMarker = new google.maps.Marker({
        position: {
            lat: values["lat"],
            lng: values["lon"]
        },
        map: map
    });

    let length = deviceDict[currentID].length;

    // If list only has one object, then previous is the same as current
    if (length != 0) {
        deviceDict[currentID][length - 1].setVisible(false);
    }

    deviceDict[currentID].push(currentMarker);

    createLine(deviceDict[currentID], map);


};

let createLine = (markers, map) => {

    let currentPath = []

    for (let i = 0; i < markers.length; i++){

        currentPath.push({
            lat: markers[i].getPosition().lat(),
            lng: markers[i].getPosition().lng()
        });

    }

    if (length > 0) {

        let currentLine = new google.maps.Polyline({
            path: currentPath,
            geodesic: true,
            strokeColor: `#FF0000`,
            strokeOpacity: 1.0,
            strokeWeight: 6
        });

        currentLine.setMap(map);

    }

};

// Create a new JavaScript Date object based on the timestamp
let formatTime = (milliseconds) => {

    let date = new Date(milliseconds);
    let hours = date.getHours();
    let minutes = "0" + date.getMinutes();
    let seconds = "0" + date.getSeconds();

    // Will display time in 10:30:23 format
    return hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);

};

let createHTMLEntry = (id) => {

    let html =
    `<div class="deviceinfo" id="` + id + `">` +
    `\n<h5 id="device` + id + `">Device Name: ` + id + `</h1>` +
    `\n<div id="battery` + id + `">Battery: </div>` +
    `\n<div id="time` + id + `">Time: </div>` +
    `\n<div id="speed` + id + `">Speed: </div>` +
    `\n<input id="click` + id +`" type="button" value="Locate" />` +
    `\n<input id="past` + id +`" type="button" value="Past"/>` +
    `</div>`;

    return html;
};

let changeHTMLTag = (id, label, value) => {

    let lower = label.toLowerCase();

    let newValue = label + ": " + value;

    try{
        document.getElementById(lower + id).innerHTML = newValue;
    } catch(TypeError){
        createHTMLEntry(id);
        document.getElementById(lower + id).innerHTML = newValue;
    }
};

let round = (value, decimals) => {

    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);

};

let signOut = () => {
    firebase.auth().signOut().then(function() {

        window.location.replace(`/login`);

    }, function(error) {
      // An error happened.
    });
}
