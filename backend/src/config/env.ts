import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  openWeatherApiKey: string;
  auth0Domain: string;
  auth0Audience: string;
}

const config: Config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  openWeatherApiKey: process.env.OPENWEATHER_API_KEY || '',
  auth0Domain: process.env.AUTH0_DOMAIN || '',
  auth0Audience: process.env.AUTH0_AUDIENCE || '',
};

// Validate required environment variables
if (!config.openWeatherApiKey) {
  console.warn('Warning: OPENWEATHER_API_KEY is not set in environment variables');
}

if (!config.auth0Domain || !config.auth0Audience) {
  console.warn('Warning: Auth0 credentials are not set. Authentication will not work properly.');
}

export default config;
