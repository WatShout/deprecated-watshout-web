
messaging.requestPermission()
.then(function() {
    //console.log("Got permission");
    return messaging.getToken();
})
.then(function(key) {
    //console.log(key);
})
.catch(function(err) {
    console.log("Error");
})

messaging.onMessage(function (payLoad) {
    //console.log('onMessage: ' + payLoad);
});
