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
