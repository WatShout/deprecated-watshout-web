
// This file contains helper functions for the main maps page
// I didn't want to have this and the maps be crowding the same file

let userID;

firebase.auth().onAuthStateChanged(function(user) {

    if (user) {

        userID = user.uid;

        ref.child(`users`).child(userID).once('value', function(snapshot) {

            // User in database
            if (snapshot.exists()) {

                ref.child(`users`).child(user.uid).update({
                    "new": false
                });

            } else {

                ref.child(`users`).child(user.uid).update({
                    "new": true
                });
            }

        });

    initMap();
    document.getElementById(`hello`).innerHTML = `Hello, ` + user.email;

    } else {
        console.log('logged out');
        window.location.replace(`/login`);
    }
});

let deleteMessages = () => {

    mapRef.remove();
};
