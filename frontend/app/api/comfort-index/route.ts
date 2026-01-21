import { NextRequest, NextResponse } from 'next/server';
import weatherService from '@/lib/services/weatherService';
import comfortIndexService from '@/lib/services/comfortIndexService';
import cacheService from '@/lib/services/cacheService';
import { ComfortIndexResponse, ComfortIndexResult } from '@/lib/types/weather';

/**
 * GET /api/comfort-index
 * Returns ranked list of cities by comfort score
 * Requires authentication (JWT) - handled by middleware or auth check
 */
export async function GET(request: NextRequest) {
  try {
    const CACHE_KEY = 'comfort-index-results';

    // Check cache first
    const cachedResults = cacheService.get<ComfortIndexResponse>(CACHE_KEY);

    if (cachedResults) {
      console.log('Returning cached comfort index results');
      return NextResponse.json(cachedResults);
    }

    // Cache miss - fetch fresh data
    console.log('Fetching fresh weather data...');
    const weatherData = await weatherService.fetchAllCitiesWeather();

    // Calculate comfort index for each city
    const citiesWithComfort: ComfortIndexResult[] = weatherData.map(weather => {
      const comfortScore = comfortIndexService.calculateComfortIndex(weather);
      
      return {
        rank: 0, // Will be assigned after sorting
        city: weather.cityName,
        temperature: weather.temperature,
        humidity: weather.humidity,
        windSpeed: weather.windSpeed,
        description: weather.description,
        comfortScore: comfortScore,
      };
    });

    // Sort by comfort score (descending) and assign ranks
    citiesWithComfort.sort((a, b) => b.comfortScore - a.comfortScore);
    citiesWithComfort.forEach((city, index) => {
      city.rank = index + 1;
    });

    // Prepare response
    const response: ComfortIndexResponse = {
      generatedAt: new Date().toISOString(),
      cities: citiesWithComfort,
    };

    // Cache the results
    cacheService.set(CACHE_KEY, response);

    console.log(`Comfort index calculated for ${citiesWithComfort.length} cities`);
    return NextResponse.json(response);

  } catch (error) {
    console.error('Error in /api/comfort-index:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate comfort index',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
