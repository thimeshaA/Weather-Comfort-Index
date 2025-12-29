<img width="1280" height="792" alt="image" src="https://github.com/user-attachments/assets/f55691c0-5d04-4200-87d6-50cde4162410" />
<img width="1280" height="798" alt="image" src="https://github.com/user-attachments/assets/3a3653f1-5508-4442-8795-3a6d16847ee3" />

# Weather Comfort Index

A web app that ranks cities by weather comfort using real-time data from OpenWeatherMap. Includes Auth0 authentication and a responsive dashboard.

## Features

- Real-time weather data for multiple cities
- Custom comfort score (0-100) based on temperature, humidity, and wind
- Secure authentication with Auth0 MFA
- 5-minute server cache for faster responses
- Responsive design for mobile and desktop

## Tech Stack

**Backend:** Node.js, Express, TypeScript, Auth0, Jest  
**Frontend:** Next.js 16, React, TypeScript, Tailwind CSS

---

## Comfort Index Algorithm

### How It Works

The comfort score combines three weather factors:

```
Comfort Index = (Temperature × 45%) + (Humidity × 30%) + (Wind × 25%)
```

**Score ranges from 0-100:**
- 80-100: Excellent
- 60-79: Good  
- 40-59: Moderate
- 20-39: Poor
- 0-19: Very Poor

### Why These Factors?

**Temperature (45%)** - Most important factor
- Ideal: 22°C (72°F)
- Comfortable range: 18-26°C
- You lose 5 points per degree away from 22°C

**Humidity (30%)** - Affects how temperature feels
- Ideal: 50%
- Comfortable range: 30-70%
- Too low = dry air, too high = sticky

**Wind (25%)** - Provides air circulation
- Ideal: 3 m/s (gentle breeze)
- Too calm = stagnant air, too windy = disruptive

These weights are based on thermal comfort research (ASHRAE standards) showing temperature has the biggest impact on how comfortable people feel.

---

## Setup

### Prerequisites

- Node.js v16+
- npm v7+
- [OpenWeatherMap API Key](https://openweathermap.org/api) (free)
- [Auth0 Account](https://auth0.com/) (free)

### Quick Start

**Backend:**
```bash
cd backend
npm install
cp .env.example .env  # Add your API keys
npm run dev           # Runs on http://localhost:3001
```

**Frontend:**
```bash
cd frontend
npm install
cp .env.example .env.local  # Add your Auth0 credentials
npm run dev                 # Runs on http://localhost:3000
```

**Run Tests:**
```bash
cd backend
npm test
```

### Auth0 Setup

1. Create an Auth0 account at [auth0.com](https://auth0.com)

2. **Create an API:**
   - Go to Applications → APIs → Create API
   - Name: "Weather Comfort Index API"
   - Identifier: `https://weather-comfort-api`

3. **Create an Application:**
   - Go to Applications → Create Application
   - Type: Regular Web Application
   - Copy Client ID and Secret to `.env.local`

4. **Configure Application:**
   - Enable "Password" grant in Advanced Settings
   - Allowed Callback URLs: `http://localhost:3000/api/auth/callback`
   - Allowed Logout URLs: `http://localhost:3000`
   - Allowed Web Origins: `http://localhost:3000`

5. **Set up users:**
   - Go to User Management → Users → Create User
   - Disable public signups in Authentication → Database settings

6. **Enable MFA:**
   - Go to Security → Multi-factor Auth
   - Enable "Email" and set to "Always"

---

## How Caching Works

Uses in-memory caching with 5-minute expiration:
- **Fast:** ~5ms (cached) vs ~2000ms (API call)
- **Saves API calls:** Reduces calls by ~95% (OpenWeatherMap free tier: 60/min)
- **Simple:** No external dependencies like Redis

Cache is lost on server restart. For production with multiple servers, use Redis.

---

## Limitations

**API Constraints:**
- Free tier: 60 calls/min, 1M calls/month
- Weather updates every 10 minutes

**Comfort Index Assumptions:**
- Doesn't account for sunlight, clothing, or activity level
- Uses population averages (no personalization)

**Scalability:**
- In-memory cache doesn't scale across servers
- No background job for pre-fetching data

**Security:**
- No rate limiting (add `express-rate-limit` for production)
- Limited error handling and input validation

---

## API Endpoints

**Backend:**
- `GET /health` - Health check
- `GET /api/comfort-index` - Get ranked cities (requires auth)
- `GET /api/cache-status` - Cache statistics (requires auth)

**Frontend:**
- `/` - Home (redirects to login or dashboard)
- `/login` - Login page
- `/dashboard` - Main dashboard (protected)

---

