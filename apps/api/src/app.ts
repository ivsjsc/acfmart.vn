import express from 'express';
import cors from 'cors';
import type { CorsOptions } from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

import authRoutes from './modules/auth/auth.routes';
import productsRoutes from './modules/products/products.routes';
import ordersRoutes from './modules/orders/orders.routes';
import adminRoutes from './modules/admin/admin.routes';
import communityRoutes from './modules/community/community.routes';
import shippingRoutes from './modules/shipping/shipping.routes';
import sellersRoutes from './modules/sellers/sellers.routes';
import qrRoutes from './modules/qr/qr.routes';
import ivsTrustRoutes from './modules/ivs-trust/ivs-trust.routes';

const app = express();
const corsOrigins = (process.env.CORS_ORIGINS || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// Add default CORS origins if not set via environment
if (corsOrigins.length === 0 || (corsOrigins.length === 1 && corsOrigins[0] === 'http://localhost:3000')) {
  corsOrigins.push(
    'https://acfmart.vn',
    'https://www.acfmart.vn',
    'https://acfmart.store',
    'https://www.acfmart.store',
    'https://acfmart.online',
    'https://www.acfmart.online',
    'https://acfmart.cloud',
    'https://www.acfmart.cloud',
    'https://qr.acfmart.vn',
    'https://api.acfmart.vn'
  );
}

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin || corsOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  credentials: true,
};

// Bảo mật HTTP headers
app.use(helmet());

// CORS — cho phép frontend truy cập
app.use(cors(corsOptions));

// Nén response
app.use(compression());

// Logging request
app.use(morgan('dev'));

// Parse JSON body
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting — chống spam 100 request/phút
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { success: false, message: 'Quá nhiều yêu cầu, vui lòng thử lại sau' },
});
app.use('/api', limiter);

// Health check
app.get(['/health', '/api/health'], (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'ACFMart API' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/store/shipping', shippingRoutes);
app.use('/api/sellers', sellersRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/v1', ivsTrustRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint không tồn tại' });
});

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Lỗi server nội bộ' });
});

export default app;
