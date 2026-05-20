# ACFMart.vn — Nền tảng TMĐT Chống Hàng Giả

> **ACFMart** là nền tảng thương mại điện tử đa người bán, chuyên biệt chống hàng giả, phát triển bởi **Quỹ Chống Hàng Giả Việt Nam (ACF)** và **IVS JSC**.

---

## 🏗️ Tech Stack

| Layer | Công nghệ |
|---|---|
| Frontend | Next.js 14 App Router · TypeScript · Tailwind CSS · shadcn/ui · Framer Motion |
| State | React Query · Zustand |
| Forms | React Hook Form · Zod |
| Charts | Recharts |
| Backend | Node.js · Express · TypeScript |
| Database | PostgreSQL 16 · Prisma ORM |
| Cache/Queue | Redis 7 · Bull |
| Realtime | Socket.io |
| DevOps | Docker · Docker Compose · GitHub Actions |
| Monorepo | Turborepo · npm Workspaces |

---

## 📁 Cấu trúc dự án

```
acfmart/
├── apps/
│   ├── web/                 # Next.js 14 App (Customer, Seller, Admin, Community)
│   └── api/                 # Express REST API
├── packages/
│   ├── database/            # Prisma schema + migrations
│   └── types/               # Shared TypeScript types
├── .github/workflows/       # GitHub Actions CI/CD
├── docker-compose.yml       # Production Docker setup
├── docker-compose.dev.yml   # Development override
└── .env.example             # Environment template
```

### 4 Portals trong một bundle

| Portal | Route | Mô tả |
|---|---|---|
| 🛍️ Customer Marketplace | `/` | Trang mua sắm công khai |
| 📊 Seller Dashboard | `/seller/*` | Quản lý gian hàng |
| 🛡️ Admin Console | `/admin/*` | Quản trị hệ thống |
| 💬 Community | `/community/*` | Cộng đồng Affiliate |

---

## 🚀 Quick Start (Development)

### Yêu cầu
- Node.js ≥ 20.0.0
- npm ≥ 10.0.0
- Docker & Docker Compose

### 1. Clone & cài đặt

```bash
git clone https://github.com/your-org/acfmart.git
cd acfmart
npm install
```

### 2. Cấu hình environment

```bash
cp .env.example .env
# Chỉnh sửa .env với thông tin thực tế
```

### 3. Khởi động database (Docker)

```bash
# Chỉ khởi động Postgres + Redis
docker-compose up postgres redis -d
```

### 4. Chạy migrations & generate Prisma

```bash
cd packages/database
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Khởi động development servers

```bash
# Từ root — chạy tất cả apps song song
npm run dev

# Hoặc chạy riêng lẻ
cd apps/api && npm run dev    # API: http://localhost:3001
cd apps/web && npm run dev    # Web: http://localhost:3000
```

---

## 🐳 Docker Setup (Production)

```bash
# Build và chạy toàn bộ stack
cp .env.example .env
docker-compose up --build -d

# Kiểm tra logs
docker-compose logs -f api
docker-compose logs -f web

# Dừng
docker-compose down

# Dừng và xóa volumes
docker-compose down -v
```

**URLs sau khi chạy:**
- Frontend: http://localhost:3000
- API: http://localhost:3001
- API Health: http://localhost:3001/health

---

## 🔧 Environment Variables

Xem file [`.env.example`](./.env.example) để biết tất cả các biến cần cấu hình.

**Biến quan trọng:**

```bash
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/acfmart

# JWT (THAY ĐỔI TRONG PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-secret

# API & Frontend URLs
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 📡 API Documentation

| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/api/auth/register` | Đăng ký tài khoản |
| POST | `/api/auth/login` | Đăng nhập |
| POST | `/api/auth/refresh` | Làm mới token |
| GET | `/api/auth/me` | Thông tin user hiện tại |
| GET | `/api/products` | Danh sách sản phẩm |
| GET | `/api/products/:id` | Chi tiết sản phẩm |
| POST | `/api/products` | Tạo sản phẩm (Seller) |
| POST | `/api/products/:id/approve` | Duyệt sản phẩm (Admin) |
| POST | `/api/products/:id/reject` | Từ chối sản phẩm (Admin) |
| POST | `/api/orders` | Tạo đơn hàng |
| GET | `/api/orders/my` | Đơn hàng của tôi |
| GET | `/api/qr/verify/:code` | Xác thực QR |
| GET | `/api/community/posts` | Danh sách bài đăng |
| POST | `/api/community/posts/:id/like` | Like bài đăng |
| GET | `/api/community/leaderboard` | Bảng xếp hạng |
| GET | `/api/admin/dashboard` | Dashboard Admin |
| GET | `/api/sellers/dashboard` | Dashboard Seller |

---

## 🗄️ Database Schema

Xem [`packages/database/prisma/schema.prisma`](./packages/database/prisma/schema.prisma)

**Các models chính:**
- `User` — Tài khoản người dùng (Customer, Seller, Admin, Affiliate)
- `Seller` — Thông tin gian hàng
- `Product` — Sản phẩm với workflow duyệt (DRAFT → PENDING → APPROVED/REJECTED)
- `Order` + `OrderItem` — Đơn hàng
- `Affiliate` + `Commission` — Hệ thống hoa hồng
- `CommunityPost` — Bài đăng cộng đồng
- `QRVerification` — Xác thực chống hàng giả

---

## 🔄 CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/ci.yml`):

1. **Lint & TypeCheck** — ESLint + tsc trên cả api và web
2. **Build** — Build TypeScript API + Next.js app, generate Prisma client
3. **Docker** — Build & push images lên Docker Hub (chỉ trên nhánh `main`)

---

## 👥 Contributing

1. Fork repository
2. Tạo feature branch: `git checkout -b feature/ten-tinh-nang`
3. Commit: `git commit -m 'feat: mô tả thay đổi'`
4. Push: `git push origin feature/ten-tinh-nang`
5. Tạo Pull Request

**Commit convention:** `feat | fix | docs | style | refactor | test | chore`

---

## 📞 Liên hệ

- **Website:** [acfmart.vn](https://acfmart.vn)
- **Developer:** [IVS JSC](https://ivsacademy.edu.vn)
- **Email:** dev@acfmart.vn
- **Quỹ ACF:** [acf.vn](https://acf.vn)

---

<p align="center">
  Phát triển bởi <strong>IVS JSC</strong> cho <strong>Quỹ Chống Hàng Giả Việt Nam</strong> 🇻🇳
</p>
