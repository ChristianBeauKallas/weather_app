const locationForm = document.getElementById('locationForm');
const weatherTableBody = document.getElementById('weatherTableBody');
const messageDiv = document.getElementById('message');
const apiKey = '3814d3ddaecdc16f376009c0e807c718';
const weatherContainer = document.getElementById('weatherContainer');
const locationInput = document.getElementById('locationInput');
const saveAreaBtn = document.getElementById('saveAreaBtn');
const savedAreaList = document.getElementById('savedAreaList');

weatherContainer.style.display = 'none';
saveAreaBtn.style.display = "none";

class SelectedAreas {
    constructor(){
        this.areas = [];
    }
    addArea(city, state) {
        this.areas.push({city, state});
    }
    removeArea(city, state){
        const index = this.areas.findIndex(savedArea => savedArea.city === city && savedArea.state === state);
        if (index > -1) {
            this.areas.splice(index,1);
        }
    }
    alreadySavedArea(city, state) {
        return this.areas.some(savedArea => savedArea.city === city && savedArea.state === state);
    }
    getAreas(){
        return this.areas;
    }
}

const selectedAreas = new SelectedAreas();

locationForm.addEventListener('submit', function (event) {
    event.preventDefault();
    weatherContainer.style.display ='none';
    const location = locationInput.value.trim();
    const [city, state] = location.split(','); 
    getWeather(city.trim(), state.trim());
});

saveAreaBtn.addEventListener('click', function(){
    let location = locationInput.value.trim();
    let [city, state] = location.split (',');
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
        .then(res => res.json())
        .then(dataObj => {
            if (dataObj.length > 0) {
                const { lat, lon } = dataObj[0];
                getForecast(lat, lon);
            } else {
                messageDiv.textContent = 'Location not found.'; 
            }
        })
        .catch(error => {
            messageDiv.textContent = 'Error fetching weather data: ' + error; 
        });
}

function getForecast(lat, lon) {
    const forecastApiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&units=imperial&appid=${apiKey}`;

    fetch(forecastApiUrl)
        .then(res => res.json())
        .then(dataObj => {
            weatherTableBody.innerHTML = '';
            messageDiv.textContent = ''; 

            if (dataObj.main && dataObj.weather) {
                const temperature = dataObj.main.temp;
                const weatherDescription = dataObj.weather[0].description;

                const cityName = dataObj.name; 
                const heading = document.createElement('h1');
                
                heading.textContent = `Current Weather In ${cityName}`;
                weatherContainer.insertBefore(heading, weatherContainer.firstChild);

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

                const mainHeader = document.getElementById('mainHeader');
                const locationForm = document.getElementById('locationForm');
                
                mainHeader.style.display = 'none';
                locationForm.style.display = 'none';
            } 
            else {
                messageDiv.textContent = 'No forecast data available for this location.';
                saveAreaBtn.style.display = 'none';
            }
        })
        .catch(error => {
            messageDiv.textContent = 'Error fetching forecast data: ' + error; 
        });
}

function updateSavedAreaList() {
    savedAreaList.innerHTML = '';

    selectedAreas.getAreas().forEach((area) => {
        const listItemWrapper = document.createElement('div');
        listItemWrapper.className = 'list-item-wrapper';

        const savedAreaListItem = document.createElement('li');
        savedAreaListItem.textContent = `${area.city}, ${area.state}`;

        listItemWrapper.appendChild(savedAreaListItem);

        const buttonWrapper = document.createElement('div');
        buttonWrapper.className = 'button-wrapper';

        const refetchWeatherButton = document.createElement('button');
        refetchWeatherButton.className = 'btn';
        refetchWeatherButton.textContent = 'Get Weather';
        refetchWeatherButton.addEventListener('click', function() {
            getWeather(area.city, area.state);
        });
        buttonWrapper.appendChild(refetchWeatherButton);

        const removeAreaButton = document.createElement('button');
        removeAreaButton.className = 'btn';
        removeAreaButton.textContent = 'Remove Area';
        removeAreaButton.addEventListener('click', function(){
            selectedAreas.removeArea(area.city, area.state);
            updateSavedAreaList();
        });
        buttonWrapper.appendChild(removeAreaButton);

        listItemWrapper.appendChild(buttonWrapper);
        savedAreaList.appendChild(listItemWrapper);
    });
}
updateSavedAreaList();

