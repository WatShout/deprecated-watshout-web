
// This file contains helper functions for the main maps page
// I didn't want to have this and the maps be crowding the same file


let userID;
let email;

// Makes sure page scrolls to top on reload
window.onbeforeunload = function () {
        window.scrollTo(0,0);
    }

firebase.auth().onAuthStateChanged(function(user) {

    if (user) {

        userID = user.uid;
        email = user.email;

        ref.child(`users`).child(userID).once('value', function(snapshot) {

            // User in database
            if (!snapshot.exists()) {

                let age = prompt("Enter your age");

                ref.child(`users`).child(user.uid).update({
                    "name": user.displayName,
                    "age": parseInt(age),
                    "email": user.email
                });
            }
        });

    document.getElementById(`hello`).innerHTML = `Hello, ` +
    user.email + ` (` + user.uid + `)`;

    } else {
        console.log('logged out');
        window.location.replace(`/login`);
    }

    ref.child(`friend_requests`).child(userID).on("child_added", function(snapshot) {

        let theirID = snapshot.key;
        let request_type = snapshot.val()[`request_type`];

        if(request_type === "received"){

            ref.child('users').child(theirID).child(`email`).on('value', function(snapshot) {

                let htmlLink = `<a id="friend` + theirID + `"onclick=confirmFriend("` + theirID + `") href="#">` + snapshot.val() + `</a><br />`;

                var confirmLink = document.createElement("a");
                var linkText = document.createTextNode(theirID);
                confirmLink.appendChild(linkText);
                confirmLink.title = "Test";
                confirmLink.href = "#";
                confirmLink.onclick = function() {
                    confirmFriend(theirID);
                }

                document.body.appendChild(confirmLink);


                document.getElementById(`pending`).innerHTML += htmlLink;
            });
        }
    });

    ref.child(`friend_data`).child(userID).on(`child_added`, function(snapshot) {

            let theirID = snapshot.key;

            ref.child('users').child(theirID).child(`email`).once('value', function(snapshot) {

                let email = snapshot.val();

                document.getElementById(`accepted`).innerHTML += email + "<br /";

            });
        });

    initMap();

});

let searchByEmail = (query) => {

    ref.child('users').orderByChild('email').equalTo(query).once('value', function(snapshot) {

        if(snapshot.exists()){
            let theirID = Object.keys(snapshot.val())[0];


            ref.child(`friends`).child(theirID).child(userID).set(
                {
                    "request_type": "received"
                }
            )

            ref.child(`friends`).child(userID).child(theirID).set(
                {
                    "request_type": "sent"
                }
            )

        } else {
            console.log("Invalid email");
        }

    });
};

let searchByID = (theirID) => {

    ref.child('users').child(theirID).child(`email`).once('value', function(snapshot) {

        if(snapshot.exists()){

            return snapshot.val();

        } else {
            return "test";
        }

    });
};

let askFriend = () => {

    let friendEmail = document.getElementById(`friend`).value;

    ref.child('users').orderByChild('email').equalTo(friendEmail).once('value', function(snapshot) {

        if(snapshot.exists()){
            let theirID = Object.keys(snapshot.val())[0];

            ref.child(`friend_requests`).child(theirID).child(userID)
            .set({"request_type": "received"})

            ref.child(`friend_requests`).child(userID).child(theirID)
            .set({"request_type": "sent"})

        } else {
            console.log("Invalid email");
        }

    });

}

let confirmFriend = (theirID) => {

    let currentTime = Date.now();

    // Pushing data to friends data
    ref.child(`friend_data`).child(theirID).update(
        {[userID]: currentTime}
    );

    ref.child(`friend_data`).child(userID).update(
        {[theirID]: currentTime}
    );

    ref.child(`friend_requests`).child(userID).child(theirID).remove();
    ref.child(`friend_requests`).child(theirID).child(userID).remove();

    let element = document.getElementById(`friend` + theirID);
    element.parentNode.removeChild(element);

}

let deleteMessages = () => {

    mapRef.remove();

};
