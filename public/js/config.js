// Initializes Firebase
var config = {
  apiKey: "AIzaSyDR-NpXGPfiFlm9Tr9u9_eS-0D0xt_3JDs",
  authDomain: "gps-app-c31df.firebaseapp.com",
  databaseURL: "https://gps-app-c31df.firebaseio.com",
  projectId: "gps-app-c31df",
  storageBucket: "gps-app-c31df.appspot.com",
  messagingSenderId: "675799163706"
};
firebase.initializeApp(config);

// Makes sure to get the REFERENCE of the Firebase
const database = firebase.database();
const ref = database.ref();
const mapRef = ref.child(`devices`);


const messaging = firebase.messaging();
