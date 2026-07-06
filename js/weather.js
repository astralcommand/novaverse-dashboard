console.log("weather.js loaded");
const WEATHER_API_KEY = "a3a2260e20ac180d652c91eb95bf6af0";

const CITY = "Columbus,GA,US";

async function loadWeather() {

    const url =
        `https://api.openweathermap.org/data/2.5/weather?q=${CITY}&units=imperial&appid=${WEATHER_API_KEY}`;

    const response = await fetch(url);

    const data = await response.json();

    console.log(data);
    const icon = data.weather[0].icon;

document.getElementById("weather-icon").src =
    `https://openweathermap.org/img/wn/${icon}@2x.png`;

document.getElementById("weather-icon").alt =
    data.weather[0].description;
    
    if (!response.ok) {
    
        console.error(data);
    
        document.getElementById("temperature").textContent = "--°";
    
        document.getElementById("weather").textContent = "Unavailable";
    
        return;
    
    }
    
    document.getElementById("temperature").textContent =
        `${Math.round(data.main.temp)}°`;
    
        document.getElementById("weather").textContent =
        data.weather[0].description;

    

}

loadWeather();