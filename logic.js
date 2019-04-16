

// APP ID
// DxBU79ocPu6mVtMHuij8

// APP CODE
// IJhvDA9iMZjliA8otkgGag



$(document).ready($(document).on("click", "#forecastSubmit", function(){
    event.preventDefault()

    console.log("click")

    loc = $("#forecastInput").val()


// Moon Phase Call
    $.ajax({
        url: "https://weather.api.here.com/weather/1.0/report.json?app_id=DxBU79ocPu6mVtMHuij8&app_code=IJhvDA9iMZjliA8otkgGag&product=forecast_astronomy&name=Charlotte&jsoncallback=myCallbackFunction",
        method: "GET",
        dataType: "jsonp",
        // jsonp: "jsonp",
        jsonpCallback: 'myCallbackFunction',
        crossDomain: true,
    }).then(function myCallbackFunction(response) {
        
        console.log("before for")
        for(var i = 0; i < 4; i++) {
            var astroForecastDesc = $('<h1 id="' + i + '" class="remove">' + response.astronomy.astronomy[i].moonPhaseDesc + '</h1>')
            $("#forecastTarget" + i).append(astroForecastDesc);

            // var astroForecastIcon = $('<img src="https://weather.api.here.com/static/weather/icon/' + response.astronomy.astronomy[i].iconName + '.png" class="remove">')
            // $("#forecastTarget").append(astroForecastIcon)
            
            var visibility = $('<h4 id="' + i + '" class="remove">' + response.astronomy.astronomy[i].moonPhase + '</h4>')
            $("#forecastTarget" + i).append(visibility)

            var sunrise = $('<h3 id="' + i + '" class="remove">' + response.astronomy.astronomy[i].sunrise + '</h3>')
            $("#forecastTarget" + i).append(sunrise);

            var moonrise = $('<h3 id="' + i + '" class="remove">' + response.astronomy.astronomy[i].moonrise + '</h3>')
            $("#forecastTarget" + i).append(moonrise)

            var sunset = $('<h3 id="' + i + '" class="remove">' + response.astronomy.astronomy[i].sunset + '</h3>')
            $("#forecastTarget" + i).append(sunset)

            var moonset = $('<h3 id="' + i + '" class="remove">' + response.astronomy.astronomy[i].moonset + '</h3>')
            $("#forecastTarget" + i).append(moonset)

            
            console.log("fire!")
        }
    })

// Weather Call

    // $.ajax({
    //     url: 'https://api.openweathermap.org/data/2.5/weather?q=' + loc + '&APPID=4216d1350fe31af9bf5100bb34fa72e2',
    //     method: "GET",
    // }).then(function(response){
        
    //     //Add icon

    //     var weatherDesc = $('<h3 id="' + i + '" class="remove">' + response.list)
    // })
    function setISS() {
        $.getJSON('https://api.wheretheiss.at/v1/satellites/25544', function (data) {
            var issLat = data['latitude'];
            var issLon = data['longitude'];
            iss.setLatLng([issLat, issLon]);
            map.panTo([issLat, issLon], animate=true);
            console.log(issLat)
            console.log(issLon)
        });
        setTimeout(setISS, 5000)
    }
            var map = L.map('map', { zoomControl:false }).setView([0, 0], 2);
            L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibGFyYS1lIiwiYSI6ImNqdWlscnl2YjE4a2Y0NHBpb21mZ2lsdmQifQ.bHWgEb4G4BLPbjEMAcEwTA', {
                attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
                maxZoom: 18,
                id: 'mapbox.satellite',
                accessToken: 'pk.eyJ1IjoibGFyYS1lIiwiYSI6ImNqdWlscnl2YjE4a2Y0NHBpb21mZ2lsdmQifQ.bHWgEb4G4BLPbjEMAcEwTA'
            }).addTo(map);

            var issIcon = L.icon({
                iconUrl: 'imgs/ISSIcon.png',

                iconSize: [38, 95], // size of the icon

                iconAnchor: [25, 40], // point of the icon which will correspond to marker's location
            });
            var iss = L.marker([0, 0], { icon: issIcon }).addTo(map);


            setISS();

    
}))