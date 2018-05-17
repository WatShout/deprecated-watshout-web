let deleteMessages = () => {

    mapRef.remove();
};


window.onload = function() {

    firebase.auth().onAuthStateChanged(function(user) {
        //var user = firebase.auth().currentUser;
        if (user) {
            console.log('Logged in ' + user.uid);

            ref.child(`users`).child(user.uid).update({
                "test": "test"
            });

            initMap();
            document.getElementById(`hello`).innerHTML = `Hello, ` + user.email;
        } else {
            console.log('logged out');
            window.location.replace(`/login`);
        }
    });
};
