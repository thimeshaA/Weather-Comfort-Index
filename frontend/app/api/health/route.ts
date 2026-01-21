import { NextRequest, NextResponse } from 'next/server';
import config from '@/lib/config/env';

/**
 * GET /api/health
 * Health check endpoint (no authentication required)
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    auth0Configured: config.auth0Domain ? 'YES' : 'NO',
    openWeatherMapConfigured: config.openWeatherApiKey ? 'YES' : 'NO',
  });
}
