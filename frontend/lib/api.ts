/**
 * Backend API Client
 * Handles communication with the Weather Comfort Index API routes
 */

import axios from 'axios';

// In Next.js, we use relative paths to call our own API routes
// This works both in development and production
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '';

export interface ComfortData {
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
  cities: ComfortData[];
}

export interface CacheStatus {
  status: 'HIT' | 'MISS';
  timestamp: string;
  cachedCityCount: number;
  ttlRemaining: number;
  stats?: {
    hits: number;
    misses: number;
    hitRate: string;
    keys: string[];
    keyCount: number;
  };
}

/**
 * Fetch comfort index data from API
 * Requires authentication - JWT token must be provided
 */
export async function getComfortIndex(accessToken: string): Promise<ComfortIndexResponse> {
  try {
    const response = await axios.get<ComfortIndexResponse>(
      `${API_BASE}/api/comfort-index`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        timeout: 30000, // 30 second timeout for weather API calls
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('Unauthorized - Please log in again');
      }
      if (error.response?.status === 500) {
        console.error('API error:', error.response?.data);
        throw new Error('Server error - Please try again later');
      }
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout - Weather API is taking too long');
      }
    }
    console.error('Comfort index fetch error:', error);
    throw new Error('Failed to fetch comfort index data');
  }
}

/**
 * Fetch cache status from API
 * Requires authentication - JWT token must be provided
 */
export async function getCacheStatus(accessToken: string): Promise<CacheStatus> {
  try {
    const response = await axios.get<CacheStatus>(
      `${API_BASE}/api/cache-status`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        timeout: 5000,
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('Unauthorized - Please log in again');
      }
    }
    throw new Error('Failed to fetch cache status');
  }
}

/**
 * Health check - no authentication required
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await axios.get(`${API_BASE}/api/health`, { timeout: 3000 });
    return response.data.status === 'OK';
  } catch (error) {
    return false;
  }
}

