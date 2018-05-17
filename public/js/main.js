
// This file contains helper functions for the main maps page
// I didn't want to have this and the maps be crowding the same file

let userID;
let email;

firebase.auth().onAuthStateChanged(function(user) {

    if (user) {

        userID = user.uid;
        email = user.email;

        ref.child(`users`).child(userID).once('value', function(snapshot) {

            // User in database
            if (snapshot.exists()) {

                ref.child(`users`).child(user.uid).update({
                    "new": false
                });

            } else {

                let name = prompt("Enter your name");
                let age = prompt("Enter your age");

                ref.child(`users`).child(user.uid).update({
                    "name": name,
                    "age": parseInt(age),
                    "new": false,
                    "email": user.email
                });
            }

        });

    initMap();

    document.getElementById(`hello`).innerHTML = `Hello, ` +
    user.email + ` (` + user.uid + `)`

    } else {
        console.log('logged out');
        window.location.replace(`/login`);
    }

    ref.child(`friends`).child(userID).on(`value`, function(snapshot) {

        let friends = `Friends: `;

        snapshot.forEach(function(child){

            var key = child.key;
            var value = child.val();

            if (!value){

                if(confirm('Do you want to be friends with ' + key + '?')){
                    confirmFriend(key);
                    friends += key;
                } else {

                }
            } else {
                friends += key;
            }

        });

        console.log(friends);
    });

});

let returnAccounts = () => {

    let friendEmail = document.getElementById(`friend`).value;

    ref.child('users').orderByChild('email').equalTo(friendEmail).once('value', function(snapshot) {

        let key = Object.keys(snapshot.val())[0];

        console.log(key);
        
    });
}

let askFriend = () => {

    let friendID = document.getElementById(`friend`).value;

    ref.child(`friends`).child(friendID).child(userID).set(false);

}

let confirmFriend = (friendID) => {
    ref.child(`friends`).child(userID).child(friendID).set(true);
    ref.child(`friends`).child(friendID).child(userID).set(true);
}

let deleteMessages = () => {

    mapRef.remove();
};
