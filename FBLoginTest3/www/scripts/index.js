// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=397704
// To debug code on page load in Ripple or on Android devices/emulators: launch your app, set breakpoints, 
// and then run "window.location.reload()" in the JavaScript Console.
(function () {
    "use strict";

    document.addEventListener('deviceready', onDeviceReady.bind(this), false);

    function onDeviceReady() {
        // Handle the Cordova pause and resume events
        document.addEventListener('pause', onPause.bind(this), false);
        document.addEventListener('resume', onResume.bind(this), false);

        // TODO: Cordova has been loaded. Perform any initialization that requires Cordova here.
        var parentElement = document.getElementById('deviceready');
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');
        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');
    }

    function onPause() {
        // TODO: This application has been suspended. Save application state here.
    }

    function onResume() {
        // TODO: This application has been reactivated. Restore application state here.
    }
})();

//************************************ Logic function ***************************************



// onSuccess Callback
//   This method accepts a `Position` object, which contains
//   the current GPS coordinates
//
function onSuccess(position) {
    //var element = document.getElementById('geolocation');
    //navigator.notification.alert('Latitude: ' + position.coords.latitude + ' Longitude: ' + position.coords.longitude);

    var Latitude = position.coords.latitude;
    var Longitude = position.coords.longitude;

    getMap(Latitude, Longitude);
}

// onError Callback receives a PositionError object
//
function onError(error) {
    navigator.notification.alert('code: ' + error.code + '\nmessage: ' + error.message + '\n');
}


function getMap(latitude, longitude) {

    /*
    var mapOptions = {
        center: new google.maps.LatLng(0, 0),
        zoom: 1,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    
    map = new google.maps.Map(document.getElementById("map"), mapOptions);
    */

    //var latLong = new google.maps.LatLng(latitude, longitude);
    var image = 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png';
    var marker = new google.maps.Marker({
        position: { lat: latitude, lng: longitude },
        map: map,
        icon: image
    });

    myTrace("getMap(" + latitude + ", " + longitude + ")");

    //marker.setMap(map);
    //map.setZoom(15);
    map.setCenter(marker.getPosition());

    showObjects();
}

// Options: throw an error if no update is received every 30 seconds.
//

function locateMe() {
    
    $('.licatorButton').hide();
    var watchID = navigator.geolocation.getCurrentPosition(onSuccess, onError/*, { timeout: 10000 }*/);
}


function myTrace(msg) {
    document.getElementById("info").innerHTML += msg + "<br>";
}







var kmlLayer;
var marker;
var markers = [];
var m_currentOpenedPopupWindow;
//FIXME: change to currnet Facebook login status
var m_bUserConnected = true;
var m_userID;
var m_lastSelectedPlace;
var map;
var m_showObjectsTmo = 0;

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 31.960136515157117, lng: 34.88011499999993 },
        zoom: 17,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });

    var input = document.getElementById('pac-input');
    var searchBox = new google.maps.places.SearchBox(input);
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(input);

    // Bias the SearchBox results towards current map's viewport.
    map.addListener('bounds_changed', function () {
        searchBox.setBounds(map.getBounds());
    });

    map.addListener('idle', function () {
        console.log("map loaded");

        clearTimeout(m_showObjectsTmo);
        m_showObjectsTmo = setTimeout(showObjects, 700);
        
        //showObjects();
    });

    map.addListener('click', function (event) {
        var latitude = event.latLng.lat();
        var longitude = event.latLng.lng();
        console.log("click on " + latitude + ', ' + longitude);
        placeMarker(event.latLng);
    });

    map.addListener('center_changed', function () {
        $('.licatorButton').show();
    });

    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    searchBox.addListener('places_changed', function () {
        var places = searchBox.getPlaces();

        if (places.length == 0) {
            return;
        }

        // Clear out the old markers.
        clearMarkerNewPlace()
        markers = [];

        // For each place, get the icon, name and location.
        var bounds = new google.maps.LatLngBounds();
        places.forEach(function (place) {
            var icon = {
                url: place.icon,
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(25, 25)
            };

            // Create a marker for each place.
            markers.push(new google.maps.Marker({
                map: map,
                icon: icon,
                title: place.name,
                position: place.geometry.location
            }));

            if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
        });

        map.fitBounds(bounds);
        //map.setZoom(Math.min(map.getZoom(),17));
        //map.setZoom(15);
    });
}

function showObjects() {

    var mapCenter = map.getCenter();

    if (kmlLayer != undefined) {
        kmlLayer.setMap(null);
    }

    kmlLayer = new google.maps.KmlLayer({
        url: 'https://test002-dimkak9.c9users.io/places' +
            '?lat=' + mapCenter.lat() +
            '&lng=' + mapCenter.lng() +
            '&zoom=' + map.getZoom() +
            '&mapWidth=' + window.innerWidth * 0.6 +
            '&mapHeight=' + window.innerHeight +
            '&showall=1' +
            '&f=' + new Date().getTime(),
        //url: 'http://test002-dimkak9.c9users.io/dimka',
        //url: 'http://developers.google.com/maps/tutorials/kml/westcampus.kml',
        suppressInfoWindows: true,
        preserveViewport: true
    });

    kmlLayer.setMap(map);

    kmlLayer.addListener('click', function (kmlEvent) {
        var content = kmlEvent.featureData.infoWindowHtml;
        var value = content.substr(content.indexOf("id=") + 3, 24);
        m_lastSelectedPlace = value;

        loadme(value);
    });
}


function loadme(content) {

    //navigator.notification.alert("loadme(" + content + ")");

    //$("#error").hide();
    //$("#success").removeClass('successBackground');
    try {

        $("#info").load("https://test002-dimkak9.c9users.io/placeinfonew?id=" + content + "&bUserConnected=" + (m_bUserConnected ? "1" : "0") + "&debug=1", function (response, status, xhr) {

            initImageSliderPager();

            //infoCover

            // init stars buttons
            $(':radio').change(
              function () {
                  $('.choice').text(this.value + ' stars');
              }
            )

            $(window).resize(function () {
                resizeDiv();

                //changeCloseButtonPosition();
            });

            if (status == "error") {
                var msg = "Sorry but there was an error: ";
                //$("#error").html(msg + xhr.status + " " + xhr.statusText);
                //$("#error").show("slow");
                navigator.notification.alert(msg + xhr.status + " " + xhr.statusText);
            }
        });
    } catch (e) {
        navigator.notification.alert("error=" + e.message);
    }
}

function placeMarker(location) {

    //if (!m_bUserConnected) {
    //    return;
    //}

    clearMarkerNewPlace();

    marker = new google.maps.Marker({
        position: location,
        icon: 'https://s3.amazonaws.com/dimkak9-playground/Icons/AddPlace.png',
        map: map,
        url: 'http://www.google.com/',
        animation: google.maps.Animation.DROP,
        draggable: true
    });

    google.maps.event.addListener(marker, 'click', showPopuWindow);
}

function clearMarkerNewPlace() {
    if (typeof (marker) != 'undefined') {
        marker.setMap(null);
    }
}

function showPopuWindow() {
    //$('#addNewPlace').attr('src', 'addPlace?lat=' + marker.position.lat() + '&lng=' + marker.position.lng());
    //$('#dim').show();
    //m_currentOpenedPopupWindow = $('#addNewPlace');
    //m_currentOpenedPopupWindow.show();
    //changeCloseButtonPosition();
    //$('.button').show();

    try {
        $(".popupContent").load("addPlace.html?lat=" + marker.position.lat() + "&lng=" + marker.position.lng(), function (response, status, xhr) {

            document.querySelector('[name="latitude"]').value = marker.position.lat();
            document.querySelector('[name="longitude"]').value = marker.position.lng();

            onAddPlaceFormLoaded();

            $('.popupWindow').show();
        });
    } catch (e) {
        navigator.notification.alert("error=" + e.message);
    }
}
//*******************************************************************************************


function openPopupWindow(dlgName) {
    $(".popupContent").html('<h1>' + dlgName + '</h1>');
    $('.popupWindow').show();
}



function closeMe(instance) {
    $('.' + instance).hide();
}


//placeinfonew
function openSlideShow(imageUrl) {
    //var imageUrl = "https://unsplash.it/800/600?image=" + ix
    $('.slideShow').css("background-image", 'url(' + imageUrl + ')');
    $('.slideShow').show();
}


function closeSlideShow() {
    $('.slideShow').hide();
}


function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}


function MyAlert(msg) {
    navigator.notification.alert(msg);
}


function showWaitMessage() {
    $('.messageDlg').show();
}


function hideWaitMessage() {
    $('.messageDlg').hide();
}