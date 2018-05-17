let searchByEmail = () => {

    let query = document.getElementById(`query`).value;

    ref.child('users').orderByChild('email').equalTo(query).once('value', function(snapshot) {

        if(snapshot.exists()){
            let key = Object.keys(snapshot.val())[0];
            document.getElementById(`results`).innerHTML += key;
        } else {
            document.getElementById(`results`).innerHTML += `Doesn't exist`;
        }

    });
}
