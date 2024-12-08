// Helper functions to select elements
let id = id => document.getElementById(id);
let q = q => document.querySelector(q);

// Selecting DOM elements
let inputField = id('location');
let container = q('.container');
let search = q('.search-box button');
let weatherBox = q('.weather-box');
let weatherDetails = q('.weather-details');

// Add
const suggestionsList = document.getElementById('suggestions');
const searchButton = document.querySelector('.search-box button');

// OpenWeather API Key
const APIKey = '2675a0482e5c8100dce84fc9f2ecfe88';

// Endpoint to fetch city suggestions
const citySuggestionsEndpoint = (query) =>
    `http://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${APIKey}`;

// Function to fetch city suggestions
async function fetchCitySuggestions(query) {
    // Hide dropdown if query is empty
    if (!query) {
        suggestionsList.innerHTML = '';
        suggestionsList.style.display = 'none';
        return;
    }

    try {
        // Fetch city suggestions from OpenWeather API
        const response = await fetch(citySuggestionsEndpoint(query));
        const data = await response.json();

        // Limit the number of suggestions to 3
        const limitedData = data.slice(0, 3);

        // Populate the dropdown with limited suggestions
        if (limitedData.length > 0) {
            suggestionsList.innerHTML = limitedData
                .map(
                    (city) =>
                        `<li data-city="${city.name},${city.country}">
                            ${city.name}, ${city.state ? city.state + ',' : ''} ${city.country}
                        </li>`
                )
                .join('');
            suggestionsList.style.display = 'block'; // Show the dropdown
        } else {
            suggestionsList.innerHTML = '<li>No results found</li>';
            suggestionsList.style.display = 'block';
        }
    } catch (error) {
        console.error('Error fetching city suggestions:', error);
        suggestionsList.innerHTML = '<li>Error fetching results</li>';
        suggestionsList.style.display = 'block';
    }
}

// Function to fetch and display weather data
async function fetchWeather(city) {
    if (!city) {
        createPopup('Please enter a valid city name.');
        return;
    }

    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${APIKey}`);
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('City not found. Please try again.');
            } else {
                throw new Error('Failed to fetch weather data. Try again later.');
            }
        }

        let json = await response.json();

        // Selecting DOM elements to update
        const image = q('.weather-box .box .info-weather .weather img');
        const temperature = q('.weather-box .box .info-weather .weather .temperature');
        const description = q('.weather-box .box .info-weather .weather .description');
        const humidity = q('.weather-details .humidity .text .info-humidity span');
        const wind = q('.weather-details .wind .text .info-wind span');
        const pressure = q('.weather-details .pressure .text .info-pressure span');
        const visibility = q('.weather-details .visibility .text .info-visibility span');
        const sunrise = q('.weather-details .sunrise .text .info-sunrise span');
        const sunset = q('.weather-details .sunset .text .info-sunset span');

        // Mapping weather conditions to images
        const weatherImages = {
            Clear: 'images/clear.png',
            Rain: 'images/rain.png',
            Clouds: 'images/cloud.png',
            Snow: 'images/snow.png',
            Mist: 'images/mist.png',
            Haze: 'images/mist.png',
            Drizzle: 'images/rain.png',
            Thunderstorm: 'images/thunderstorm.png'
        };

        if (json.weather && json.weather[0]) {
            const weatherMain = json.weather[0].main;
            image.src = weatherImages[weatherMain] || 'images/cloud.png'; // Fallback image
            temperature.innerHTML = `${parseInt(json.main.temp)}<span>°C</span>`;
            description.innerHTML = `${json.weather[0].description}`;
            humidity.innerHTML = `${json.main.humidity}%`;
            wind.innerHTML = `${parseFloat(json.wind.speed)} km/h`;

            // Update additional details
            pressure.innerHTML = `${json.main.pressure} hPa`;
            visibility.innerHTML = `${(json.visibility / 1000).toFixed(1)} km`;
            sunrise.innerHTML = convertUnixToTime(json.sys.sunrise);
            sunset.innerHTML = convertUnixToTime(json.sys.sunset);

            // Show weather box
            weatherBox.style.display = "block";
        }
    } catch (error) {
        createPopup(error.message);
    }
}

// Function to create and display a custom popup
function createPopup(message) {
    let popup = document.createElement('div');
    popup.classList.add('custom-popup');
    popup.innerHTML = `
        <div class="popup-content">
            <p>${message}</p>
            <button class="close-popup">OK</button>
        </div>
    `;
    document.body.appendChild(popup);

    let closeButton = popup.querySelector('.close-popup');
    closeButton.addEventListener('click', () => {
        document.body.removeChild(popup);
    });
}

// Function to convert Unix timestamp to HH:MM AM/PM format
function convertUnixToTime(unix_timestamp) {
    const date = new Date(unix_timestamp * 1000);
    let hours = date.getHours();
    const minutes = "0" + date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    return hours + ':' + minutes.substr(-2) + ' ' + ampm;
}

// Event listener for input field changes
inputField.addEventListener('input', (event) => {
    const query = event.target.value.trim();
    fetchCitySuggestions(query); // Fetch suggestions based on input
});

// Handle dropdown selection
suggestionsList.addEventListener('click', (event) => {
    if (event.target.tagName === 'LI') {
        // Update input field with selected city
        inputField.value = event.target.dataset.city;
        suggestionsList.style.display = 'none'; // Hide the dropdown

        // Fetch weather data for the selected city
        fetchWeather(event.target.dataset.city);
    }
});

// Close dropdown when clicking outside
document.addEventListener('click', (event) => {
    if (!event.target.closest('.dropdown-wrapper')) {
        suggestionsList.style.display = 'none';
    }
});

// Event listeners for input field focus and blur to handle placeholder
inputField.addEventListener('focus', () => {
    inputField.setAttribute('placeholder', '');
});
inputField.addEventListener('blur', () => {
    inputField.setAttribute('placeholder', 'Enter your location');
});

// Event listener for search button click
search.addEventListener('click', () => {
    const city = inputField.value.trim();
    fetchWeather(city); // Trigger weather fetch based on input
});
