import axios from 'axios';

// Get weather API key from environment variables
const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const BASE_URL = 'https://api.weatherapi.com/v1';

/**
 * Get current weather data for a location
 * @param {string} location - City name or lat,lon coordinates
 * @returns {Promise} - Weather data
 */
export const getCurrentWeather = async (location) => {
  try {
    const response = await axios.get(`${BASE_URL}/current.json`, {
      params: {
        key: API_KEY,
        q: location,
        aqi: 'yes' // Include air quality data
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching current weather:', error);
    throw error;
  }
};

/**
 * Get weather forecast for a location
 * @param {string} location - City name or lat,lon coordinates
 * @param {number} days - Number of days to forecast (1-10)
 * @returns {Promise} - Forecast data
 */
export const getWeatherForecast = async (location, days = 7) => {
  try {
    const response = await axios.get(`${BASE_URL}/forecast.json`, {
      params: {
        key: API_KEY,
        q: location,
        days: days,
        aqi: 'yes', // Include air quality data
        alerts: 'yes' // Include weather alerts
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    throw error;
  }
};

/**
 * Get agriculture-specific weather data
 * This combines and processes data from multiple endpoints to provide
 * agriculture-relevant information
 * @param {string} location - City name or lat,lon coordinates
 * @returns {Promise} - Agriculture-focused weather data
 */
export const getAgricultureWeather = async (location) => {
  try {
    // Get 3-day forecast with all data needed for agriculture
    const forecastData = await getWeatherForecast(location, 3);
    
    // Extract and organize agriculture-relevant data
    const agricultureData = {
      current: {
        ...forecastData.current,
        location: forecastData.location
      },
      forecast: forecastData.forecast,
      alerts: forecastData.alerts || { alert: [] }
    };
    
    return agricultureData;
  } catch (error) {
    console.error('Error fetching agriculture weather data:', error);
    throw error;
  }
};
