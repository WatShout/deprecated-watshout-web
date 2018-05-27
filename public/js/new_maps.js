let initMap = () => {

ref.child(`friend_data`).child(userID).once(`value`).then(function(snapshot) {

    let startingPosition = {lat: 0, lng: 0};

    // Initializes the Google Map.
    const map = new google.maps.Map(document.getElementById(`map`), {
        zoom: 16,
        center: startingPosition,
        clickableIcons: false,
        //disableDefaultUI: true,

    });

    let keys = Object.keys(snapshot.val())

    for(let i = 0; i < keys.length; i++){

        let thisRef = ref.child(`users`).child(String(keys[i])).child(`device`).child(`current`);

        thisRef.on(`child_added`, function (snapshot) {
            console.log(snapshot.val());
        });

    }

    });
};
