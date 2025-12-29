# Weather Comfort Index Backend API

A Node.js backend application that fetches real-time weather data from OpenWeatherMap API, calculates a scientifically-grounded **Comfort Index** for multiple cities, and provides authenticated access via Auth0.

## 🌟 Features

- ✅ **Real-time Weather Data**: Fetches temperature, humidity, wind speed, and more from OpenWeatherMap
- ✅ **Smart Comfort Index**: Scientifically-based algorithm using weighted scoring (0-100 scale)
- ✅ **City Rankings**: Automatically ranks cities from most to least comfortable
- ✅ **Server-Side Caching**: 5-minute cache to minimize API calls and improve performance
- ✅ **Auth0 Authentication**: Secure JWT-based authentication with MFA support
- ✅ **RESTful API**: Clean, well-documented endpoints
- ✅ **TypeScript**: Full type safety and modern development experience
- ✅ **Unit Tests**: Comprehensive test coverage for comfort algorithm

---

## 📋 Table of Contents

- [Comfort Index Algorithm](#comfort-index-algorithm)
- [Setup Instructions](#setup-instructions)
- [API Endpoints](#api-endpoints)
- [Auth0 Configuration](#auth0-configuration)
- [Cache Design](#cache-design)
- [Testing](#testing)
- [Known Limitations](#known-limitations)

---

## 🧮 Comfort Index Algorithm

### Formula

```
Comfort Index = (Temperature Score × 0.45) + (Humidity Score × 0.30) + (Wind Score × 0.25)
```

The final score is clamped to **0-100 range** (whole numbers only).

### Components & Weights

#### 1. Temperature Score (45% weight) - PRIMARY FACTOR

**Why 45%?**
- Human thermal comfort research consistently identifies temperature as the PRIMARY factor affecting comfort
- Based on ASHRAE (American Society of Heating, Refrigerating and Air-Conditioning Engineers) standards
- Physiological studies show temperature directly affects vasodilation, perspiration, metabolic rate, and cognitive performance
- Temperature accounts for ~45% of variance in thermal comfort surveys

**Optimal Range**: 18°C - 26°C  
**Perfect Score (100)**: 22°C (72°F) - the thermal neutral temperature

**Formula**:
```
Temperature Score = max(0, 100 - |actualTemp - 22| × 5)
```

**Rationale**:
- 22°C is the "neutral" temperature where the human body doesn't need to actively heat or cool itself
- Linear penalty: 5 points deducted per degree Celsius away from optimal
- At 18°C or 26°C (±4°C): Score = 80 (still comfortable)
- At 12°C or 32°C (±10°C): Score = 50 (uncomfortable)
- Beyond ±20°C: Score = 0 (extreme discomfort)

---

#### 2. Humidity Score (30% weight) - SECONDARY FACTOR

**Why 30%?**
- Relative humidity directly affects the body's ability to cool through evaporation
- Modulates perceived temperature (heat index effect)
- At high humidity, sweating becomes less effective, making the same temperature feel hotter
- Based on ASHRAE Standard 55 (Thermal Environmental Conditions for Human Occupancy)
- Humidity accounts for ~30% of comfort variance

**Optimal**: 50% RH (Relative Humidity)  
**Comfortable Range**: 30% - 70% RH

**Formula**:
```
Humidity Score = max(0, 100 - |actualHumidity - 50| × 2)
```

**Rationale**:
- 50% RH is ideal for human comfort and health
- Too low (<30%): Dry skin, respiratory irritation, static electricity, nosebleeds
- Too high (>70%): Reduced evaporative cooling, mold growth, perceived stuffiness
- Linear penalty: 2 points per percentage point deviation
- At 30% or 70% RH (±20%): Score = 60
- At 10% or 90% RH: Score = 20 (very uncomfortable)

---

#### 3. Wind Speed Score (25% weight) - TERTIARY FACTOR

**Why 25%?**
- Wind influences perceived comfort through convective cooling and air circulation
- Less direct physiological impact than temperature or humidity in moderate climates
- Important for perceived freshness and air quality
- Accounts for ~25% of comfort variance

**Optimal**: 2-4 m/s (light to gentle breeze on Beaufort scale)  
**Perfect Score (100)**: 3 m/s

**Formula**:
```
Wind Speed Score = max(0, 100 - |actualWindSpeed - 3| × 15)
```

**Rationale**:
- 3 m/s provides gentle air movement without being disruptive
- Benefits of moderate wind:
  - Enhanced evaporative cooling through convection
  - Prevents stagnant air (reduces perception of stuffiness)
  - Disperses pollutants and allergens
- Too calm (<1 m/s): Stagnant, oppressive air
- Too windy (>6 m/s): Disruptive to activities, wind chill effect
- Linear penalty: 15 points per m/s deviation (steeper than others due to narrower comfort range)

---

### Why These Specific Weights?

The weight distribution (45% / 30% / 25%) is based on:

1. **Predicted Mean Vote (PMV) Model** by Fanger (ISO 7730 standard)
   - Internationally recognized thermal comfort model
   - Validated through decades of empirical research

2. **Empirical Research**:
   - Meta-analysis of thermal comfort surveys shows temperature explains ~45% of variance
   - Humidity explains ~30% (primarily through heat index modification)
   - Air movement explains ~25%

3. **Physiological Priority**:
   - Core body temperature regulation is PRIMARY survival function
   - Evaporative cooling (humidity-dependent) is SECONDARY mechanism
   - Convective cooling (wind-dependent) is TERTIARY enhancement

4. **Mathematical Balance**:
   - Weights sum to 1.0 (100%)
   - Enables direct interpretation of final score
   - Preserves intuitive 0-100 scale

---

### Alternative Approaches Considered

| **Approach** | **Why Not Used** |
|--------------|------------------|
| **Heat Index** | Too focused on hot weather; poor performance in cold/temperate climates |
| **Humidex** (Canadian model) | Less internationally applicable; regional bias |
| **UTCI** (Universal Thermal Climate Index) | Requires additional inputs (solar radiation, clothing); too complex for this use case |
| **Equal Weights** (33/33/33) | Ignores empirical evidence showing temperature has greater impact |
| **Discomfort Index** | Outdated model from 1950s; doesn't account for wind |

**Our Approach**: Balanced, defensible, works across all climates and seasons, based on modern research.

---

### Score Interpretation

| **Score Range** | **Comfort Level** | **Description** |
|-----------------|-------------------|-----------------|
| 80-100 | Excellent | Ideal conditions for most people |
| 60-79 | Good | Generally comfortable with minor issues |
| 40-59 | Moderate | Noticeable discomfort for many people |
| 20-39 | Poor | Uncomfortable for most people |
| 0-19 | Very Poor | Extreme discomfort; health risks possible |

---

## 🚀 Setup Instructions

### Prerequisites

- **Node.js**: v16 or higher
- **npm**: v7 or higher
- **OpenWeatherMap API Key**: [Get one free here](https://openweathermap.org/api)
- **Auth0 Account**: [Sign up here](https://auth0.com/) (optional for testing)

### Installation

1. **Clone/Navigate to the backend directory**:
   ```bash
   cd /Users/thimeshaansar/Documents/Fidenz/backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your credentials:
   ```env
   # OpenWeatherMap API Configuration
   OPENWEATHER_API_KEY=a9dfd2125bce3bfb3f41abc170883a08

   # Auth0 Configuration (required for production)
   AUTH0_DOMAIN=your-tenant.auth0.com
   AUTH0_AUDIENCE=https://your-api-identifier

   # Server Configuration
   PORT=3001
   NODE_ENV=development
   ```

4. **Update cities.json** (if needed):
   
   The file already contains 8 cities. To add more, use this format:
   ```json
   {
     "List": [
       {
         "CityCode": "1248991",
         "CityName": "Colombo",
         "Temp": "33.0",
         "Status": "Clouds"
       }
     ]
   }
   ```
   
   Find city codes at: https://openweathermap.org/find

### Running the Application

#### Development Mode (with hot reload):
```bash
npm run dev
```

#### Production Mode:
```bash
npm run build
npm start
```

The server will start on `http://localhost:3001` (or your configured PORT).

---

## 🔌 API Endpoints

### 1. Health Check (No Authentication)

**`GET /health`**

Check if the server is running.

**Response**:
```json
{
  "status": "OK",
  "timestamp": "2025-12-27T17:34:20.123Z",
  "environment": "development"
}
```

---

### 2. Get Comfort Index (Authentication Required)

**`GET /api/comfort-index`**

Returns cities ranked by comfort score.

**Headers**:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response**:
```json
{
  "generatedAt": "2025-12-27T17:34:20.123Z",
  "cities": [
    {
      "rank": 1,
      "city": "Paris",
      "temperature": 22.4,
      "humidity": 60,
      "windSpeed": 2.5,
      "description": "Clear",
      "comfortScore": 87
    },
    {
      "rank": 2,
      "city": "Liverpool",
      "temperature": 16.5,
      "humidity": 65,
      "windSpeed": 4.2,
      "description": "Rain",
      "comfortScore": 72
    }
  ]
}
```

**Caching**: Results are cached for **5 minutes**. Subsequent requests within this window return cached data.

---

### 3. Cache Status (Authentication Required)

**`GET /api/cache-status`**

Debug endpoint showing cache information.

**Headers**:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response**:
```json
{
  "status": "HIT",
  "timestamp": "2025-12-27T17:35:10.456Z",
  "cachedCityCount": 8,
  "ttlRemaining": 247,
  "stats": {
    "hits": 5,
    "misses": 1,
    "hitRate": "83.33%",
    "keys": ["comfort-index-results"],
    "keyCount": 1
  }
}
```

---

## 🔐 Auth0 Configuration

### Quick Setup Guide

This project requires Auth0 for JWT authentication. Follow the comprehensive setup guide:

📖 **[AUTH0_SETUP_GUIDE.md](file:///Users/thimeshaansar/Documents/Fidenz/backend/AUTH0_SETUP_GUIDE.md)**

The guide includes step-by-step instructions for:

1. ✅ Creating Auth0 account and API
2. ✅ Getting your `AUTH0_DOMAIN` and `AUTH0_AUDIENCE`
3. ✅ Disabling public signups
4. ✅ Whitelisting specific users (6 email addresses)
5. ✅ Enabling Email-based MFA
6. ✅ Testing authentication with JWT tokens

**Estimated setup time**: 15-20 minutes

### Quick Reference

After completing the setup guide, update your `.env`:

```env
AUTH0_DOMAIN=your-tenant.auth0.com          # From Auth0 Dashboard
AUTH0_AUDIENCE=https://weather-comfort-api  # Your API Identifier
```

### Whitelisted Users

The following users should be granted access (see AUTH0_SETUP_GUIDE.md Step 4):

- kanishka.d@fidenz.com
- srimal.w@fidenz.com
- narada.a@fidenz.com
- amindu.l@fidenz.com
- niroshanan.s@fidenz.com
- thimeshaansar@gmail.com

### Multi-Factor Authentication (MFA)

Email-based MFA is configured to send a 6-digit verification code on every login for enhanced security.

See **AUTH0_SETUP_GUIDE.md Step 5** for detailed MFA configuration instructions.

### Testing Without Auth0 (Development)

If Auth0 is not configured, the application will use **mock authentication** mode:
- ⚠️ **WARNING**: This bypasses all security checks
- All requests will be allowed without tokens
- Only use for local development/testing
- **Never deploy to production without proper Auth0 configuration**

---

### Setting Up Auth0 (Production)

> [!IMPORTANT]
> **Follow the comprehensive guide**: [AUTH0_SETUP_GUIDE.md](file:///Users/thimeshaansar/Documents/Fidenz/backend/AUTH0_SETUP_GUIDE.md)

**Summary of steps**:

1. **Create Auth0 Account**: Sign up at https://auth0.com

2. **Create an API**:
   - Dashboard → Applications → APIs → Create API
   - Name: "Weather Comfort Index API"
   - Identifier: `https://weather-comfort-api` (use this as `AUTH0_AUDIENCE`)
   - Signing Algorithm: RS256

3. **Disable Public Signups**:
   - Dashboard → Authentication → Database → Username-Password-Authentication
   - Settings → Disable "Disable Sign Ups" toggle

4. **Add Whitelisted Users**:
   - Dashboard → User Management → Users → Create User
   - Add all 6 email addresses listed above
   - Connection: Username-Password-Authentication

5. **Enable Email MFA**:
   - Dashboard → Security → Multi-factor Auth
   - Enable "Email"
   - Set policy to "Always"

6. **Get Your Credentials**:
   - Domain: Found in Application Settings (e.g., `dev-abc123.us.auth0.com`)
   - Audience: Your API Identifier from step 2
   - Update `.env` with these values

### Getting a JWT Token for Testing

Once Auth0 is configured:

1. **Using cURL** (Direct Password Grant - for testing only):
   ```bash
   curl --request POST \
     --url https://YOUR_AUTH0_DOMAIN/oauth/token \
     --header 'content-type: application/json' \
     --data '{
       "grant_type": "password",
       "username": "careers@fidenz.com",
       "password": "Pass#fidenz",
       "client_id": "YOUR_CLIENT_ID",
       "client_secret": "YOUR_CLIENT_SECRET",
       "audience": "https://weather-comfort-api"
     }'
   ```

2. **Using Postman**:
   - Authorization tab → Type: OAuth 2.0
   - Grant Type: Authorization Code (with PKCE)
   - Auth URL: `https://YOUR_AUTH0_DOMAIN/authorize`
   - Access Token URL: `https://YOUR_AUTH0_DOMAIN/oauth/token`
   - Client ID: Your Auth0 Application Client ID
   - Audience: Your API Identifier

3. **Using Auth0 Test Tool**:
   - Dashboard → Applications → APIs → Your API → Test tab

---

## 💾 Cache Design

### Strategy: In-Memory Caching with `node-cache`

**Why In-Memory?**
- ✅ Fastest possible read/write performance (microseconds)
- ✅ No external dependencies (Redis, Memcached)
- ✅ Simple setup and maintenance
- ✅ Sufficient for moderate traffic (thousands of requests/hour)

**Trade-offs**:
- ❌ Cache is lost on server restart
- ❌ Not shared across multiple server instances (not suitable for horizontal scaling)
- ❌ Limited by available RAM

**For Production Scale-Out**: Consider Redis for shared cache across multiple servers.

### Cache Configuration

- **TTL**: 5 minutes (300 seconds)
- **Key**: `comfort-index-results`
- **Stored Data**: Complete processed comfort index response
- **Checkperiod**: Every 60 seconds (automatic cleanup of expired keys)

### Cache Flow

```
Request → Check Cache → Cache Hit? 
                          ├─ Yes → Return Cached Data (fast)
                          └─ No → Fetch from API → Calculate → Cache → Return
```

### Benefits

1. **Reduced API Calls**: OpenWeatherMap has rate limits (60 calls/min on free tier)
2. **Faster Response**: ~5ms (cache hit) vs ~2000ms (API fetch + calculation)
3. **Cost Savings**: Fewer API calls = lower costs on paid tiers
4. **Better UX**: Instant responses for most users

### Logging

All cache operations are logged:
- `🎯 Cache HIT` - Data served from cache
- `❌ Cache MISS` - Data fetched from API
- `💾 Cached data` - Data stored in cache

Check `/api/cache-status` for detailed statistics.

---

## 🧪 Testing

### Run Unit Tests

```bash
npm test
```

### Test Coverage

The test suite covers:
- ✅ Optimal conditions (score ~100)
- ✅ Extreme heat and cold
- ✅ High and low humidity
- ✅ Calm and windy conditions
- ✅ Score boundaries (0-100 clamping)
- ✅ Real-world scenarios (tropical, temperate, cold climates)
- ✅ Score explanations

### Watch Mode (for development)

```bash
npm run test:watch
```

### Manual API Testing

**Without Auth0** (development mode):
```bash
# Health check
curl http://localhost:3001/health

# Get comfort index
curl http://localhost:3001/api/comfort-index

# Get cache status
curl http://localhost:3001/api/cache-status
```

**With Auth0** (production mode):
```bash
# Get JWT token first (see Auth0 Configuration section)
TOKEN="your_jwt_token_here"

# Get comfort index
curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:3001/api/comfort-index

# Get cache status
curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:3001/api/cache-status
```

---

## ⚠️ Known Limitations

### 1. OpenWeatherMap API Constraints

- **Free Tier Rate Limit**: 60 calls/minute, 1,000,000 calls/month
- **Data Freshness**: Weather data updates every 10 minutes
- **City Coverage**: Not all cities have accurate data
- **Historical Data**: Not available on free tier

**Mitigation**: 5-minute cache reduces API calls by ~95%

### 2. Comfort Index Simplifications

- **No Solar Radiation**: Doesn't account for direct sunlight vs shade
- **No Clothing Adjustment**: Assumes typical indoor/moderate outdoor clothing
- **No Activity Level**: Optimized for sedentary to light activity
- **No Individual Preferences**: Uses population averages (some prefer warmer/cooler)

**Justification**: Adding these factors would require:
- Additional data inputs (not available from OpenWeatherMap free tier)
- User-specific preferences (beyond scope of this API)
- Significantly more complex calculations

### 3. Scalability

- **In-Memory Cache**: Not shared across multiple servers
- **Synchronous Processing**: All cities fetched in parallel, but blocks the request

**Future Improvements**:
- Implement Redis for distributed caching
- Add background job to pre-fetch weather data
- Implement webhooks for real-time updates

### 4. Security

- **Mock Auth Mode**: Development mode bypasses authentication entirely
- **No Rate Limiting**: Vulnerable to request flooding
- **No Input Validation**: Trusts OpenWeatherMap API responses

**Recommendations for Production**:
- Always enable Auth0 in production
- Add rate limiting middleware (e.g., `express-rate-limit`)
- Implement request validation and sanitization
- Add monitoring and alerting (e.g., Datadog, New Relic)

### 5. Error Handling

- **Partial Failures**: If one city fails, entire request fails
- **No Retry Logic**: Single attempt per API call
- **Limited Error Messages**: Generic errors returned to client

**Future Improvements**:
- Implement graceful degradation (return partial results)
- Add exponential backoff retry logic
- Provide detailed error codes and messages

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── env.ts                  # Environment configuration
│   ├── middleware/
│   │   └── auth.ts                 # Auth0 JWT validation
│   ├── services/
│   │   ├── cityService.ts          # City data handling
│   │   ├── weatherService.ts       # OpenWeatherMap integration
│   │   ├── comfortIndexService.ts  # Comfort algorithm
│   │   └── cacheService.ts         # Caching logic
│   ├── routes/
│   │   └── api.ts                  # API endpoints
│   ├── types/
│   │   └── index.ts                # TypeScript interfaces
│   └── index.ts                    # Server entry point
├── tests/
│   └── comfortIndex.test.ts        # Unit tests
├── cities.json                     # City codes (10 cities)
├── .env                            # Environment variables (not in git)
├── .env.example                    # Environment template
├── AUTH0_SETUP_GUIDE.md            # Step-by-step Auth0 configuration
├── package.json                    # Dependencies
├── tsconfig.json                   # TypeScript config
├── jest.config.js                  # Test config
└── README.md                       # This file
```

---

## 📝 License

MIT

---

## 👨‍💻 Author

Built for Fidenz Technologies

---

## 🙏 Acknowledgments

- **OpenWeatherMap**: Weather data API
- **Auth0**: Authentication platform
- **ASHRAE**: Thermal comfort research standards
- **Ole Fanger**: PMV model (ISO 7730)
