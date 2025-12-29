// Type definitions for the Weather Comfort Index application

export interface City {
  CityCode: string;
  CityName: string;
  Temp?: string;
  Status?: string;
}

export interface CitiesData {
  List: City[];
}

export interface WeatherData {
  coord: {
    lon: number;
    lat: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  base: string;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  visibility: number;
  wind: {
    speed: number;
    deg: number;
  };
  clouds: {
    all: number;
  };
  dt: number;
  sys: {
    type: number;
    id: number;
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

export interface ProcessedWeatherData {
  cityId: string;
  cityName: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  description: string;
  cloudiness: number;
  pressure: number;
}

export interface ComfortIndexResult {
  rank: number;
  city: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  description: string;
  comfortScore: number;
}

export interface ComfortIndexResponse {
  generatedAt: string;
  cities: ComfortIndexResult[];
}

export interface CacheStatus {
  status: 'HIT' | 'MISS';
  timestamp: string;
  cachedCityCount: number;
  ttlRemaining: number;
}
