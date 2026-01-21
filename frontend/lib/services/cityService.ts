import fs from 'fs';
import path from 'path';
import { CitiesData, City } from '../types/weather';

/**
 * Service to handle city code operations
 * Reads cities.json and provides city data for weather fetching
 */
class CityService {
  private cities: City[] = [];
  private citiesFilePath: string;

  constructor() {
    // In Next.js, public files are served from the public directory
    this.citiesFilePath = path.join(process.cwd(), 'public', 'cities.json');
    this.loadCities();
  }

  /**
   * Load cities from cities.json file
   */
  private loadCities(): void {
    try {
      const fileContent = fs.readFileSync(this.citiesFilePath, 'utf-8');
      const citiesData: CitiesData = JSON.parse(fileContent);
      
      this.cities = citiesData.List;
      
      console.log(`Loaded ${this.cities.length} cities from cities.json`);
      
      // Validate minimum 10 cities requirement
      if (this.cities.length < 10) {
        console.warn(`Warning: Only ${this.cities.length} cities loaded. Requirement is at least 10 cities.`);
      }
    } catch (error) {
      console.error('Error loading cities.json:', error);
      throw new Error('Failed to load city data');
    }
  }

  /**
   * Get all cities
   */
  getCities(): City[] {
    return this.cities;
  }

  /**
   * Get array of city codes for API requests
   */
  getCityCodes(): string[] {
    return this.cities.map(city => city.CityCode);
  }

  /**
   * Get city name by code
   */
  getCityName(cityCode: string): string {
    const city = this.cities.find(c => c.CityCode === cityCode);
    return city?.CityName || 'Unknown';
  }

  /**
   * Get total city count
   */
  getCityCount(): number {
    return this.cities.length;
  }
}

// Export singleton instance
export default new CityService();
