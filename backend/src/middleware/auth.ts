import { auth } from 'express-oauth2-jwt-bearer';
import config from '../config/env';

/**
 * Auth0 JWT validation middleware
 * Validates JWT tokens from Auth0 for protected routes
 * 
 * Setup Requirements:
 * 1. Set AUTH0_DOMAIN in .env (e.g., your-tenant.auth0.com)
 * 2. Set AUTH0_AUDIENCE in .env (your API identifier)
 * 3. Configure Auth0 dashboard:
 *    - Disable public signups
 *    - Add careers@fidenz.com to allowed users
 *    - Enable email-based MFA
 */

// Check if Auth0 is configured
const isAuth0Configured = config.auth0Domain && config.auth0Audience;

let validateAccessToken: any;

if (isAuth0Configured) {
  // Initialize Auth0 middleware
  validateAccessToken = auth({
    audience: config.auth0Audience,
    issuerBaseURL: `https://${config.auth0Domain}`,
    tokenSigningAlg: 'RS256',
  });

  console.log('Auth0 JWT validation middleware initialized');
} else {
  // Mock middleware for development/testing without Auth0
  console.warn('WARNING: Auth0 not configured. Using mock authentication (DO NOT USE IN PRODUCTION)');
  
  validateAccessToken = (req: any, res: any, next: any) => {
    console.warn('Mock authentication - allowing request without validation');
    next();
  };
}

export { validateAccessToken };
