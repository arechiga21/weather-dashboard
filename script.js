var apiKey = "6286deb3441f8b3afa86db1accef9704";
var currentWeatherEl = $("#currentWeather");
var forecastEl = $("#weatherForecast");
var citiesArray;


if (localStorage.getItem("localWeatherSearches")) {
    citiesArray = JSON.parse(localStorage.getItem("localWeatherSearches"));
    writeHistory(citiesArray);
} else {
    citiesArray = [];
};


$("#submitCity").click(function() {
    event.preventDefault();
    var cityName = $("#cityInput").val();
    currentWeather(cityName);
    forecast(cityName);
});

$("#previousSearch").click(function() {
    var cityName = event.target.value;
    currentWeather(cityName);
    forecast(cityName);
})

function currentWeather(cityName) {
    var urlApi = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&APPID=${apiKey}`;

    $.get(urlApi).then(function(response){
        var currTime = new Date(response.dt*1000);
        var weatherIcon = `https://openweathermap.org/img/wn/${response.weather[0].icon}@2x.png`;

        currentWeatherEl.html(`
        <h2>${response.name}, ${response.sys.country} (${currTime.getMonth()+1}/${currTime.getDate()}/${currTime.getFullYear()})<img src=${weatherIcon} height="70px"></h2>
        <p>Temperature: ${response.main.temp} &#176;C</p>
        <p>Humidity: ${response.main.humidity}%</p>
        <p>Wind Speed: ${response.wind.speed} m/s</p>`
        , returnUV(response.coord))
        hisoryButton(response.name);
    })
};

currentWeather("Orem");

function writeHistory(array) {
    $.each(array, function(i) {
        hisoryButton(array[i]);
    })
}

function forecast(cityName) {
    var urlApi = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&units=metric&APPID=${apiKey}`;

    $.get(urlApi).then(function(response){
    var forecastInfo = response.list;
    forecastEl.empty();
    $.each(forecastInfo, function(i) {
    if (!forecastInfo[i].dt_txt.includes("12:00:00")) {
        return;
    }
    var forecastDate = new Date(forecastInfo[i].dt*1000);
    var weatherIcon = `https://openweathermap.org/img/wn/${forecastInfo[i].weather[0].icon}.png`;

    forecastEl.append(`
    <div class="col-md">
    <div class="card text-white bg-primary">
    <div class="card-body">
    <h4>${forecastDate.getMonth()+1}/${forecastDate.getDate()}/${forecastDate.getFullYear()}</h4>
    <img src=${weatherIcon} alt="weather icon">
    <p>Temp: ${forecastInfo[i].main.temp} &#176;C</p>
    <p>Humidity: ${forecastInfo[i].main.humidity}%</p>
    </div>
    </div>
    </div>`)
    })
    })
};

forecast("Orem");

function returnUV(coordinates) {
    var urlApi = `https://api.openweathermap.org/data/2.5/uvi?lat=${coordinates.lat}&lon=${coordinates.lon}&APPID=${apiKey}`;

    $.get(urlApi).then(function(response){
    var currUVIndex = response.value;
    var uvSeverity = "green";
    var textColour = "white"

    if (currUVIndex >= 11) {
        uvSeverity = "purple";
    } else if (currUVIndex >= 8) {
        uvSeverity = "red";
    } else if (currUVIndex >= 6) {
        uvSeverity = "orange";
        textColour = "black"
    } else if (currUVIndex >= 3) {
        uvSeverity = "yellow";
        textColour = "black"
    }
    currentWeatherEl.append(`<p>UV Index: <span class="text-${textColour} uvPadding" style="background-color: ${uvSeverity};">${currUVIndex}</span></p>`);
    })
}

function hisoryButton(cityName) {

var citySearch = cityName.trim();
var buttonCheck = $(`#previousSearch > BUTTON[value='${citySearch}']`);

if (buttonCheck.length == 1) {
return;
}
    
if (!citiesArray.includes(cityName)){
citiesArray.push(cityName);
localStorage.setItem("localWeatherSearches", JSON.stringify(citiesArray));
}

$("#previousSearch").prepend(`
<button class="btn btn-light" value='${cityName}'>${cityName}</button>`);
}
