# ACFMart Backend (Medusa v2)

This is the backend for the ACFMart e-commerce platform built with Medusa v2.

## Features Implemented

### 1. Payment Gateway Integration
- **VNPay**: Secure payment processing with HMAC signature
- **Momo**: Mobile payment solution with QR codes and deep links
- **ZaloPay**: Integrated payment solution with QR codes and deep links
- Payment webhook handlers for all providers

### 2. Shipping Provider Integration
- **GHN (Giao Hàng Nhanh)**: Fast delivery services
- **GHTK (Giao Hàng Tiết Kiệm)**: Cost-effective delivery
- **J&T Express**: Reliable shipping provider
- Shipping rate calculation
- Order creation and tracking

### 3. Order Processing Workflow
- Automated workflow connecting payment and shipping
- Order confirmation notifications
- Event-driven architecture

### 4. Frontend Integration
- Compatible with the ACFMart frontend
- Properly handles all payment provider callbacks
- Shipping selection and tracking features

## Prerequisites

- Node.js v18+
- PostgreSQL (for development/testing)
- Redis (for caching and sessions)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (copy `.env.example` to `.env` and update values)

3. Run migrations:
```bash
npm run migrate
```

4. Seed initial data:
```bash
npm run seed
```

5. Start the development server:
```bash
npm run dev
```

## Environment Variables

The application requires several environment variables for payment providers:

### Payment Providers
- `VITE_VNPAY_TMN_CODE` - VNPay merchant code
- `VITE_VNPAY_HASH_SECRET` - VNPay hash secret
- `VITE_MOMO_PARTNER_CODE` - Momo partner code
- `VITE_MOMO_ACCESS_KEY` - Momo access key
- `VITE_MOMO_SECRET_KEY` - Momo secret key
- `VITE_ZALOPAY_APP_ID` - ZaloPay app ID
- `VITE_ZALOPAY_KEY1` - ZaloPay primary key
- `VITE_ZALOPAY_KEY2` - ZaloPay secondary key

### Shipping Providers
- `VITE_GHN_TOKEN` - GHN API token
- `VITE_GHN_SHOP_ID` - GHN shop ID
- `VITE_GHTK_TOKEN` - GHTK API token
- `VITE_JNT_API_KEY` - J&T API key
- `VITE_JNT_SECRET` - J&T secret

## Running with Docker

To run the entire stack with PostgreSQL and Redis:

```bash
docker-compose up
```

## API Endpoints

### Payment Endpoints
- `POST /store/payment/vnpay/sign` - Sign VNPay parameters
- `POST /store/payment/momo/init` - Initialize Momo payment
- `POST /store/payment/zalopay/init` - Initialize ZaloPay payment
- `POST /store/payment/webhooks` - Handle payment confirmations

### Shipping Endpoints
The shipping module is integrated into the Medusa order flow and automatically calculates rates during checkout.

## Architecture

The backend follows Medusa v2 architecture patterns:
- Modules for extending core functionality
- Workflows for complex business processes
- Subscribers for event handling
- API routes for custom endpoints

## Development

For development, run:
```bash
npm run dev
```

This will start the server in watch mode.

## Deployment

The application is designed to be deployed to cloud platforms like AWS, GCP, or Azure. Ensure all environment variables are properly configured for your target environment.
# acfmart-backend

Medusa 2.x commerce backend cho [acfmart](../../README.md) – sàn TMĐT chống hàng giả.

## Yêu cầu

- **Node.js** ≥ 20
- **Docker Desktop** (cho Postgres + Redis)
- **Yarn** hoặc **npm**

## Setup lần đầu

### 1. Khởi động Postgres + Redis qua Docker

Từ thư mục **gốc repo** (`acfmart/`):

```bash
docker compose up -d
```

Kiểm tra:
```bash
docker compose ps
# Phải thấy acfmart-postgres và acfmart-redis ở trạng thái "healthy"
```

Adminer (UI xem DB): http://localhost:8080
- System: PostgreSQL
- Server: postgres
- User/Password: medusa / medusa
- Database: acfmart

### 2. Cấu hình env

```bash
cd apps/backend
cp .env.template .env
# Mở .env, kiểm tra lại các biến (nhất là JWT_SECRET, COOKIE_SECRET)
```

### 3. Cài deps

```bash
npm install
# hoặc nếu repo dùng yarn workspaces: yarn install (từ root)
```

### 4. Migrate DB + seed data

```bash
npm run db:setup       # tạo database + chạy migration
npm run seed           # seed regions VN, categories, sản phẩm mẫu
```

Output cuối seed sẽ in ra **Publishable API key** và **Region ID** — copy vào `src-acfmart/.env.local`:
```env
VITE_MEDUSA_BACKEND_URL=http://localhost:9000
VITE_MEDUSA_PUBLISHABLE_KEY=pk_xxx        # ← từ seed output
VITE_MEDUSA_REGION_ID=reg_xxx             # ← từ seed output
```

### 5. Tạo user admin

```bash
npm run user
# Default: admin@acfmart.vn / supersecret  (đổi trong package.json nếu cần)
```

### 6. Chạy dev server

```bash
npm run dev
```

- Backend API: http://localhost:9000
- Admin UI: http://localhost:9000/app
- Storefront (chạy riêng): `cd ../../src-acfmart && npm run dev` → http://localhost:3000

## Cấu trúc

```
apps/backend/
├── medusa-config.ts        # Cấu hình Medusa (modules, providers, CORS)
├── src/
│   ├── api/                # Custom REST routes (sẽ thêm: /store/qr-verify, /store/affiliate)
│   ├── modules/            # Custom modules (sẽ thêm: qr-verification, affiliate)
│   ├── scripts/
│   │   └── seed.ts         # Seed data Vietnam
│   ├── subscribers/        # Event listeners
│   ├── workflows/          # Custom workflows
│   └── jobs/               # Scheduled jobs
├── .env.template
└── package.json
```

## Sẽ bổ sung trong Phase 3

- [ ] Module `qr-verification` (chống hàng giả)
- [ ] Module `affiliate` (link tracking, commission)
- [ ] Module `live-commerce` (live streams, viewer count)
- [ ] Payment provider plugin VNPay / Momo / ZaloPay
- [ ] Fulfillment provider plugin GHN / GHTK / J&T
- [ ] Notification provider Zalo OA + SMS

## Lệnh hay dùng

| Lệnh | Mô tả |
|---|---|
| `npm run dev` | Dev server có hot-reload |
| `npm run build` | Build production |
| `npm run start` | Run production build |
| `npm run db:migrate` | Chạy migration mới |
| `npm run db:reset` | Reset DB (⚠️ xoá data) |
| `npm run seed` | Seed lại data mẫu |
| `npm run user` | Tạo admin user |
| `docker compose down` | Stop Postgres + Redis |
| `docker compose down -v` | Stop + xoá data |
