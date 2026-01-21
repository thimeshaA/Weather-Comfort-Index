import { NextRequest, NextResponse } from 'next/server';
import cacheService from '@/lib/services/cacheService';
import { ComfortIndexResponse, CacheStatus } from '@/lib/types/weather';

/**
 * GET /api/cache-status
 * Debug endpoint showing cache status
 * Requires authentication (JWT) - handled by middleware or auth check
 */
export async function GET(request: NextRequest) {
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
    return NextResponse.json({
      ...response,
      stats: stats,
    });

  } catch (error) {
    console.error('Error in /api/cache-status:', error);
    return NextResponse.json(
      {
        error: 'Failed to get cache status',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
