import React, { useState, useEffect } from 'react';
import { getAgricultureWeather } from '../../Services/weatherService';
import { TiWeatherPartlySunny } from "react-icons/ti";
import { WiHumidity, WiStrongWind, WiRaindrops } from "react-icons/wi";
import { FaTemperatureHigh, FaTemperatureLow, FaUmbrella } from "react-icons/fa";
import { MdAir, MdVisibility } from "react-icons/md";
import { BsSunrise, BsSunset } from "react-icons/bs";
import { toast } from 'react-hot-toast';

const Weather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  
  // Get user's location on component mount
  useEffect(() => {
    // Try to get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation(`${latitude},${longitude}`);
        },
        (error) => {
          console.error("Error getting location:", error);
          // Default to a location if geolocation fails
          setLocation('Islamabad');
          toast.error('Could not get your location. Showing default weather.');
        }
      );
    } else {
      // Default location if geolocation is not supported
      setLocation('Islamabad');
    }
  }, []);

  // Fetch weather data when location changes
  useEffect(() => {
    if (!location) return;
    
    const fetchWeatherData = async () => {
      try {
        setLoading(true);
        const data = await getAgricultureWeather(location);
        setWeatherData(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch weather data:', err);
        setError('Failed to fetch weather data. Please try again later.');
        toast.error('Failed to fetch weather data');
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, [location]);

  // Handle location search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchLocation.trim()) {
      setLocation(searchLocation.trim());
      setSearchLocation('');
    }
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get weather condition color based on conditions
  const getConditionColor = (condition) => {
    const text = condition.toLowerCase();
    if (text.includes('sun') || text.includes('clear')) return 'text-yellow-500';
    if (text.includes('rain') || text.includes('drizzle')) return 'text-blue-500';
    if (text.includes('cloud')) return 'text-gray-500';
    if (text.includes('snow')) return 'text-blue-200';
    if (text.includes('storm') || text.includes('thunder')) return 'text-purple-500';
    return 'text-gray-700';
  };

  // Get farming advice based on weather conditions
  const getFarmingAdvice = (weatherData) => {
    if (!weatherData) return null;
    
    const current = weatherData.current;
    const forecast = weatherData.forecast.forecastday;
    const alerts = weatherData.alerts.alert;
    
    const advice = [];
    
    // Check for alerts first
    if (alerts && alerts.length > 0) {
      advice.push({
        title: 'Weather Alert!',
        text: alerts[0].headline || 'Weather alert in your area. Take precautions.',
        priority: 'high'
      });
    }
    
    // Check temperature conditions
    if (current.temp_c > 35) {
      advice.push({
        title: 'Extreme Heat',
        text: 'Consider irrigating crops during cooler parts of the day. Provide shade for livestock.',
        priority: 'high'
      });
    } else if (current.temp_c < 5) {
      advice.push({
        title: 'Cold Weather',
        text: 'Protect sensitive crops from frost. Ensure livestock have adequate shelter.',
        priority: 'high'
      });
    }
    
    // Check precipitation
    if (current.precip_mm > 0) {
      advice.push({
        title: 'Rainfall Detected',
        text: 'Consider postponing any spraying activities. Check fields for proper drainage.',
        priority: 'medium'
      });
    }
    
    // Check wind conditions
    if (current.wind_kph > 20) {
      advice.push({
        title: 'Strong Winds',
        text: 'Avoid spraying pesticides. Secure loose items and structures.',
        priority: 'medium'
      });
    }
    
    // Check UV index
    if (current.uv > 8) {
      advice.push({
        title: 'High UV Levels',
        text: 'Protect yourself and workers from sun exposure. Some crops may need shade.',
        priority: 'medium'
      });
    }
    
    // Check air quality
    if (current.air_quality && current.air_quality['us-epa-index'] > 3) {
      advice.push({
        title: 'Poor Air Quality',
        text: 'Limit outdoor work during peak pollution hours. Monitor sensitive crops.',
        priority: 'medium'
      });
    }
    
    // Check humidity
    if (current.humidity > 85) {
      advice.push({
        title: 'High Humidity',
        text: 'Monitor for fungal diseases. Ensure proper ventilation in greenhouses and storage areas.',
        priority: 'medium'
      });
    } else if (current.humidity < 30) {
      advice.push({
        title: 'Low Humidity',
        text: 'Increase irrigation frequency. Watch for signs of water stress in crops.',
        priority: 'medium'
      });
    }
    
    // Check forecast for upcoming conditions
    if (forecast && forecast.length > 1) {
      const tomorrow = forecast[1].day;
      
      // Check if rain is coming
      if (tomorrow.daily_chance_of_rain > 70) {
        advice.push({
          title: 'Rain Expected Tomorrow',
          text: 'Consider completing harvesting or field work today. Prepare for wet conditions.',
          priority: 'medium'
        });
      }
      
      // Check for temperature changes
      const tempDiff = tomorrow.avgtemp_c - current.temp_c;
      if (Math.abs(tempDiff) > 5) {
        advice.push({
          title: 'Temperature Change Coming',
          text: `Expect ${tempDiff > 0 ? 'warmer' : 'cooler'} temperatures tomorrow. Adjust irrigation and field activities accordingly.`,
          priority: 'low'
        });
      }
    }
    
    return advice.length > 0 ? advice : [{
      title: 'Favorable Conditions',
      text: 'Current weather conditions appear suitable for most farming activities.',
      priority: 'low'
    }];
  };

  // Get priority class for advice
  const getAdvicePriorityClass = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 border-red-500 text-red-700';
      case 'medium':
        return 'bg-yellow-100 border-yellow-500 text-yellow-700';
      case 'low':
        return 'bg-green-100 border-green-500 text-green-700';
      default:
        return 'bg-gray-100 border-gray-500 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-2 sm:p-3 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-4 sm:gap-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-3 sm:p-4 rounded-lg shadow-md gap-3 sm:gap-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#0A690E] flex items-center">
              <TiWeatherPartlySunny className="mr-2 text-2xl sm:text-3xl md:text-4xl" />
              Weather Updates
            </h1>
            
            {/* Search form */}
            <form onSubmit={handleSearch} className="flex w-full sm:w-auto">
              <input
                type="text"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                placeholder="Enter location..."
                className="w-full sm:w-auto px-2 sm:px-3 py-1 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#0A690E]"
              />
              <button
                type="submit"
                className="bg-[#0A690E] text-white px-2 sm:px-4 py-1 sm:py-2 text-sm sm:text-base rounded-r-md hover:bg-[#085a0c] transition-colors"
              >
                Search
              </button>
            </form>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64 bg-white p-8 rounded-lg shadow-md">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#0A690E]"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 text-red-700 p-4 rounded-lg shadow-md">
              <p>{error}</p>
            </div>
          ) : weatherData ? (
            <>
              {/* Current Weather */}
              <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-md">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3 sm:mb-4 md:mb-6">
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                      {weatherData.current.location.name}, {weatherData.current.location.country}
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600">{formatDate(weatherData.current.location.localtime)}</p>
                  </div>
                  <div className="mt-2 sm:mt-3 md:mt-0">
                    <p className="text-xs sm:text-sm text-gray-600">Last updated: {new Date(weatherData.current.last_updated).toLocaleTimeString()}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* Main weather display */}
                  <div className="flex items-center justify-center md:justify-start">
                    <img 
                      src={weatherData.current.condition.icon} 
                      alt={weatherData.current.condition.text}
                      className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24"
                    />
                    <div className="ml-2 sm:ml-4">
                      <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold">{weatherData.current.temp_c}°C</h3>
                      <p className={`text-sm sm:text-base md:text-lg ${getConditionColor(weatherData.current.condition.text)}`}>
                        {weatherData.current.condition.text}
                      </p>
                    </div>
                  </div>
                  
                  {/* Weather details */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-4">
                    <div className="flex items-center">
                      <FaTemperatureHigh className="text-red-500 text-lg sm:text-xl mr-1 sm:mr-2" />
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600">Feels Like</p>
                        <p className="text-sm sm:text-base font-semibold">{weatherData.current.feelslike_c}°C</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <WiHumidity className="text-blue-500 text-lg sm:text-xl mr-1 sm:mr-2" />
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600">Humidity</p>
                        <p className="text-sm sm:text-base font-semibold">{weatherData.current.humidity}%</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <WiStrongWind className="text-gray-500 text-lg sm:text-xl mr-1 sm:mr-2" />
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600">Wind</p>
                        <p className="text-sm sm:text-base font-semibold">{weatherData.current.wind_kph} km/h</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <WiRaindrops className="text-blue-500 text-lg sm:text-xl mr-1 sm:mr-2" />
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600">Precipitation</p>
                        <p className="text-sm sm:text-base font-semibold">{weatherData.current.precip_mm} mm</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Farming Advice */}
              <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-md">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 sm:mb-4">Farming Advice</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {getFarmingAdvice(weatherData).map((advice, index) => (
                    <div 
                      key={index} 
                      className={`p-2 sm:p-3 md:p-4 border-l-4 rounded-md ${getAdvicePriorityClass(advice.priority)}`}
                    >
                      <h3 className="text-sm sm:text-base font-semibold mb-1">{advice.title}</h3>
                      <p className="text-xs sm:text-sm md:text-base">{advice.text}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* 3-Day Forecast */}
              <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-md">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 sm:mb-4">3-Day Forecast</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  {weatherData.forecast.forecastday.map((day) => (
                    <div key={day.date} className="border rounded-lg p-2 sm:p-3 md:p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-center mb-1 sm:mb-2">
                        <h3 className="text-sm sm:text-base font-semibold">
                          {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                        </h3>
                        <img 
                          src={day.day.condition.icon} 
                          alt={day.day.condition.text}
                          className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12"
                        />
                      </div>
                      <p className={`text-xs sm:text-sm mb-1 sm:mb-2 ${getConditionColor(day.day.condition.text)}`}>
                        {day.day.condition.text}
                      </p>
                      <div className="flex justify-between">
                        <div className="flex items-center">
                          <FaTemperatureHigh className="text-red-500 mr-1 text-xs sm:text-sm" />
                          <span className="text-xs sm:text-sm">{day.day.maxtemp_c}°C</span>
                        </div>
                        <div className="flex items-center">
                          <FaTemperatureLow className="text-blue-500 mr-1 text-xs sm:text-sm" />
                          <span className="text-xs sm:text-sm">{day.day.mintemp_c}°C</span>
                        </div>
                      </div>
                      <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <FaUmbrella className="mr-1 text-xs sm:text-sm" />
                            <span className="text-xs sm:text-sm">{day.day.daily_chance_of_rain}%</span>
                          </div>
                          <div className="flex items-center">
                            <WiRaindrops className="mr-1 text-xs sm:text-sm" />
                            <span className="text-xs sm:text-sm">{day.day.totalprecip_mm} mm</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-1 sm:mt-2 grid grid-cols-2 gap-1 sm:gap-2 text-xs text-gray-600">
                        <div className="flex items-center">
                          <BsSunrise className="mr-1 text-yellow-500 text-xs" />
                          <span className="text-xs">{day.astro.sunrise}</span>
                        </div>
                        <div className="flex items-center">
                          <BsSunset className="mr-1 text-orange-500 text-xs" />
                          <span className="text-xs">{day.astro.sunset}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Additional Agricultural Data */}
              <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-md">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 sm:mb-4">Agricultural Conditions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                  <div className="border rounded-lg p-2 sm:p-3 md:p-4">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-700 mb-1 sm:mb-2 flex items-center">
                      <MdVisibility className="mr-1 sm:mr-2 text-blue-500" /> Visibility
                    </h3>
                    <p className="text-xl sm:text-2xl font-bold">{weatherData.current.vis_km} km</p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      {weatherData.current.vis_km < 2 
                        ? 'Poor visibility may affect field operations' 
                        : 'Good visibility for field operations'}
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-2 sm:p-3 md:p-4">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-700 mb-1 sm:mb-2 flex items-center">
                      <MdAir className="mr-1 sm:mr-2 text-green-500" /> Air Quality
                    </h3>
                    <p className="text-xl sm:text-2xl font-bold">
                      {weatherData.current.air_quality && weatherData.current.air_quality['us-epa-index'] 
                        ? ['Good', 'Moderate', 'Unhealthy for Sensitive Groups', 'Unhealthy', 'Very Unhealthy', 'Hazardous'][weatherData.current.air_quality['us-epa-index'] - 1] 
                        : 'N/A'}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      {weatherData.current.air_quality && weatherData.current.air_quality['us-epa-index'] > 2
                        ? 'May affect sensitive crops'
                        : 'Favorable for crop health'}
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-2 sm:p-3 md:p-4">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-700 mb-1 sm:mb-2 flex items-center">
                      <FaTemperatureHigh className="mr-1 sm:mr-2 text-red-500" /> UV Index
                    </h3>
                    <p className="text-xl sm:text-2xl font-bold">{weatherData.current.uv}</p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      {weatherData.current.uv > 7 
                        ? 'High UV exposure - protect workers and sensitive crops' 
                        : weatherData.current.uv > 3 
                          ? 'Moderate UV levels' 
                          : 'Low UV exposure'}
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-2 sm:p-3 md:p-4">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-700 mb-1 sm:mb-2 flex items-center">
                      <WiStrongWind className="mr-1 sm:mr-2 text-blue-500" /> Wind Direction
                    </h3>
                    <p className="text-xl sm:text-2xl font-bold">{weatherData.current.wind_dir}</p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      {weatherData.current.wind_kph > 15 
                        ? 'Consider wind direction for spraying operations' 
                        : 'Minimal wind impact on field operations'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Weather Alerts */}
              {weatherData.alerts && weatherData.alerts.alert && weatherData.alerts.alert.length > 0 && (
                <div className="bg-red-50 p-3 sm:p-4 md:p-6 rounded-lg shadow-md border-l-4 border-red-500">
                  <h2 className="text-lg sm:text-xl font-semibold text-red-700 mb-2 sm:mb-4">Weather Alerts</h2>
                  <div className="space-y-2 sm:space-y-4">
                    {weatherData.alerts.alert.map((alert, index) => (
                      <div key={index} className="bg-white p-2 sm:p-3 md:p-4 rounded-md shadow-sm">
                        <h3 className="text-sm sm:text-base font-semibold text-red-700">{alert.headline || 'Weather Alert'}</h3>
                        {alert.desc && <p className="text-xs sm:text-sm mt-1 sm:mt-2">{alert.desc}</p>}
                        {alert.effective && alert.expires && (
                          <p className="text-xs text-gray-600 mt-1 sm:mt-2">
                            Valid from {new Date(alert.effective).toLocaleString()} to {new Date(alert.expires).toLocaleString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <p>Enter a location to view weather data</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Weather;
