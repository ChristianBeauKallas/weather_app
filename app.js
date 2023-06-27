const locationForm = document.getElementById('locationForm');
const weatherTableBody = document.getElementById('weatherTableBody');
const messageDiv = document.getElementById('message');
const apiKey = '3814d3ddaecdc16f376009c0e807c718';
const weatherContainer = document.getElementById('weatherContainer');
const locationInput = document.getElementById('locationInput');
const saveAreaBtn = document.getElementById('saveAreaBtn');
const savedAreaList = document.getElementById('savedAreaList');

weatherContainer.style.display = 'none';
saveAreaBtn.style.display = 'none';

class SelectedAreas {
    constructor() {
        this.areas = [];
    }
    addArea(city, state) {
        const area = {
        city,
        state,
        lastChecked: new Date().toLocaleString(),
        };
        this.areas.push(area);
    }
    removeArea(city, state) {
        const index = this.areas.findIndex(
        (savedArea) => savedArea.city === city && savedArea.state === state
    );
    if (index > -1) {
        this.areas.splice(index, 1);
    }
    }
    alreadySavedArea(city, state) {
        return this.areas.some(
        (savedArea) => savedArea.city === city && savedArea.state === state
        );
    }
        updateLastChecked(city, state, lastChecked) {
        const area = this.areas.find(
        (savedArea) => savedArea.city === city && savedArea.state === state
        );
        if (area) {
        area.lastChecked = lastChecked;
        }
    }
    getAreas() {
    return this.areas;
    }
}

const selectedAreas = new SelectedAreas();
const cityHeadings = {};

locationForm.addEventListener('submit', function (event) {
    event.preventDefault();
    weatherContainer.style.display = 'none';
    const location = locationInput.value.trim();
    const [city, state] = location.split(',');
    getWeather(city.trim(), state.trim());
});

saveAreaBtn.addEventListener('click', function () {
    let location = locationInput.value.trim();
    let [city, state] = location.split(',');
    city = city.trim();
    state = state.trim();

    if (!selectedAreas.alreadySavedArea(city, state)) {
        selectedAreas.addArea(city, state);
        updateSavedAreaList();
    } 
    else {
        alert('This Area Is Already Saved!');
    }
});

function getWeather(city, state) {
    const geoApiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city},${state}&limit=1&appid=${apiKey}`;

    fetch(geoApiUrl)
        .then((res) => res.json())
        .then((dataObj) => {
            if (dataObj.length > 0) {
            const { lat, lon } = dataObj[0];
            getForecast(lat, lon, city, state);
        } else {
            messageDiv.textContent = 'Location not found.';
        }
    })
        .catch((error) => {
            messageDiv.textContent = 'Error fetching weather data: ' + error;
    });
}

function getForecast(lat, lon, city, state) {
    const forecastApiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&units=imperial&appid=${apiKey}`;

    fetch(forecastApiUrl)
        .then((res) => res.json())
        .then((dataObj) => {
        weatherTableBody.innerHTML = '';
        messageDiv.textContent = '';

        if (dataObj.main && dataObj.weather) {
            const temperature = dataObj.main.temp;
            const weatherDescription = dataObj.weather[0].description;

            const cityName = dataObj.name;

            const currentCityHeading = document.getElementById('currentCityHeading');
            currentCityHeading.textContent = `Current Weather In ${cityName}`;

            const row = document.createElement('tr');
            const temperatureCell = document.createElement('td');
            const descriptionCell = document.createElement('td');

            temperatureCell.textContent = `${temperature} °F`;
            descriptionCell.textContent = weatherDescription;

            row.appendChild(temperatureCell);
            row.appendChild(descriptionCell);

            weatherTableBody.appendChild(row);

            weatherContainer.style.display = 'block';
            saveAreaBtn.style.display = 'block';

            if (selectedAreas.alreadySavedArea(city, state)) {
                selectedAreas.updateLastChecked(
                    city,
                    state,
                    new Date().toLocaleString()
                );
                updateSavedAreaList();
            }
        } else {
            messageDiv.textContent = 'No forecast data available for this location.';
            saveAreaBtn.style.display = 'none';
        }
    })
    .catch((error) => {
        messageDiv.textContent = 'Error fetching forecast data: ' + error;
    });
}


function updateSavedAreaList() {
    savedAreaList.innerHTML = '';

    selectedAreas.getAreas().forEach((area) => {
        const listItemWrapper = document.createElement('div');
        listItemWrapper.className = 'saved-area-item'; 

        const cityNameDiv = document.createElement('div');
        cityNameDiv.textContent = `${area.city}, ${area.state}`;
        
        const lastCheckedDiv = document.createElement('div');
        lastCheckedDiv.textContent = `Last Checked: ${area.lastChecked}`;

        const savedAreaListItem = document.createElement('li');
        savedAreaListItem.appendChild(cityNameDiv);
        savedAreaListItem.appendChild(lastCheckedDiv);

        listItemWrapper.appendChild(savedAreaListItem);

        const buttonWrapper = document.createElement('div');
        buttonWrapper.className = 'button-container';

        const refetchWeatherButton = document.createElement('button');
        refetchWeatherButton.className = 'btn';
        refetchWeatherButton.textContent = 'Check Current Weather';
        refetchWeatherButton.addEventListener('click', function () {
            getWeather(area.city, area.state);
        });
        buttonWrapper.appendChild(refetchWeatherButton);

        const removeAreaButton = document.createElement('button');
        removeAreaButton.className = 'btn';
        removeAreaButton.textContent = 'Remove Area';
        removeAreaButton.addEventListener('click', function () {
            selectedAreas.removeArea(area.city, area.state);
            updateSavedAreaList();
        });
        buttonWrapper.appendChild(removeAreaButton);

        listItemWrapper.appendChild(buttonWrapper);
        savedAreaList.appendChild(listItemWrapper);
    });
}


updateSavedAreaList();
