/*
 * ISS
 * Project JS
 */
(function(){

    "use strict";

    // variables we need to use throughout the app get declared here
    var map,
        lat, lon,
        issMarker,
        countdown;

    // initialise the web app
    function init() {
        createMap();

        // detect whether the user's browser supports geolocation detection
        if('geolocation' in navigator){
            navigator.geolocation.getCurrentPosition(detectLatlon);
        }

        detectISSLocation();
    }


    // see:
    // https://developers.google.com/maps/documentation/javascript/tutorial
    function createMap() {
        var mapOptions = {
            center: new google.maps.LatLng(50.8000, -0.3667),
            zoom: 3,
            mapTypeId: google.maps.MapTypeId.SATELLITE
        };
        map = new google.maps.Map(document.querySelector(".map"), mapOptions);
    }


    function detectLatlon(position) {

        // see what info is returned
        console.log(position);

        lat = position.coords.latitude;
        lon = position.coords.longitude;

        document.querySelector(".my-lat").textContent = lat;
        document.querySelector(".my-lon").textContent = lon;

        // add marker to map
        var latlon = new google.maps.LatLng(lat, lon);
        new google.maps.Marker({
            position: latlon,
            map: map,
            icon: "me.png"
        });


        // get the next ISS pass
        detectNextISSPass();
    }


    function detectISSLocation() {
        // $.getJSON("http://api.open-notify.org/iss-now.json?callback=?", function(data) {
        $.getJSON("https://fr.sslsecureproxy.com/secure/c0zNiSMWVI0cv4F6XoGby4vEPqIUPnytSUiWAXSTBImMS7v~bJJi8gV91JlavJeIxFJshtKqhDTMd7PsgOJwYw--", function(data) {

            // check what data has been returned
            console.log(data);

            // update ISS coords on map
            document.querySelector(".iss-lat").textContent = data.iss_position.latitude;
            document.querySelector(".iss-lon").textContent = data.iss_position.longitude;

            var image = 'iss.png';
            var issLatLng = new google.maps.LatLng(data.iss_position.latitude, data.iss_position.longitude);

            // add ISS marker to map if not already there
            if (!issMarker) {
                issMarker = new google.maps.Marker({
                    position: issLatLng,
                    map: map,
                    icon: image
                });

            // ISS already added, just move it
            } else {
                issMarker.setPosition(issLatLng);
            }

            map.panTo(issLatLng);

            // repeat this function to update ISS position every x seconds
            setTimeout(detectISSLocation, 5000);
        });
    }


    function detectNextISSPass() {
        // var url = "http://api.open-notify.org/iss-pass.json?lat="+lat+"&lon="+lon+"&callback=?";
        var url = "https://fr.sslsecureproxy.com/secure/c0zNiSMWVI0cv4F6XoGbyznzsIwQZ7mNS6Fjf842t0oCUQ3Wbf3AY8Ei80w78NcSuan~nhPpwUwd6t9pbwZlc9DXJMaU1umzgzbZBZJ9bEI-";
        $.getJSON(url, function(data) {

            // check what data has been returned
            console.log(data);

            countdown = data.response[0].risetime - data.request.datetime;
            document.querySelector(".flyby-seconds").textContent = countdown;

            var risetime = data.response[0].risetime;
            var formattedRisetime = timeConverter(risetime);
            document.querySelector(".flyby-date").textContent = formattedRisetime;

            setTimeout(countdownFlyby, 1000);
        });
    }


    // count down flyby every second
    function countdownFlyby() {
        countdown -= 1;
        document.querySelector(".flyby-seconds").textContent = countdown;

        if (countdown > 0) {
            setTimeout(countdownFlyby, 1000);
        } else {
            detectNextISSPass();
        }
    }


    // find a random function online to convert unix timestamp to human date
    // http://stackoverflow.com/a/6078873
    function timeConverter(UNIX_timestamp){
        var a = new Date(UNIX_timestamp * 1000);
        var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        var year = a.getFullYear();
        var month = months[a.getMonth()];
        var date = a.getDate();
        var hour = a.getHours();
        var min = a.getMinutes();
        var sec = a.getSeconds();
        var time = date+' '+month+' '+year+' '+hour+':'+min+':'+sec ;
        return time;
     }

     // start when the page has loaded
     init();

})();
