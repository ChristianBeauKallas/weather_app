const locationForm = document.getElementById('locationForm');
const weatherTableBody = document.getElementById('weatherTableBody');
const messageDiv = document.getElementById('message');
const apiKey = '3814d3ddaecdc16f376009c0e807c718';

function getWeather() {
    console.log("getWeather function called");

    const locationInput = document.getElementById('locationInput');
    const location = locationInput.value.trim();
    const [city, state] = location.split(','); 

    console.log(`Location: ${city}, ${state}`);

    const geoApiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city},${state}&limit=1&appid=${apiKey}`;

    fetch(geoApiUrl)
        .then((res) => {
            console.log('Fetch Geo Response:', res);
            return res.json();
        })
        .then((dataObj) => {
            console.log('Geo Data:', dataObj);

            if (dataObj.length > 0) {
                const { lat, lon } = dataObj[0];
                console.log(`Lat: ${lat}, Lon: ${lon}`);
                getForecast(lat, lon);
            } else {
                messageDiv.textContent = 'Location not found.'; 
            }
        })
        .catch((error) => {
            console.error('Fetch Geo Error:', error);
            messageDiv.textContent = 'Error fetching weather data: ' + error; 
        });
}

function getForecast(lat, lon) {
    console.log("getForecast function called with Lat:", lat, " Lon:", lon);

    const forecastApiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&units=imperial&appid=${apiKey}`;

    fetch(forecastApiUrl)
        .then((res) => {
            console.log('Fetch Forecast Response:', res);
            return res.json();
        })
        .then((dataObj) => {
            console.log('Forecast Data:', dataObj);

            weatherTableBody.innerHTML = '';
            messageDiv.textContent = ''; 

            if (dataObj.main && dataObj.weather) {
                const temperature = dataObj.main.temp;
                const weatherDescription = dataObj.weather[0].description;

                console.log('Temperature:', temperature, 'Weather Description:', weatherDescription);

                const row = document.createElement('tr');
                const temperatureCell = document.createElement('td');
                const descriptionCell = document.createElement('td');

                temperatureCell.textContent = `${temperature} °F`;
                descriptionCell.textContent = weatherDescription;

                row.appendChild(temperatureCell);
                row.appendChild(descriptionCell);

                weatherTableBody.appendChild(row);
            } else {
                messageDiv.textContent = 'No forecast data available for this location.';
            }
        })
        .catch((error) => {
            console.error('Fetch Forecast Error:', error);
            messageDiv.textContent = 'Error fetching forecast data: ' + error; 
        });
}

locationForm.addEventListener('submit', function (event) {
    console.log("Form submit event", event);
    event.preventDefault();
    getWeather();
});
