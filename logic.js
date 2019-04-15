
var config = {
    apiKey: "AIzaSyAJS4YQWU5DmESeYueG1qH1NGkjv3DncEY",
    authDomain: "https://classwork-f3f0e.firebaseio.com/",
    databaseURL: "https://classwork-f3f0e.firebaseio.com/",
    storageBucket: "https://classwork-f3f0e.firebaseio.com/"
};
  
firebase.initializeApp(config);

var database = firebase.database();

//==================================================================//

var latitude;
var longitude;

function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition);
    } else { 
        console.log("Geo not supported")
    }

}
  
function showPosition(position) {
    latitude = position.coords.latitude
    longitude = position.coords.longitude;
    console.log("DING!!!!!!")
}


//==================================================================//
var chatLogCount = 0
var chatLog = []
var users = []


if (localStorage.getItem('user')) {
    $("#loginInput").val(localStorage.getItem('user'))
}


database.ref('chatLog').update({
    logCount: 1,
})


$(document).ready($(document).on("click", "#submitLogin", function() {
    login = $("#loginInput").val().trim()

    localStorage.setItem('user', login)

    database.ref('users').update({
        [login]: true,
    })

    $("#loginInput").remove()
    $("#submitLogin").remove()
}))

database.ref('users').on('child_added', function(data){

        users.push(data.key)
        console.log("USER IS" + data.key)
})

$(document).ready($(document).on("click", "#chatSubmit", function(){
    input = $("#chatInput").val()
    console.log(input)

    database.ref('chatLog').once('value').then(function(snap) {
        var children = snap.numChildren()
        database.ref('chatLogIndex').update({
            logCount: children
        })

        database.ref('chatLog').update({
            [children]: localStorage.getItem('user') + ": " + input
        })
    })
}));


database.ref('chatLog').on('child_added', function(data) {


    database.ref('chatLog').once('value').then(function(snap){
        children = snap.numChildren()
        console.log(children)

        if(children <= 6) {
            for (var i = children; i > 0; i--) {
                $('#chat' + i).text(snap.child(i).val())
                console.log(snap.child(i).val())
            }
        }else if (children > 6) {
            chatIndex = 6

            for (var i = children; i >= children - 6; i--) {
                $('#chat' + chatIndex).text(snap.child(i).val())
                console.log(snap.child(i).val())
                chatIndex--
            }
        }
    })
})


// APP ID
// DxBU79ocPu6mVtMHuij8

// APP CODE
// IJhvDA9iMZjliA8otkgGag


$(document).ready($(document).on("click", "#forecastSubmit", function(){
    event.preventDefault()
    
    navigator.geolocation.getCurrentPosition(function(data) {
        latitude = data.coords.latitude
        longitude = data.coords.longitude;
    
        console.log("click")

        // Moon Phase Call
        $.ajax({
            url: "https://weather.api.here.com/weather/1.0/report.json?app_id=DxBU79ocPu6mVtMHuij8&app_code=IJhvDA9iMZjliA8otkgGag&product=forecast_astronomy&latitude=" + latitude + "&longitude=" + longitude + "&jsoncallback=myCallbackFunction",
            method: "GET",
            dataType: "jsonp",
            // jsonp: "jsonp",
            jsonpCallback: 'myCallbackFunction',
            crossDomain: true,
        }).then(function myCallbackFunction(response) {
            
            console.log("before for")
            for(var i = 0; i < 5; i++) {

                var description;
                description = response.astronomy.astronomy[i].moonPhaseDesc
                description = description.split(' ')
                console.log(description)

                description[1] = description[1].charAt(0).toUpperCase() + description[1].slice(1)
                console.log(description)

                description = description.join(' ')
                console.log(description)


                var astroForecastDesc = $('<h1 id="' + i + '" class="remove">' + description + '</h1>')
                $("#moonTarget" + i).append(astroForecastDesc);

                // var astroForecastIcon = $('<img src="https://weather.api.here.com/static/weather/icon/' + response.astronomy.astronomy[i].iconName + '.png" class="remove">')
                // $("#moonTarget").append(astroForecastIcon)

                visibilityFloat = parseInt(response.astronomy.astronomy[i].moonPhase * 100)
                
                var visibility = $('<h4 id="' + i + '" class="remove">Visibility: ' + visibilityFloat + '%</h4>')
                $("#moonTarget" + i).append(visibility)

                var sunrise = $('<h3 id="' + i + '" class="remove">Sunrise: ' + response.astronomy.astronomy[i].sunrise + '</h3>')
                $("#moonTarget" + i).append(sunrise);

                var moonrise = $('<h3 id="' + i + '" class="remove">Moonrise: ' + response.astronomy.astronomy[i].moonrise + '</h3>')
                $("#moonTarget" + i).append(moonrise)

                var sunset = $('<h3 id="' + i + '" class="remove">Sunset: ' + response.astronomy.astronomy[i].sunset + '</h3>')
                $("#moonTarget" + i).append(sunset)

                var moonset = $('<h3 id="' + i + '" class="remove">Moonset: ' + response.astronomy.astronomy[i].moonset + '</h3>')
                $("#moonTarget" + i).append(moonset)

                // THE VARIABLES ARE SAVING THE TIME AS AN INTEGER AND THE AM/PM AS STRING.

                
                console.log("fire!")
            }
        })

        // Weather Call

        $.ajax({
            url: 'https://api.openweathermap.org/data/2.5/forecast?lat=' + latitude + '&lon=' + longitude + '&APPID=4216d1350fe31af9bf5100bb34fa72e2',
            method: "GET",
        }).then(function(response){
            divCount = 0

            //Add icon

            for (var i = 0; i < response.list.length; i++) {
                console.log("hit! FOR LOOP")
                date = response.list[i].dt_txt
                console.log(date)
                date = date.split(' ')


                if(date[1] == '21:00:00') {
                    
                    console.log("hit IF")
                    var description;
                    description = response.list[i].weather[0].description
                    description = description.split(' ')
                    console.log(description)
                    for (var j = 0; j < description.length; j++) {
                        description[j] = description[j].charAt(0).toUpperCase() + description[j].slice(1)
                        console.log(description)
                    }
                    description = description.join(' ')
                    console.log(description)


                    var weatherDesc = $('<h3 id="' + i + '" class="remove">' + description  + '</h3>')
                    $("#weatherTarget" + divCount).append(weatherDesc)

                    var icon = $('<img src="https://openweathermap.org/img/w/' + response.list[i].weather[0].icon + '.png" class="remove">')
                    $("#weatherTarget" + divCount).append(icon)

                    var humidity = $('<h4 class="remove">Humidity: ' + response.list[i].main.humidity + '%</h4>')
                    $("#weatherTarget" + divCount).append(humidity)

                    windSpeed = parseInt(response.list[i].wind.speed * 2.237)

                    var wind = $('<h4 class="remove">' + windSpeed + ' Miles Per Hour</h4>')
                    $("#weatherTarget" + divCount).append(wind)

                    console.log("hit END IF")
                    divCount++
                    console.log(divCount)
                }else {
                    console.log("miss!")
                }

            }
        })
            })
}))