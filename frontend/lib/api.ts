/**
 * Backend API Client
 * Handles communication with the Weather Comfort Index backend
 */

import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

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
 * Fetch comfort index data from backend
 * Requires authentication - JWT token must be provided
 */
export async function getComfortIndex(accessToken: string): Promise<ComfortIndexResponse> {
  try {
    const response = await axios.get<ComfortIndexResponse>(
      `${BACKEND_URL}/api/comfort-index`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        timeout: 10000, // 10 second timeout
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('Unauthorized - Please log in again');
      }
      if (error.response?.status === 500) {
        throw new Error('Backend server error - Please try again later');
      }
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Cannot connect to backend - Ensure the server is running');
      }
    }
    throw new Error('Failed to fetch comfort index data');
  }
}

/**
 * Fetch cache status from backend
 * Requires authentication - JWT token must be provided
 */
export async function getCacheStatus(accessToken: string): Promise<CacheStatus> {
  try {
    const response = await axios.get<CacheStatus>(
      `${BACKEND_URL}/api/cache-status`,
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
    const response = await axios.get(`${BACKEND_URL}/health`, { timeout: 3000 });
    return response.data.status === 'OK';
  } catch (error) {
    return false;
  }
}
