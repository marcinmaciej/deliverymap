/**
 * Created by Marcin Guziołek on 2016-12-26.
 * Refactoring by Marcin Guziołek started on 2025-08-01
 */

let map;
const mapZoom = 12;
var geocoder;

const mapCenterLatLng = {
    lat: 55.937350,
    lng: -3.178122
}

const RapidoCoords = {
    lat: 55.958176,
    lng: -3.189332
}

const locations = document.getElementById("location");
const buttonGo = document.getElementById("btngo");
const buttonOCR = document.getElementById("btnocr");
const videoPane = document.getElementById("videoPane");
const snapshotImg = document.getElementById("snapshotImg");

const deliveryTime = 4500000;

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
let isVideoDisplayed = false;
let localMediaStream = null;
let mm;
let timestamp;
let description;
let orders,
    drivers;



mm = window.matchMedia("(min-width:768px");

// functions names
var initMap,
    getLocations,
    addMarker,
    snapshot,
    sendImage,
    toggleVideo,
    errorCallback,
    stopDefault,
    mobileTakePhoto;

if (!mm.matches) {
    $("video").remove();
}


// Initialize Firebase
//var config = {
//  apiKey: "AIzaSyAcNGYcVkV3c6KzgSF9aeGfFfmn9bwc_ys",
    //authDomain: "trackdeliveries.firebaseapp.com",
   // databaseURL: "https://trackdeliveries.firebaseio.com" };
//firebase.initializeApp(config);

// Get a reference to the database service, which is used to create references in your database
//var fDB = firebase.database().ref();

//orders = fDB.child("orders");

//drivers = fDB.child("signin/drivers");

/*drivers.once("value").then(function (snapshot) {
    var signin,
        driver;
    snapshot.forEach(function (childSnapshot) {
        signin = childSnapshot.val();
        driver = childSnapshot.key;

        if (signin) {
            if (!$("#drivers-container").is($("#" + driver))) {
                $("#drivers-container").append("<button id='" + driver + "' class='btn btn-success drivers'>" + driver + "</button>").effect("slide").effect("bounce");
            }
        } else {
            if ($("#drivers-container").is($("#" + driver))) {
                $("#" + driver).effect("drop").remove();
            }
        }
    });
});

drivers.on("child_changed", function (childSnapshot) {
    var signin = childSnapshot.val(),
        driver = childSnapshot.key;

    if (signin) {

        $("#drivers-container").append("<button id='" + driver + "' class='btn btn-success drivers'>" + driver + "</button>").effect("slide").effect("bounce");

    } else {

        $("#" + driver).effect("explode").remove();

    }
});*/

/*orders.once('value').then(function (snapshot) {
 var localData,
 newData;
 snapshot.forEach(function (childSnapshot) {

 if (childSnapshot !== null) {
 newData = childSnapshot.val();
 if ((localData = localStorage.getItem(newData.timestamp))) {

 localData = JSON.parse(localData);

 if ((localData.timestamp + deliveryTime) > Date.now()) {

 addMarker(newData.postcode, newData.description);

 }

 } else {

 addMarker(newData.postcode, newData.description);
 localStorage.setItem(newData.timestamp, JSON.stringify(newData));

 }
 }
 })


 });*/
/*var i = 0;
orders.on("child_added", function (childSnapshot) {
    var localData,
     newData = childSnapshot.val();

     if (!(localData = localStorage.getItem(newData.timestamp))) {
     console.log("dodaje w child_added w warunku nie ma LocalStorage")
     addMarker(newData.postcode, newData.description);
     localStorage.setItem(newData.timestamp, JSON.stringify(newData));

     }

    if (childSnapshot !== null) {
        newData = childSnapshot.val();
        if ((localData = localStorage.getItem(newData.timestamp))) {

            localData = JSON.parse(localData);

            if ((localData.timestamp + deliveryTime) > Date.now()) {
                addMarker(newData.postcode, newData.description);

            }

        } else {
            if ((newData.timestamp + deliveryTime) > Date.now()) {
                addMarker(newData.postcode, newData.description);
                localStorage.setItem(newData.timestamp, JSON.stringify(newData));
            }


        }
    }

});*/

sendImage = function (image) {
    const url = "https://vision.googleapis.com/v1/images:annotate?key=AIzaSyDen4z_3zNLBoITzl-j6Qb6A25l86qcnGk";

   // const lastIndexRE = /Prev(\.|,)*\sorders/i;

    const postcodeRE = /eh[0-9\s]{2,}[a-z]{2}/ig;

    const request = {
        "requests": [
            {
                "features": [
                    {
                        "type": "TEXT_DETECTION",
                        "maxResults": 1
                    }
                ],
                "image": {
                    "content": image
                }
            }
        ]
    };

    $.ajax({
            type: "POST",
            url: url,
            dataType: "json",
            data: JSON.stringify(request),

            headers: {"Content-Type": "application/json"},
            success: function (data, textStatus, jqXHR) {
                let i,
                    title,
                    custPostcode,
                    text = JSON.stringify(data),
                    tempOrder;

                if (data !== undefined) {
                    description = data.responses[0].textAnnotations[0].description;
                }

                //var lastIndex = text.match(lastIndexRE);
                //var custData = text.substring(text.indexOf("Customer details"), text.lastIndexOf(lastIndex[0]));
                custPostcode = text.match(postcodeRE);
                //var custDataArray = custData.split("\\n");
                console.log(custPostcode);

                if (custPostcode !== null) {


                    timestamp = Date.now();

                    tempOrder = {
                        timestamp: timestamp,
                        postcode: custPostcode[0],
                        description: description
                    };

                    orders.push(tempOrder).then(function () {

                        addMarker(tempOrder.postcode, tempOrder.description);
                        localStorage.setItem(timestamp, JSON.stringify(tempOrder));
                    });

                } else {
                    console.log("Response is null, cannot read text or no postcode.");

                }
            }
        }
    );

};

toggleVideo = function () {
    isVideoDisplayed = !isVideoDisplayed;
    $(videoPane).toggle("slide");
    if (isVideoDisplayed) {
        videoPane.play();
    } else {
        videoPane.pause();
    }
};

errorCallback = function () {

};

/*snapshot = function () {
    var image;
    if (localMediaStream) {

        canvas.width = videoPane.videoWidth;
        cmarkeranvas.height = videoPane.videoHeight;

        ctx.drawImage(videoPane, 0, 0, videoPane.videoWidth, videoPane.videoHeight);

        image = canvas.toDataURL("image/webp", 1);
        snapshotImg.src = canvas.toDataURL("image/webp", 1);
        snapshotImg.style.display = "block";

        $(snapshotImg).effect("drop", "right");

        sendImage(image.replace("data:image/webp;base64,", ""));
    }
};*/

/*videoPane.addEventListener("click", function () {
    snapshot();
    toggleVideo();
}, false);*/

// Not showing vendor prefixes or code that works cross-browser.
/*navigator.getUserMedia({video: {mandatory: {maxWidth: 480, maxHeight: 240}}}, function (stream) {
    videoPane.src = window.URL.createObjectURL(stream);
    localMediaStream = stream;
}, errorCallback);*/

getLocations = function () {
    var locationsArray = locations.value.split(",");
    var i;
    var location;
    if (locations.value !== "") {
        for (i in locationsArray) {

            location = locationsArray[i].trim().toUpperCase();
            addMarker(location);
        }
    }

    locations.value = "";
};

buttonGo.addEventListener("click", getLocations, false);

buttonOCR.addEventListener("click", function () {
    if (mm.matches) {
        toggleVideo();
    } else {
        $("#mobile-camera-button").click();
    }
}, false);

window.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        if (locations.value === "" && isVideoDisplayed) {
            snapshot();
        } else if (locations.value === "" && !isVideoDisplayed) {
            toggleVideo();
        } else {
            getLocations();
        }
    } else if (event.key === "Backspace") {
        toggleVideo();
    }
}, true);

mobileTakePhoto = function (evt) {

    stopDefault(evt);

    var dt = evt.dataTransfer || evt.currentTarget;

    var accepted = $("#mobile-camera-button").attr("accept");

    var file = dt.files[0];

    if (file !== undefined) {

        var fr = new FileReader();
        fr.onload = function (ev) {
            sendImage((ev.target.result).replace("data:image/jpeg;base64,", ""));
        }
        fr.readAsDataURL(file);
    }
}

document.getElementById("mobile-camera-button").addEventListener("change", mobileTakePhoto, false);

initMap = function () {
    geocoder = new google.maps.Geocoder();



    map = new google.maps.Map(document.getElementById("map"), {
        center: mapCenterLatLng,
        zoom: mapZoom,
        mapId: "deliverymap"
    });

    const pinRapido = new google.maps.marker.PinElement({
        glyph: "R",
        glyphColor: "white",
        background: "blue",
        scale: 1.3
    });

    const marker = new google.maps.marker.AdvancedMarkerElement({
        position: RapidoCoords,
        map: map,
        title: "Here I am. Rapido Cafe",
        content: pinRapido.element
    });
};

addMarker = function (address, title) {
    var offsetTime;
    geocoder.geocode({"address": address}, function (results, status) {
        if (status == "OK") {

            const pinOrders = new google.maps.marker.PinElement({
                glyph: address,
                glyphColor: 'black',
                scale: 1.2,
                background: 'red'
            });

            // jak bedzie potrzeba wycentrowac na adresie: map.setCenter(results[0].geometry.location);
            map.setCenter(results[0].geometry.location); // centruje na dodany adres
            let orderMarker = new google.maps.marker.AdvancedMarkerElement({
                map: map,
                position: results[0].geometry.location,
                content: pinOrders.element,
                title: title/*,
                 icon: {
                 path: google.maps.SymbolPath.CIRCLE,
                 fillColor: '#000099',
                 fillOpacity: 1,
                 scale: 5,
                 strokeColor: '#000099',
                 strokeWeight: 3
                 }*/
            });

            orderMarker.addListener('click', function () {
                this.setMap(null);
            });

        } else {
            alert('Map api error: ' + status + ' for ' + address);
        }
    });
};

stopDefault = function (evt) {
    evt.stopPropagation();
    evt.preventDefault();
};