import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import config from './config/env';
import apiRoutes from './routes/api';

// Initialize Express app
const app = express();

// Middleware
app.use(cors()); // Enable CORS for all origins
app.use(express.json()); // Parse JSON request bodies

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint (no authentication required)
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// API routes (with authentication)
app.use('/api', apiRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ 
    error: 'Not Found',
    path: req.path,
  });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: config.nodeEnv === 'development' ? err.message : 'An error occurred',
  });
});

// Start server
const PORT = config.port;

app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('Weather Comfort Index Backend Server');
  console.log('='.repeat(60));
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`Auth0 configured: ${config.auth0Domain ? 'YES' : 'NO'}`);
  console.log(`OpenWeatherMap API: ${config.openWeatherApiKey ? 'CONFIGURED' : 'MISSING'}`);
  console.log('='.repeat(60) + '\n');
  console.log('Available endpoints:');
  console.log(`  GET  /health                  - Health check (no auth)`);
  console.log(`  GET  /api/comfort-index       - Get comfort index rankings (auth required)`);
  console.log(`  GET  /api/cache-status        - Get cache status (auth required)`);
  console.log('\n' + '='.repeat(60) + '\n');
});

export default app;
