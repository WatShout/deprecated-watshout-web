// Initializes Firebase
var config = {
  apiKey: "AIzaSyCEFFfLVU_lFaUt8bYL0E0zYtkeYsepU4A",
  authDomain: "watshout-app.firebaseapp.com",
  databaseURL: "https://watshout-app.firebaseio.com",
  projectId: "watshout-app",
  storageBucket: "",
  messagingSenderId: "572143736497"
};
firebase.initializeApp(config);

// Makes sure to get the REFERENCE of the Firebase
const database = firebase.database();
const ref = database.ref();
const mapRef = ref.child(`devices`);

const messaging = firebase.messaging();
