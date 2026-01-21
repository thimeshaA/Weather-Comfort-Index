import axios from 'axios';
import config from '../config/env';
import { WeatherData, ProcessedWeatherData } from '../types/weather';
import cityService from './cityService';

/**
 * Service to fetch weather data from OpenWeatherMap API
 * API Documentation: https://openweathermap.org/current
 */
class WeatherService {
  private readonly BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';
  private readonly API_KEY = config.openWeatherApiKey;

  /**
   * Fetch weather data for a single city
   */
  async fetchCityWeather(cityId: string): Promise<ProcessedWeatherData> {
    try {
      const response = await axios.get<WeatherData>(this.BASE_URL, {
        params: {
          id: cityId,
          appid: this.API_KEY,
          units: 'metric', // Get temperature in Celsius
        },
        timeout: 10000, // 10 second timeout
      });

      const data = response.data;

      // Extract and process weather data
      const processed: ProcessedWeatherData = {
        cityId: cityId,
        cityName: data.name || cityService.getCityName(cityId),
        temperature: Math.round(data.main.temp * 10) / 10, // Round to 1 decimal
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed * 10) / 10, // Round to 1 decimal
        description: data.weather[0]?.description || 'Unknown',
        cloudiness: data.clouds?.all || 0,
        pressure: data.main.pressure,
      };

      return processed;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(`Error fetching weather for city ${cityId}:`, error.message);
        if (error.response?.status === 401) {
          throw new Error('Invalid OpenWeatherMap API key');
        }
        if (error.response?.status === 404) {
          throw new Error(`City with ID ${cityId} not found`);
        }
      }
      throw new Error(`Failed to fetch weather data for city ${cityId}`);
    }
  }

  /**
   * Fetch weather data for all cities
   */
  async fetchAllCitiesWeather(): Promise<ProcessedWeatherData[]> {
    const cityCodes = cityService.getCityCodes();
    
    console.log(`Fetching weather data for ${cityCodes.length} cities...`);

    // Fetch all cities in parallel
    const weatherPromises = cityCodes.map(cityId => 
      this.fetchCityWeather(cityId)
    );

    try {
      const results = await Promise.all(weatherPromises);
      console.log(`Successfully fetched weather data for ${results.length} cities`);
      return results;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw error;
    }
  }
}

// Export singleton instance
export default new WeatherService();
