import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { registerRoutes } from './routes/paymentRoutes';
import { idempotencyMiddleware } from './middleware/idempotency';
import { errorHandler } from './middleware/errorHandler';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Enable CORS
app.use(cors());

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Custom middleware
app.use(idempotencyMiddleware);

// Health check endpoint
app.get('/healthz', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'ACFMart Payment Service',
    version: '1.0.0'
  });
});

// Register routes
registerRoutes(app);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route not found'
  });
});

// Start the server
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`ACFMart Payment Service is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;