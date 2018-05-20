
// This file contains helper functions for the main maps page
// I didn't want to have this and the maps be crowding the same file

// I am just testing git branches

let userID;
let email;

firebase.auth().onAuthStateChanged(function(user) {

    if (user) {

        userID = user.uid;
        email = user.email;

        ref.child(`users`).child(userID).once('value', function(snapshot) {

            // User in database
            if (!snapshot.exists()) {

                document.getElementById(`newuser`).innerHTML = `
                            <h3>New User Info</h3>
                              <div>
                                <label>Name:</label>
                                <input type="text" id="name">
                              </div>
                              <div>
                                <label>Age:</label>
                                <input type="text" id="age">
                              </div>
                              <input type="button" onclick="submitUserInfo()" id="submitinfo" value="Submit"  />`;

              alert(`Please fill out new user info at the top of the page!`);

            }
        });

        initMap();

        document.getElementById(`hello`).innerHTML = `Hello, ` +
        user.email + ` (` + user.uid + `)`;

    } else {
        console.log('logged out');
        window.location.replace(`/login`);
    }

    ref.child(`friend_requests`).child(userID).on("child_added", function(snapshot) {

        let theirID = snapshot.key;
        let request_type = snapshot.val()[`request_type`];

        ref.child('users').child(theirID).child(`email`).on('value', function(snapshot) {

            let htmlText;
            let domID;
            let theirEmail = snapshot.val();

            if(request_type === "sent"){
                htmlLink = `<a id="friend` + theirID + `"onclick=confirmFriend("` + theirID + `") href="#">` + theirEmail + `</a><br />`;
                domID = `pending`;
            } else if(request_type === "received"){
                htmlLink = theirEmail;
                domID = `waiting`;
            }

            document.getElementById(domID).innerHTML += htmlLink;
        });
    });

    ref.child(`friend_data`).child(userID).on(`child_added`, function(snapshot) {

        let theirID = snapshot.key;

        ref.child('users').child(theirID).child(`email`).once('value', function(snapshot) {

            let theirEmail = snapshot.val();

            let htmlLink = `<a id="friend` + theirID + `"onclick=removeFriend("` + theirID + `") href="#">` + theirEmail + `</a><br />`;

            document.getElementById(`accepted`).innerHTML += htmlLink;

        });
    });

    ref.child(`friend_data`).child(userID).on(`child_removed`, function(snapshot) {

        // FIGURE OUT WHAT TO DO WHEN UNFRIENDED

    });
});

let searchByEmail = (query) => {

    ref.child('users').orderByChild('email').equalTo(query).once('value', function(snapshot) {

        if(snapshot.exists()){
            let theirID = Object.keys(snapshot.val())[0];


            ref.child(`friends`).child(theirID).child(userID).set(
                {
                    "request_type": "sent"
                }
            );

            ref.child(`friends`).child(userID).child(theirID).set(
                {
                    "request_type": "received"
                }
            );

        } else {
            console.log("Invalid email");
        }

    });
};

let submitUserInfo = () => {

    let name = document.getElementById(`name`).value;
    let age = document.getElementById(`age`).value;

    if(isNaN(age)){
        age = 0
    }

    ref.child(`users`).child(userID).update({
        "name": name,
        "age": parseInt(age),
        "new": false,
        "email": email
    });

    let element = document.getElementById(`newuser`);
    element.parentNode.removeChild(element);
}

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

    document.getElementById(`friend`).value = ``;

    friendEmail = friendEmail.toLowerCase();
    friendEmail = friendEmail.replace(/\s+/g, '');

    ref.child('users').orderByChild('email').equalTo(friendEmail).once('value', function(snapshot) {

        if(snapshot.exists()){
            let theirID = Object.keys(snapshot.val())[0];

            ref.child(`friend_requests`).child(theirID).child(userID)
            .set({"request_type": "sent"})

            ref.child(`friend_requests`).child(userID).child(theirID)
            .set({"request_type": "received"})

        } else {
            alert(`No account with this email!`);
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

let removeFriend = (theirID) => {
    ref.child(`friend_data`).child(userID).child(theirID).remove();
    ref.child(`friend_data`).child(theirID).child(userID).remove();

    let element = document.getElementById(`friend` + theirID);
    element.parentNode.removeChild(element);

}

let deleteMessages = () => {

    mapRef.remove();

};
