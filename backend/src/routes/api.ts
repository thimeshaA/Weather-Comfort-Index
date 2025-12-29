import { Router, Request, Response } from 'express';
import weatherService from '../services/weatherService';
import comfortIndexService from '../services/comfortIndexService';
import cacheService from '../services/cacheService';
import { ComfortIndexResponse, ComfortIndexResult, CacheStatus } from '../types';
import { validateAccessToken } from '../middleware/auth';

const router = Router();

/**
 * GET /api/comfort-index
 * Returns ranked list of cities by comfort score
 * Requires authentication (JWT)
 */
router.get('/comfort-index', validateAccessToken, async (req: Request, res: Response) => {
  try {
    const CACHE_KEY = 'comfort-index-results';

    // Check cache first
    const cachedResults = cacheService.get<ComfortIndexResponse>(CACHE_KEY);

    if (cachedResults) {
      console.log('Returning cached comfort index results');
      return res.json(cachedResults);
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
    res.json(response);

  } catch (error) {
    console.error('Error in /api/comfort-index:', error);
    res.status(500).json({
      error: 'Failed to calculate comfort index',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/cache-status
 * Debug endpoint showing cache status
 * Requires authentication (JWT)
 */
router.get('/cache-status', validateAccessToken, (req: Request, res: Response) => {
  try {
    const CACHE_KEY = 'comfort-index-results';
    const hasCachedData = cacheService.has(CACHE_KEY);
    const ttlRemaining = cacheService.getTtl(CACHE_KEY);
    const stats = cacheService.getStats();

    let cachedCityCount = 0;
    if (hasCachedData) {
      const cachedData = cacheService.get<ComfortIndexResponse>(CACHE_KEY);
      cachedCityCount = cachedData?.cities?.length || 0;
    }

    const response: CacheStatus = {
      status: hasCachedData ? 'HIT' : 'MISS',
      timestamp: new Date().toISOString(),
      cachedCityCount: cachedCityCount,
      ttlRemaining: ttlRemaining,
    };

    // Add additional stats for debugging
    res.json({
      ...response,
      stats: stats,
    });

  } catch (error) {
    console.error('Error in /api/cache-status:', error);
    res.status(500).json({
      error: 'Failed to get cache status',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
