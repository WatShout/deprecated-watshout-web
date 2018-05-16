// Initialize Firebase
const config = {
    apiKey: "AIzaSyDR-NpXGPfiFlm9Tr9u9_eS-0D0xt_3JDs",
    authDomain: "gps-app-c31df.firebaseapp.com",
    databaseURL: "https://gps-app-c31df.firebaseio.com",
    projectId: "gps-app-c31df",
    storageBucket: "",
    messagingSenderId: "675799163706"
};
firebase.initializeApp(config);

const database = firebase.database();

let deleteMessages = () => {

    let ref = database.ref();

    ref.remove();
};
