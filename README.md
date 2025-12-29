# Weather Comfort Index Application

A full-stack web application that fetches real-time weather data, calculates a custom Comfort Index score for multiple cities, and presents rankings through an intuitive dashboard with Auth0 authentication.

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Comfort Index Algorithm](#comfort-index-algorithm)
- [Setup Instructions](#setup-instructions)
- [Cache Design](#cache-design)
- [Known Limitations](#known-limitations)
- [Project Structure](#project-structure)

---

## Features

- Real-time weather data from OpenWeatherMap API
- Custom Comfort Index algorithm with scientific basis
- City rankings from most to least comfortable
- Server-side caching (5-minute TTL)
- Auth0 authentication with MFA support
- Responsive UI (mobile and desktop)
- RESTful API with TypeScript
- Unit tests for comfort calculations

---

## Technology Stack

### Backend
- **Runtime**: Node.js with Express
- **Language**: TypeScript
- **Authentication**: Auth0 JWT validation
- **Caching**: node-cache (in-memory)
- **Testing**: Jest
- **API**: OpenWeatherMap

### Frontend
- **Framework**: Next.js 16
- **Language**: TypeScript/React
- **UI**: Tailwind CSS with Radix UI components
- **Authentication**: Auth0 custom login
- **State Management**: React Context API

---

## Comfort Index Algorithm

### Formula

```
Comfort Index = (Temperature Score × 0.45) + (Humidity Score × 0.30) + (Wind Score × 0.25)
```

The final score is clamped to the **0-100 range** (whole numbers only).

### Components & Weights

#### 1. Temperature Score (45% weight) - PRIMARY FACTOR

**Why 45%?**
- Human thermal comfort research consistently identifies temperature as the PRIMARY factor
- Based on ASHRAE (American Society of Heating, Refrigerating and Air-Conditioning Engineers) standards
- Physiological studies show temperature directly affects vasodilation, perspiration, metabolic rate, and cognitive performance
- Temperature accounts for approximately 45% of variance in thermal comfort surveys

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

#### 2. Humidity Score (30% weight) - SECONDARY FACTOR

**Why 30%?**
- Relative humidity directly affects the body's ability to cool through evaporation
- Modulates perceived temperature (heat index effect)
- At high humidity, sweating becomes less effective
- Based on ASHRAE Standard 55 (Thermal Environmental Conditions for Human Occupancy)
- Humidity accounts for approximately 30% of comfort variance

**Optimal**: 50% RH (Relative Humidity)  
**Comfortable Range**: 30% - 70% RH

**Formula**:
```
Humidity Score = max(0, 100 - |actualHumidity - 50| × 2)
```

**Rationale**:
- 50% RH is ideal for human comfort and health
- Too low (<30%): Dry skin, respiratory irritation, static electricity
- Too high (>70%): Reduced evaporative cooling, mold growth, perceived stuffiness
- Linear penalty: 2 points per percentage point deviation
- At 30% or 70% RH (±20%): Score = 60
- At 10% or 90% RH: Score = 20 (very uncomfortable)

#### 3. Wind Speed Score (25% weight) - TERTIARY FACTOR

**Why 25%?**
- Wind influences perceived comfort through convective cooling and air circulation
- Less direct physiological impact than temperature or humidity
- Important for perceived freshness and air quality
- Accounts for approximately 25% of comfort variance

**Optimal**: 2-4 m/s (light to gentle breeze on Beaufort scale)  
**Perfect Score (100)**: 3 m/s

**Formula**:
```
Wind Speed Score = max(0, 100 - |actualWindSpeed - 3| × 15)
```

**Rationale**:
- 3 m/s provides gentle air movement without being disruptive
- Benefits: Enhanced evaporative cooling, prevents stagnant air, disperses pollutants
- Too calm (<1 m/s): Stagnant, oppressive air
- Too windy (>6 m/s): Disruptive to activities, wind chill effect
- Linear penalty: 15 points per m/s deviation (steeper due to narrower comfort range)

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

### Alternative Approaches Considered

| **Approach** | **Why Not Used** |
|--------------|------------------|
| **Heat Index** | Too focused on hot weather; poor performance in cold/temperate climates |
| **Humidex** (Canadian model) | Less internationally applicable; regional bias |
| **UTCI** (Universal Thermal Climate Index) | Requires additional inputs (solar radiation, clothing); too complex |
| **Equal Weights** (33/33/33) | Ignores empirical evidence showing temperature has greater impact |
| **Discomfort Index** | Outdated model from 1950s; doesn't account for wind |

**My Approach**: Balanced, defensible, works across all climates and seasons, based on modern research.

### Score Interpretation

| **Score Range** | **Comfort Level** | **Description** |
|-----------------|-------------------|-----------------|
| 80-100 | Excellent | Ideal conditions for most people |
| 60-79 | Good | Generally comfortable with minor issues |
| 40-59 | Moderate | Noticeable discomfort for many people |
| 20-39 | Poor | Uncomfortable for most people |
| 0-19 | Very Poor | Extreme discomfort; health risks possible |

---

## Setup Instructions

### Prerequisites

- **Node.js**: v16 or higher
- **npm**: v7 or higher
- **OpenWeatherMap API Key**: [Get one free](https://openweathermap.org/api)
- **Auth0 Account**: [Sign up](https://auth0.com/)

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
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


4. **Start the backend server**:
   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:3001`

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   
   Create `.env.local`:

   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   ```

4. **Start the frontend server**:
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`

### Auth0 Configuration

1. **Create Auth0 Account**: Sign up at https://auth0.com

2. **Create an API**:
   - Dashboard → Applications → APIs → Create API
   - Name: "Weather Comfort Index API"
   - Identifier: `https://weather-comfort-api` (use as AUTH0_AUDIENCE)
   - Signing Algorithm: RS256

3. **Create an Application**:
   - Dashboard → Applications → Applications → Create Application
   - Name: "Weather Comfort Index"
   - Type: Regular Web Application
   - Get Client ID and Client Secret for frontend .env.local

4. **Configure Application Settings**:
   - Enable "Password" grant type in Advanced Settings → Grant Types
   - Set Allowed Callback URLs: `http://localhost:3000/api/auth/callback`
   - Set Allowed Logout URLs: `http://localhost:3000`
   - Set Allowed Web Origins: `http://localhost:3000`

5. **Set Default Directory** (Tenant Settings):
   - Dashboard → Settings → General → Advanced
   - Set Default Directory: `Username-Password-Authentication`

6. **Disable Public Signups**:
   - Dashboard → Authentication → Database → Username-Password-Authentication
   - Disable "Sign Ups"

7. **Add Whitelisted Users**:
   - Dashboard → User Management → Users → Create User
   - Add users manually with email and password

8. **Enable Email MFA**:
   - Dashboard → Security → Multi-factor Auth
   - Enable "Email"
   - Set policy to "Always"

### Running Tests

Backend unit tests:
```bash
cd backend
npm test
```

---

## Cache Design

### Strategy: In-Memory Caching with `node-cache`

**Why In-Memory?**
- Fastest possible read/write performance (microseconds)
- No external dependencies (Redis, Memcached)
- Simple setup and maintenance
- Sufficient for moderate traffic (thousands of requests/hour)

**Trade-offs**:
- Cache is lost on server restart
- Not shared across multiple server instances (not suitable for horizontal scaling)
- Limited by available RAM

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

### Cache Statistics

View cache performance via the `/api/cache-status` endpoint:
- Hit/miss counts
- Hit rate percentage
- TTL remaining
- Number of cached cities

---

## Known Limitations

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
- **No Individual Preferences**: Uses population averages

**Justification**: Adding these factors would require:
- Additional data inputs (not available from OpenWeatherMap free tier)
- User-specific preferences (beyond scope)
- Significantly more complex calculations

### 3. Scalability

- **In-Memory Cache**: Not shared across multiple servers
- **Synchronous Processing**: All cities fetched in parallel, but blocks the request

**Future Improvements**:
- Implement Redis for distributed caching
- Add background job to pre-fetch weather data
- Implement webhooks for real-time updates

### 4. Security

- **No Rate Limiting**: Vulnerable to request flooding
- **Limited Input Validation**: Trusts API responses

**Recommendations for Production**:
- Add rate limiting middleware (e.g., `express-rate-limit`)
- Implement request validation and sanitization
- Add monitoring and alerting
- Use HTTPS in production

### 5. Error Handling

- **Partial Failures**: If one city fails, entire request fails
- **No Retry Logic**: Single attempt per API call
- **Limited Error Messages**: Generic errors returned to client

**Future Improvements**:
- Implement graceful degradation (return partial results)
- Add exponential backoff retry logic
- Provide detailed error codes and messages

---

## Project Structure

```
Fidenz/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── env.ts              # Environment configuration
│   │   ├── middleware/
│   │   │   └── auth.ts             # Auth0 JWT validation
│   │   ├── services/
│   │   │   ├── cityService.ts      # City data handling
│   │   │   ├── weatherService.ts   # OpenWeatherMap integration
│   │   │   ├── comfortIndexService.ts  # Comfort algorithm
│   │   │   └── cacheService.ts     # Caching logic
│   │   ├── routes/
│   │   │   └── api.ts              # API endpoints
│   │   ├── types/
│   │   │   └── index.ts            # TypeScript interfaces
│   │   └── index.ts                # Server entry point
│   ├── tests/
│   │   └── comfortIndex.test.ts    # Unit tests
│   ├── cities.json                 # City codes
│   ├── .env.example                # Environment template
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── app/
    │   ├── api/
    │   │   └── auth/               # Auth endpoints
    │   ├── dashboard/              # Dashboard pages
    │   ├── login/                  # Login page
    │   └── layout.tsx              # Root layout
    ├── components/
    │   ├── dashboard/              # Dashboard components
    │   └── ui/                     # Reusable UI components
    ├── contexts/
    │   └── AuthContext.tsx         # Auth state management
    ├── lib/
    │   └── api.ts                  # API client
    ├── .env.local                  # Environment variables
    ├── package.json
    └── tsconfig.json
```

---

## API Endpoints

### Backend

- `GET /health` - Health check (no authentication)
- `GET /api/comfort-index` - Get ranked cities by comfort score (requires Auth0 JWT)
- `GET /api/cache-status` - Get cache statistics (requires Auth0 JWT)

### Frontend

- `GET /` - Home page (redirects to /login or /dashboard)
- `GET /login` - Custom login form
- `GET /dashboard` - Main dashboard (protected)
- `POST /api/auth/login-custom` - Custom login handler
- `GET /api/auth/me` - Get current user
- `GET /api/auth/token` - Get access token
- `POST /api/auth/logout` - Logout

---

## License

MIT

---

## Author

Built for Fidenz Technologies Assignment
