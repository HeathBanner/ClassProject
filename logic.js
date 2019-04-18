

var nasaKey = config.nasaKey;
var mapboxKey = config.mapboxKey;
var weatherID = config.weatherID;
var weatherCode = config.weatherCode;
var openWeatherID = config.openWeatherId;
var passID = config.passID;

firebase.initializeApp(firebaseConfig);

var database = firebase.database();

//Forecast Storage
var moonList = []
var weatherList = []

//Coordinates
var latitude;
var longitude;

//Scrolling Forecast
var currentPage = 0
var chatLogCount = 0

//Chat Box
var chatLog = []
var users = []

$("#submitLogin").on("click", function (e) {
    e.preventDefault();
    $("#chatbox").toggle();
});


if (localStorage.getItem('user')) {
    $("#loginInput").val(localStorage.getItem('user'));
};
database.ref('chatLog').update({
    logCount: 1,
});

function getAPOD() {
    $.getJSON('https://api.nasa.gov/planetary/apod?api_key=' + nasaKey, function (data) {
        
        $("#apod").attr("class", 'apod-image')

        $("#apod").append('<img src="' + data.url + '" id="apod-img">')
        
        var apodDesc = $('<p id="apodDesc"></p>')
        apodDesc.text(data.explanation)

        var apodBtn = $('<button id="apodDescBtn">More Info</button>')
        $("#apod").append(apodBtn)
        $("#apod-description").append(apodDesc)
    })
};

getAPOD();

$(document).ready($(document).on("click", "#apodDescBtn", function() {
   $("#apodDesc").toggle()
}))

function setISS() {
    $.getJSON('https://api.wheretheiss.at/v1/satellites/25544', function (data) {
        var issLat = data['latitude'];
        var issLon = data['longitude'];
        iss.setLatLng([issLat, issLon]);
        map.panTo([issLat, issLon], animate = true);
    });
    setTimeout(setISS, 5000);
};

var map = L.map('map', { zoomControl: false }).setView([0, 0], 2);
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + mapboxKey, {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.satellite',
    accessToken: mapboxKey
}).addTo(map);

var issIcon = L.icon({
    iconUrl: 'imgs/ISSIcon.png',
    iconSize: [38, 95], // size of the icon
    iconAnchor: [25, 40], // point of the icon which will correspond to marker's location
});
var iss = L.marker([0, 0], { icon: issIcon }).addTo(map);

setISS();




$(document).ready($(document).on("click", "#submitLogin", function () {
    login = $("#loginInput").val().trim();
    localStorage.setItem('user', login);
    database.ref('users').update({
        [login]: true,
    });
    $("#loginInput").remove();
    $("#submitLogin").remove();
    $("#chatDiv").css({
        display: 'block',
    })
}));

database.ref('users').on('child_added', function (data) {
    users.push(data.key)
});

$(document).ready($(document).on("click", "#chatSubmit", function () {
    input = $("#chatInput").val();
    database.ref('chatLog').once('value').then(function (snap) {
        var children = snap.numChildren();
        database.ref('chatLogIndex').update({
            logCount: children
        });
        database.ref('chatLog').update({
            [children]: localStorage.getItem('user') + ": " + input
        });
    });
    $("#chatInput").val('')
}));


database.ref('chatLog').on('child_added', function (data) {
    database.ref('chatLog').once('value').then(function (snap) {
        children = snap.numChildren();
        if (children <= 6) {
            for (var i = children; i > 0; i--) {
                $('#chat' + i).text(snap.child(i).val());
            };
        } else if (children > 6) {
            chatIndex = 6
            for (var i = children; i >= children - 6; i--) {
                $('#chat' + chatIndex).text(snap.child(i).val());
                chatIndex--;
            };
        };
    });
});

$(document).ready($(document).on("click", "#current-location", function () {
    event.preventDefault();

    $(".remove-iss-info").remove()
    $("#moon-target").append('<img src"assets/moon.gif" class="removeGif"')
    $("#moon-target").append('<img src"assets/moon.gif" class="removeGif"')

    navigator.geolocation.getCurrentPosition(function (data) {
        latitude = data.coords.latitude;
        longitude = data.coords.longitude;

        $.ajax({
            url: "https://weather.api.here.com/weather/1.0/report.json?app_id=" + weatherID +  "&app_code=" + weatherCode + "&product=forecast_astronomy&latitude=" + latitude + "&longitude=" + longitude + "&jsoncallback=myCallbackFunction",
            method: "GET",
            dataType: "jsonp",
            jsonpCallback: 'myCallbackFunction',
            crossDomain: true,
        }).then(function myCallbackFunction(response) {

            for (var i = 0; i < 5; i++) {

                var description;
                description = response.astronomy.astronomy[i].moonPhaseDesc;
                description = description.split(' ');
                description[1] = description[1].charAt(0).toUpperCase() + description[1].slice(1);
                description = description.join(' ');
                var astroForecastDesc = $('<h1 id=' + i + 'class="remove">' + description + '</h1>');
                var visibilityFloat;
                visibilityFloat = parseInt(response.astronomy.astronomy[i].moonPhase * 100);
                newVis = visibilityFloat.toString();
                if (newVis[0] == '-') {
                    visibilityFloat = parseInt(visibilityFloat) * -1;
                };
                var rawName = response.astronomy.astronomy[i].moonPhaseDesc;
                rawName = rawName.split(' ');
                var imgName = rawName[0].toLowerCase();
                var astroForecastIcon = $('<img src="imgs/moonPhases/' + imgName + visibilityFloat + '.png" class="remove">')
                var visibility = $('<h4 id="' + i + '" class="remove">Visibility: ' + visibilityFloat + '%</h4>');
                var sunrise = $('<h3 id="' + i + '" class="remove">Sunrise: ' + response.astronomy.astronomy[i].sunrise + '</h3>');
                var moonrise = $('<h3 id="' + i + '" class="remove">Moonrise: ' + response.astronomy.astronomy[i].moonrise + '</h3>');
                var sunset = $('<h3 id="' + i + '" class="remove">Sunset: ' + response.astronomy.astronomy[i].sunset + '</h3>');
                var moonset = $('<h3 id="' + i + '" class="remove">Moonset: ' + response.astronomy.astronomy[i].moonset + '</h3>');

                moonList[i] = {
                    astroForecastDesc: astroForecastDesc,
                    astroForecastIcon: astroForecastIcon,
                    visibility: visibility,
                    sunrise: sunrise,
                    sunset: sunset,
                    moonrise: moonrise,
                    moonset: moonset,
                };
            };
            $(".removeGif").remove()
            $("#moon-target").css({
                display: 'block',
            })

            $("#weather-target").css({
                display: 'block',
            })

            $("#next").css({
                visibility: 'visible'
            })

            $("#previous").css({
                visibility: 'visible'
            })

            $("#moon-target").append(moonList[0].astroForecastDesc);
            $("#moon-target").append(moonList[0].astroForecastIcon);
            $("#moon-target").append(moonList[0].visibility);
            $("#moon-target").append(moonList[0].sunrise);
            $("#moon-target").append(moonList[0].sunset);
            $("#moon-target").append(moonList[0].moonrise);
            $("#moon-target").append(moonList[0].moonset);
        });

        $.ajax({
            url: 'https://api.openweathermap.org/data/2.5/forecast?lat=' + latitude + '&lon=' + longitude + '&APPID=' + openWeatherID,
            method: "GET",
        }).then(function (response) {
            divCount = 0
            var weatherIndex = 0;

            for (var i = 0; i < response.list.length; i++) {
                date = response.list[i].dt_txt;
                date = date.split(' ');
                dateReverse = date[0];
                dateReverse = dateReverse.split('-');
                var dateInput = [];
                dateInput.push(dateReverse[1]);
                dateInput.push(dateReverse[2]);
                dateInput.push(dateReverse[0]);
                dateInput = dateInput.join('/');

                if (date[1] == '21:00:00') {
                    var description;
                    description = response.list[i].weather[0].description;
                    description = description.split(' ');
                    for (var j = 0; j < description.length; j++) {
                        description[j] = description[j].charAt(0).toUpperCase() + description[j].slice(1);
                    };
                    description = description.join(' ');
                    var weatherDesc = $('<h3 id="' + i + '" class="remove">' + description + '</h3>');
                    var icon = $('<img src="https://openweathermap.org/img/w/' + response.list[i].weather[0].icon + '.png" class="remove">')
                    var humidity = $('<h4 class="remove">Humidity: ' + response.list[i].main.humidity + '%</h4>');
                    windSpeed = parseInt(response.list[i].wind.speed * 2.237);
                    var wind = $('<h4 class="remove">Wind: ' + windSpeed + ' Miles Per Hour</h4>');
                    weatherList[weatherIndex] = {
                        weatherDesc: weatherDesc,
                        icon: icon,
                        humidity: humidity,
                        wind: wind,
                        date: dateInput,
                    };
                    weatherIndex++;
                };
            };
            $("#weather-target").append(weatherList[0].weatherDesc);
            $("#weather-target").append(weatherList[0].icon);
            $("#weather-target").append(weatherList[0].humidity);
            $("#weather-target").append(weatherList[0].wind);

            $(".next-holder").append('<button id="next">Next</button>');
            $(".previous-holder").append('<button id="previous">Previous</button>');
            $("#page-index").text(weatherList[0].date);
        });

            $.getJSON('https://nominatim.openstreetmap.org/reverse?format=json&lat=' + latitude + '&lon=' + longitude, function (d) {
                var passLocation = $("<h3>").text("Over the next 10 days The International Space Station will be viewable from " + d.address.city + ", " + d.address.state + " at the following times:");
                $("#pass-info").prepend(passLocation);
                $("#pass-info").append("<br>");
            });
            $.getJSON('https://www.n2yo.com/rest/v1/satellite/visualpasses/25544/' + latitude + '/' + longitude + '/0/10/60/&apiKey=' + passID, function (data) {
                if (data.info.passescount === 0) {
                    $("#pass-info").append("<p>Sorry no ISS passes for this location in the next 10 days<p>");
                }
                else {
                    data['passes'].forEach(function (pass) {
                        var timeStamp = pass['startUTC'];
                        var passTime = moment.unix(timeStamp).format('dddd, MMMM Do YYYY, h:mm ha z');
                        $("#pass-info").append("<li class='remove-iss-info list-info'>" + passTime + " for a duration of " + pass['duration'] + " seconds, starting in the " + pass['startAzCompass'] + " and moving toward " + pass['endAzCompass'] + "</li>");
                    });
                };
            });
        
    });
}));

$(document).ready($(document).on("click", "#search-location", function () {
    event.preventDefault();

    $(".remove-iss-info").remove()
    $("#moon-target").append('<img src"assets/moon.gif" class="removeGif"')
    $("#moon-target").append('<img src"assets/moon.gif" class="removeGif"')

    var city = $("#city").val().trim();
    city.toString();
    var newNewStr = city;
    newNewStr = newNewStr.replace(/\s/g, "+");
    var state = $("#state-select").val();
    $.getJSON('https://nominatim.openstreetmap.org/search?q=' + newNewStr + ',+' + state + '&format=json', function (data) {
        latitude = data["0"].lat;
        longitude = data["0"].lon;
        $.ajax({
            url: "https://weather.api.here.com/weather/1.0/report.json?app_id=" + weatherID +  "&app_code=" + weatherCode + "&product=forecast_astronomy&latitude=" + latitude + "&longitude=" + longitude + "&jsoncallback=myCallbackFunction",
            method: "GET",
            dataType: "jsonp",
            jsonpCallback: 'myCallbackFunction',
            crossDomain: true,
        }).then(function myCallbackFunction(response) {
            for (var i = 0; i < 5; i++) {
                var description;
                description = response.astronomy.astronomy[i].moonPhaseDesc;
                description = description.split(' ');
                description[1] = description[1].charAt(0).toUpperCase() + description[1].slice(1);
                description = description.join(' ');
                var astroForecastDesc = $('<h1 id="' + i + '" class="remove">' + description + '</h1>');
                var visibilityFloat = 0;
                visibilityFloat = parseInt(response.astronomy.astronomy[i].moonPhase * 100);
                if (visibilityFloat[0] == '-') {
                    visibilityFloat = parseInt(visibilityFloat) * -1;
                };
                var visibility = $('<h4 id="' + i + '" class="remove">Visibility: ' + visibilityFloat + '%</h4>');
                var sunrise = $('<h3 id="' + i + '" class="remove">Sunrise: ' + response.astronomy.astronomy[i].sunrise + '</h3>');
                var moonrise = $('<h3 id="' + i + '" class="remove">Moonrise: ' + response.astronomy.astronomy[i].moonrise + '</h3>');
                var sunset = $('<h3 id="' + i + '" class="remove">Sunset: ' + response.astronomy.astronomy[i].sunset + '</h3>');
                var moonset = $('<h3 id="' + i + '" class="remove">Moonset: ' + response.astronomy.astronomy[i].moonset + '</h3>');

                moonList[i] = {
                    astroForecastDesc: astroForecastDesc,
                    visibility: visibility,
                    sunrise: sunrise,
                    sunset: sunset,
                    moonrise: moonrise,
                    moonset: moonset,
                };
            };
            $(".removeGif").remove()
            $("#moon-target").css({
                display: 'block',
            })

            $("#weather-target").css({
                display: 'block',
            })
            
            $("#next").css({
                visibility: 'visible'
            })

            $("#previous").css({
                visibility: 'visible'
            })

            $("#moon-target").append(moonList[0].astroForecastDesc);
            $("#moon-target").append(moonList[0].visibility);
            $("#moon-target").append(moonList[0].sunrise);
            $("#moon-target").append(moonList[0].sunset);
            $("#moon-target").append(moonList[0].moonrise);
            $("#moon-target").append(moonList[0].moonset);
        });

        $.ajax({
            url: 'https://api.openweathermap.org/data/2.5/forecast?lat=' + latitude + '&lon=' + longitude + '&APPID=' + openWeatherID,
            method: "GET",
        }).then(function (response) {
            divCount = 0;
            var weatherIndex = 0;
            for (var i = 0; i < response.list.length; i++) {
                date = response.list[i].dt_txt;
                date = date.split(' ');
                dateReverse = date[0];
                dateReverse = dateReverse.split('-');
                var dateInput = [];
                dateInput.push(dateReverse[1]);
                dateInput.push(dateReverse[2]);
                dateInput.push(dateReverse[0]);
                dateInput = dateInput.join('/');
                if (date[1] == '21:00:00') {
                    var description;
                    description = response.list[i].weather[0].description;
                    description = description.split(' ');
                    for (var j = 0; j < description.length; j++) {
                        description[j] = description[j].charAt(0).toUpperCase() + description[j].slice(1);
                    };
                    description = description.join(' ');
                    var weatherDesc = $('<h3 id=' + i + 'class="remove">' + description + '</h3>');
                    var icon = $('<img src="https://openweathermap.org/img/w/' + response.list[i].weather[0].icon + '.png" class="remove">');
                    var humidity = $('<h4 class="remove">Humidity: ' + response.list[i].main.humidity + '%</h4>');
                    windSpeed = parseInt(response.list[i].wind.speed * 2.237);
                    var wind = $('<h4 class="remove">Wind: ' + windSpeed + ' Miles Per Hour</h4>');

                    weatherList[weatherIndex] = {
                        weatherDesc: weatherDesc,
                        icon: icon,
                        humidity: humidity,
                        wind: wind,
                        date: dateInput,
                    };
                    weatherIndex++;
                    $("#weather-target").append(weatherList[0].weatherDesc);
                    $("#weather-target").append(weatherList[0].icon);
                    $("#weather-target").append(weatherList[0].humidity);
                    $("#weather-target").append(weatherList[0].wind);
                    $(".next-holder").append('<button id="next">Next</button>');
                    $(".previous-holder").append('<button id="previous">Previous</button>');
                    $("#page-index").text(weatherList[0].date);
                };
            };

            $.getJSON('https://nominatim.openstreetmap.org/reverse?format=json&lat=' + latitude + '&lon=' + longitude, function (d) {
                var passLocation = $("<h3>").text("Over the next 10 days The International Space Station will be viewable from " + d.address.city + ", " + d.address.state + " at the following times:");
                $("#pass-info").prepend(passLocation);
                $("#pass-info").append("<br>")
            });
            
            $.getJSON('https://www.n2yo.com/rest/v1/satellite/visualpasses/25544/' + latitude + '/' + longitude + '/0/10/60/&apiKey=' + passID, function (data) {
                if (data.info.passescount === 0) {
                    $("#pass-info").append("<p>Sorry no ISS passes for this location in the next 10 days<p>");
                }
                else {
                    data['passes'].forEach(function (pass) {
                        var timeStamp = pass['startUTC'];
                        var passTime = moment.unix(timeStamp).format('dddd, MMMM Do YYYY, h:mm A');
                        $("#pass-info").append("<li>" + passTime + " for a duration of " + pass['duration'] + " seconds, starting in the " + pass['startAzCompass'] + " and moving toward " + pass['endAzCompass'] + "</li>")
                    });
                };
            });
        });
    });
}));

$(document).on("click", "#next", function () {
    $(".remove").remove();
    currentPage++;
    if (currentPage <= 4) {
        $("#moon-target").append(moonList[currentPage].astroForecastDesc);
        $("#moon-target").append(moonList[currentPage].astroForecastIcon);
        $("#moon-target").append(moonList[currentPage].visibility);
        $("#moon-target").append(moonList[currentPage].sunrise);
        $("#moon-target").append(moonList[currentPage].sunset);
        $("#moon-target").append(moonList[currentPage].moonrise);
        $("#moon-target").append(moonList[currentPage].moonset);
        $("#weather-target").append(weatherList[currentPage].weatherDesc);
        $("#weather-target").append(weatherList[currentPage].icon);
        $("#weather-target").append(weatherList[currentPage].humidity);
        $("#weather-target").append(weatherList[currentPage].wind);
        $("#page-index").text(weatherList[currentPage].date);
    };
    if (currentPage == 4) {
        $("#next").css({
            visibility: 'hidden',
        });
    } else if (currentPage > 0) {
        $("#previous").css({
            visibility: 'visible',
        });
    };
});

$(document).on("click", "#previous", function () {
    $(".remove").remove();
    currentPage--;

    if (currentPage >= 0) {

        $("#moon-target").append(moonList[currentPage].astroForecastDesc);
        $("#moon-target").append(moonList[currentPage].astroForecastIcon);
        $("#moon-target").append(moonList[currentPage].visibility);
        $("#moon-target").append(moonList[currentPage].sunrise);
        $("#moon-target").append(moonList[currentPage].sunset);
        $("#moon-target").append(moonList[currentPage].moonrise);
        $("#moon-target").append(moonList[currentPage].moonset);
        $("#weather-target").append(weatherList[currentPage].weatherDesc);
        $("#weather-target").append(weatherList[currentPage].icon);
        $("#weather-target").append(weatherList[currentPage].humidity);
        $("#weather-target").append(weatherList[currentPage].wind);
        $("#page-index").text(weatherList[currentPage].date);
    };
    if (currentPage == 0) {
        $("#previous").css({
            visibility: 'hidden',
        });
        currentPage = 0
    } else if (currentPage < 4) {
        $("#next").css({
            visibility: 'visible',
        });
    };
});

console.log("                 *")
console.log("            *          .")
console.log("                   *       '")
console.log("              *                *")
console.log("")
console.log("")
console.log("")
console.log("")
console.log(" *   '*")
console.log("           *")
console.log("                *")
console.log("                       *")
console.log("               *")
console.log("                     *")
console.log("")
console.log("        .                      .")
console.log("         .                      ;")
console.log("         :                  - --+- -")
console.log("         !           .          !")
console.log("         |        .             .")
console.log("         |_         +")
console.log("      ,  | `.")
console.log("--- --+-<#>-+- ---  --  -")
console.log("      `._|_,'")
console.log("         T")
console.log("         |")
console.log("         !")
console.log("         :         . :")
console.log("         .       *")
