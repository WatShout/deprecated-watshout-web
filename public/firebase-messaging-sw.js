importScripts('https://www.gstatic.com/firebasejs/5.0.2/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/5.0.2/firebase-messaging.js');

var config = {
  apiKey: "AIzaSyDR-NpXGPfiFlm9Tr9u9_eS-0D0xt_3JDs",
  authDomain: "gps-app-c31df.firebaseapp.com",
  databaseURL: "https://gps-app-c31df.firebaseio.com",
  projectId: "gps-app-c31df",
  storageBucket: "gps-app-c31df.appspot.com",
  messagingSenderId: "675799163706"
};
firebase.initializeApp(config);

const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(function(payload) {

    const title = "Hello World";
    const options = {
        body: "Test"
    };

    return self.registration.showNotification(title, options);
});
