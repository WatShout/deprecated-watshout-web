let handleSignUp = () => {

    var email = document.getElementById('email').value;
    var password = document.getElementById('pass').value;
    var repeat = document.getElementById('repeatpass').value;

    if (email.length < 4) {
        alert('Please enter an email address.');
        return;
    }
    if (password.length < 4) {
        alert('Please enter a password.');
        return;
    }

    if (!(password.trim() === repeat.trim())){
        alert(`Passwords don't match!`);
        return;
    }

    // Sign in with email and pass.
    // [START createwithemail]
    firebase.auth().createUserWithEmailAndPassword(email, password).then(function(user){

        window.location.replace(`../`);

        //Here if you want you can sign in the user
        }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // [START_EXCLUDE]
        if (errorCode == 'auth/weak-password') {
            alert('The password is too weak.');
        } else {
            alert(errorMessage);
        }
        console.log(error);
        // [END_EXCLUDE]
    });

    // [END createwithemail]
}

document.getElementById(`register`).onclick = function () {

    handleSignUp();

}
