let cities = [];
let city = "Maui";

let APIKey = "9e9df29a2fc33e539c49bbd45e079447";
let queryURL =
  "https://api.openweathermap.org/data/2.5/weather?q=" +
  city +
  "&appid=" +
  APIKey;

pageLoad();
$("#search-btn").on("click", function (e) {
  e.preventDefault();
  city = $("#city-input").val();
  cities.push(city);
  getWeather(city);
  renderCities();
  $(".form-inline").trigger("reset");
});
$("#city-list").on("click", function (e) {
  let element = e.target;
  if (element.matches("li")) {
    city = $(element).text();
    getWeather(city);
    renderCities();
  }
});

function pageLoad() {
  var storedCities = JSON.parse(localStorage.getItem("cities"));
  if (storedCities !== null) {
    cities = storedCities;
    index = storedCities.length - 1;
    city = storedCities[index];
  }
  renderCities();
  getWeather(city);
}

function renderCities() {
  $("#5-day").empty();
  $(".list-group").empty();

  localStorage.setItem("cities", JSON.stringify(cities));
  cities.forEach((city) => {
    let $city = $("<li>").addClass("list-group-item").text(city);
    $(".list-group").prepend($city);
  });
}
function getWeather(city) {
  let APIKey = "d9a9ca04881f1da4bcfcc61c47033231";
  let queryURL =
    "https://api.openweathermap.org/data/2.5/weather?q=" +
    city +
    "&appid=" +
    APIKey;
  $.ajax({
    url: queryURL,
    method: "GET",
  }).then(function (response) {
    let date = moment.unix(response.dt).format("MM/DD/YYYY");
    let cityName = response.name;
    let lat = response.coord.lat;
    let lon = response.coord.lon;
    let temp = response.main.temp;
    let tempF = Math.round((temp - 273.15) * 1.8 + 32);
    let wSpeed = response.wind.speed;
    let hum = response.main.humidity;
    let iconID = response.weather[0].icon;
    let $icon = $("<img>").attr(
      "src",
      "http://openweathermap.org/img/wn/" + iconID + "@2x.png"
    );
    getUvIndex(lat, lon);
    getFiveDay(cityName);
    $("#city-name")
      .text(cityName + " " + date)
      .append($icon);
    $("#main-temp").text("Temperature: " + tempF + "°F");
    $("#main-hum").text("Humidity: " + hum + "%");
    $("#main-wind").text("Wind Speed: " + wSpeed + " mph");
  });
}
function getUvIndex(lat, lon) {
  let uvQuery =
    "https://api.openweathermap.org/data/2.5/uvi?appid=" +
    APIKey +
    "&lat=" +
    lat +
    "&lon=" +
    lon;
  $.ajax({
    url: uvQuery,
    method: "GET",
  }).then(function (uvResponse) {
    let uvIndex = uvResponse.value;
    $("#uv").text(uvIndex);
    if (uvIndex < 3) {
      $("#uv").attr("class", "uv-low");
    } else if (uvIndex < 6) {
      $("#uv").attr("class", "uv-mod");
    } else if (uvIndex < 9) {
      $("#uv").attr("class", "uv-high");
    } else if (uvIndex > 9) {
      $("#uv").attr("class", "uv-ext");
    }
  });
}
function getFiveDay(cityName) {
  let fiveQuery =
    "https://api.openweathermap.org/data/2.5/forecast?q=" +
    cityName +
    "&appid=" +
    APIKey;
  $.ajax({
    url: fiveQuery,
    method: "GET",
  }).then(function (fiveResponse) {
    let fiveList = fiveResponse.list;
    for (let i = 0; i < fiveList.length; i++) {
      let dayIndex = fiveList[i];
      let dateTime = dayIndex.dt_txt;
      if (dateTime.includes("21:00")) {
        let $card = $("<div>")
          .addClass("card mr-3")
          .attr("style", "width: 12rem");
        let $body = $("<div>").addClass("card-body");
        let fdDate = moment.unix(dayIndex.dt).format("MM/DD/YYYY");
        let $date = $("<h5>").addClass("card-title").text(fdDate);
        let fdIconID = dayIndex.weather[0].icon;
        let $fdIcon = $("<img>").attr(
          "src",
          "http://openweathermap.org/img/wn/" + fdIconID + "@2x.png"
        );
        let fdTemp = dayIndex.main.temp;
        let fdTempF = Math.round((fdTemp - 273.15) * 1.8 + 32);
        let $temp = $("<p>")
          .addClass("card-text")
          .text("Temperature: " + fdTempF + "°F");
        let fdHum = dayIndex.main.humidity;
        let $hum = $("<p>")
          .addClass("card-text")
          .text("Humidity: " + fdHum + "%");
        $($body).append($date, $fdIcon, $temp, $hum);
        $($card).append($body);
        $("#5-day").append($card);
      }
    }
  });
}
