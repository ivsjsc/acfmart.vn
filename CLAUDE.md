# ACFMart

Sàn thương mại điện tử chống hàng giả của Quỹ Chống Hàng Giả Việt Nam (ACF). Vite + React + Firebase. Deploy lên Firebase Hosting (4 domain dùng chung 1 bundle, route theo hostname).

App live nằm trong `src/`. Một số dịch vụ tách riêng: `functions/` (Firebase Functions, Zalo OAuth) và `acfmart-payment-service/` (microservice escrow Node/Express, deploy qua k8s, ngoài scope Firebase).

## 1. Cấu trúc

```
/src/                         App chính (Vite + React 18 + TS)
├── App.tsx                   Root: providers + DomainRedirect + RouterProvider
├── main.tsx                  Vite entry
├── routes.tsx                React Router v6 routes (3 portals)
├── types.ts                  Domain types dùng chung
├── layouts/
│   ├── MainLayout.tsx        Storefront shell (Header + content + Footer + BottomNav)
│   ├── Header.tsx, Footer.tsx, BottomNav.tsx
├── components/               Component dùng chung (ProductCard, Banner, BannerSlider, Logo,
│                             MarkdownDisplay, DomainRedirect)
├── features/                 Feature folders, mỗi feature self-contained
│   ├── home, product, category, cart, checkout, order, account
│   ├── auth                  Login/Signup/ForgotPassword (email/phone/Google/FB/Zalo)
│   ├── seller                Seller portal (10 screen: dashboard, products, orders, chat,
│   │                         marketing, analytics, finance, shop, settings)
│   ├── admin                 Admin portal (vendor/product/user moderation, banners, audit-logs)
│   ├── qr-verify             Quét QR xác thực chống hàng giả
│   ├── live                  Livestream commerce
│   ├── wishlist, compare, affiliate, social
│   ├── aivy                  AI assistant (Gemini, persona Vietnamese)
│   ├── help, contact, notifications, search, shop, shop-certification
├── hooks/                    Custom hooks: use-auth, use-products, use-vendor, use-moderation,
│                             use-notifications, use-loyalty, use-affiliate, use-chat-realtime,
│                             use-live-stream, use-qr-verify
├── stores/                   Zustand: auth-store, cart-store, wishlist-store
├── lib/                      Service layer + utils (xem mục 3)
├── design-system/            Design tokens (chưa sử dụng nhiều, ưu tiên Tailwind utility)
└── assets/                   Logo, hình ảnh

/functions/                   Firebase Functions v2 (TypeScript, Node 20)
                              Hiện chỉ có Zalo OAuth callback (functions/src/index.ts)

/acfmart-payment-service/     Microservice escrow độc lập (Express + PostgreSQL + Redis,
                              Dockerfile + k8s + Prometheus alerts). KHÔNG deploy qua Firebase

/docs/                        Tài liệu dự án (PROJECT_PLAN.md)
/firebase.json, /.firebaserc  Firebase config
/firestore.rules, /storage.rules, /firestore.indexes.json
/docker-compose.yml           PostgreSQL + Redis cho local dev (chủ yếu cho payment-service)
```

## 2. Build & lệnh thường dùng

Mọi lệnh app chạy **trong `src/`** (không phải root). Functions chạy trong `functions/`.

```bash
# Storefront app
cd src
npm install
npm run dev          # Vite dev server (port 3000, mở browser)
npm run build        # tsc && vite build → src/dist/
npm run preview      # serve src/dist/
npm run lint
npm test             # vitest (chưa có test thật)

# Firebase Functions
cd functions
npm install
npm run build        # tsc → functions/lib/
npm run serve        # build + firebase emulators:start
npm run deploy       # firebase deploy --only functions

# Local infra (cho payment-service)
docker-compose up -d # PostgreSQL 5432, Redis 6379, Adminer 8080
```

CI: [`.github/workflows/firebase-hosting-merge.yml`](.github/workflows/firebase-hosting-merge.yml) trigger trên push `main` — build `src/`, validate Firestore rules bằng emulator local, deploy rules/indexes nếu secret `FIREBASE_RULES_SERVICE_ACCOUNT_ECOMMERCE_ACF` đã cấu hình, rồi deploy lên 4 hosting targets (`acfmart`, `acfmart-store`, `acfmart-cloud`, `acfmart-online`). KHÔNG động `functions/`, KHÔNG động `acfmart-payment-service/`.

## 3. Service layer (`src/lib/`)

Toàn bộ I/O đi qua service trong `lib/`, không gọi Firestore/API trực tiếp từ component.

| File | Vai trò |
|---|---|
| `firebase.ts` | Init Firebase app, export `auth`, `db`, `storage`, `functions` |
| `auth-service.ts` | Email/phone/password, Google, Facebook, Zalo OAuth |
| `zalo-auth.ts` | Helper gọi Cloud Function Zalo callback |
| `product-service.ts` | CRUD product Firestore + workflow draft→pending→approved/rejected |
| `vendor-service.ts` | Onboard seller, KYC, verification |
| `user-management-service.ts` | Admin: list/role/suspend user |
| `banner-service.ts` | Banner CRUD (admin) |
| `payment-service.ts`, `payment-api-service.ts`, `payment/` | VNPay, Momo, ZaloPay, wallet, COD |
| `shipping-service.ts`, `shipping-api-service.ts`, `shipping/` | GHN, GHTK rate + tracking |
| `order-processing-service.ts` | Order lifecycle |
| `firestore-chat.ts` | Realtime messaging buyer ↔ seller |
| `firestore-livestream.ts` | Livestream room + chat |
| `firestore-notification.ts` | In-app notification realtime |
| `audit-log.ts` | Admin audit trail |
| `query-client.ts` | TanStack React Query client (singleton) |
| `domain.ts` | Map hostname → portal (`acfmart.vn` → store, `seller.acfmart.vn` → seller…) |
| `cn.ts`, `format.ts`, `validators.ts`, `constants.ts`, `upload.ts` | Utils |
| `api-base.ts`, `acfmart-api.ts`, `medusa-api.ts`, `medusa.ts`, `mock-data.ts` | Legacy/optional API clients (Medusa hiện không deploy) |

**Quan tắc Firestore-first (memory `feedback_no_more_mock`):** mọi flow gọi API thật. Không setTimeout giả lập, không mock data trong production code. Mock chỉ dùng cho test/dev seed.

## 4. Conventions

**TypeScript / Vite**
- `tsconfig.json` ở `src/`: target ES2020, strict tắt (`strict: false`), JSX `react-jsx`, alias `@/* → src/*`
- File extension: `.tsx` cho component có JSX, `.ts` cho service/hook/util
- Type: import từ `src/types.ts` cho domain type (Product, Order, User, …)
- Path alias: `@/lib/firebase` thay vì `../../lib/firebase`

**Naming**
- File: kebab-case (`auth-service.ts`, `use-products.ts`, `product-card.tsx`)
- React component: PascalCase trong file kebab-case (`product-card.tsx` export `ProductCard`)
- Hook: `use-x.ts` export `useX`
- Zustand store: `x-store.ts` export `useXStore`
- Firestore field: snake_case (giữ convention DB), TypeScript field: camelCase (map khi đọc/ghi)

**Tailwind**
- Brand color: `brand-red-{50..900}` (primary, 500=`#dc2626`), `brand-gold-{50..900}` (secondary, 500=`#f59e0b`)
- Font: `font-sans` = Be Vietnam Pro (đã import Google Fonts trong `index.html`)
- Container chuẩn: class `.container-acf` (max-w-7xl, padding responsive) — định nghĩa trong `index.css`
- Utility custom (`index.css`): `.btn-primary`, `.btn-secondary`, `.btn-gold`, `.card`, `.input`, `.badge-verified`, `.badge-live`
- Animation: `animate-fade-in`, `animate-slide-up`, `animate-pulse-slow`

**Component pattern**
```tsx
// src/features/product/components/product-card.tsx
import { Link } from "react-router-dom"
import { ShoppingCart } from "lucide-react"
import { cn } from "@/lib/cn"
import { useCartStore } from "@/stores/cart-store"
import type { Product } from "@/types"

interface ProductCardProps {
  product: Product
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem)
  return (
    <Link
      to={`/products/${product.id}`}
      className={cn("card group transition-transform hover:scale-[1.02]", className)}
    >
      {/* ... */}
    </Link>
  )
}
```

**Data fetching pattern (React Query)**
```ts
// src/hooks/use-products.ts
export function useProducts(filters: ProductFilters) {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: () => productService.listApproved(filters),
    staleTime: 60_000,
  })
}

export function useApproveProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: productService.approve,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  })
}
```

**Mutation pattern (Firestore-first)**
```ts
// src/lib/product-service.ts
export const productService = {
  async approve(input: { id: string; reviewerId: string }) {
    const ref = doc(db, "products", input.id)
    await updateDoc(ref, {
      status: "approved",
      approved_at: serverTimestamp(),
      approved_by: input.reviewerId,
    })
    await auditLog.write({ action: "product.approve", target: input.id, actor: input.reviewerId })
  },
}
```

## 5. Routing & multi-portal

Một bundle JS phục vụ 4 domain Firebase Hosting (`acfmart`, `acfmart-store`, `acfmart-cloud`, `acfmart-online`).

- [`src/App.tsx`](src/App.tsx) bọc `QueryClientProvider`, `AuthProvider`, `Toaster`, `RouterProvider`
- [`src/components/DomainRedirect.tsx`](src/components/DomainRedirect.tsx) đọc `window.location.hostname` → redirect vào portal phù hợp
- [`src/routes.tsx`](src/routes.tsx) khai báo route cho 3 portal:
  - Storefront: `/`, `/products/:id`, `/categories/...`, `/cart`, `/checkout`, `/account/...`, `/qr-verify`, `/live`, `/legal/...`
  - Seller (guard `SellerGuard`): `/seller`, `/seller/products`, `/seller/orders`, …
  - Admin (guard `AdminGuard`): `/admin`, `/admin/vendors`, `/admin/products`, `/admin/users`, …

Auth guard đọc `useAuthStore()`, redirect `/login/store` hoặc `/login/cloud` nếu thiếu role.

## 6. State management

- **Server state**: TanStack React Query (queryClient singleton trong `lib/query-client.ts`)
- **Client state**: Zustand
  - `auth-store`: user + role + token (persist localStorage)
  - `cart-store`: items grouped by shop, totals, persist
  - `wishlist-store`: persist
- **Realtime**: Firestore `onSnapshot` qua các hook `use-chat-realtime`, `use-notifications`, `use-live-stream` — gói trong `useEffect` + cleanup khi unmount
- KHÔNG dùng Context API cho global state (Zustand + React Query bao phủ)

## 7. Brand & UX

- **Tone**: tiếng Việt có dấu đầy đủ, không dùng emoji trừ khi user yêu cầu
- **Primary**: `brand-red-500` (đỏ ACF), CTA chính
- **Secondary**: `brand-gold-500` (badge "Đã xác thực", premium CTA)
- **Logo**: `logo.png` (ngang) và `logov.png` (vuông) — dùng đúng theo context (header dùng ngang)
- **Author/branding**: identifier `acfmart`, hiển thị "ACFMart", tác giả "IVS JSC" (link `ivsacademy.edu.vn`)
- **Aivy**: AI assistant tên "Aivy" (Gemini), persona tiếng Việt, do IVS JSC phát triển

## 8. Firebase

- Project: `ecommerce-acf` (region `asia-southeast1`)
- Hosting: 4 target serve cùng `src/dist`
- Functions: nodejs20, source `functions/`
- Firestore: database `(default)`, rules `firestore.rules`, indexes `firestore.indexes.json`
- Storage: rules `storage.rules`
- Auth providers (`firebase.json` `auth.providers`): anonymous, emailPassword, googleSignIn — Zalo/Facebook xử lý qua custom flow

## 9. Lưu ý vận hành

- App Hosting backend `acf-backend` từng tồn tại nhưng idle — đã gỡ khỏi `firebase.json`. Nếu cần dùng lại, khai báo trong `firebase.json` và tạo `apphosting.yaml`
- `acfmart-payment-service/` deploy độc lập qua k8s, không build trong CI Firebase
- `npm audit` ở `src/`: 0 vulnerabilities (đã thêm `overrides: { undici: "^6.24.0" }` để patch transitive Firebase 10)
- `npm audit` ở `functions/`: còn 9 low — transitive trong chain `@google-cloud/firestore → google-gax → retry-request → teeny-request`, chờ Google bump
- `functions/tsconfig.json` set `types: []` và `typeRoots` cố định để tránh tsc load `@types/*` từ parent worktree

## 10. Khi sửa code

- KHÔNG mock — gọi Firebase/Medusa/GHN/VNPay/Momo/ZaloPay thật (memory `feedback_no_more_mock`)
- Tránh setTimeout giả lập state thay đổi — dùng React Query mutation + invalidate
- Mọi thay đổi schema Firestore → cập nhật `firestore.rules` và `firestore.indexes.json` đồng thời
- Khi thêm route mới: thêm vào `src/routes.tsx`, tạo screen component trong `src/features/<feature>/screens/`, tạo hook trong `src/hooks/` nếu cần fetch, dịch vụ trong `src/lib/` nếu cần I/O
- Khi thêm collection Firestore mới: tạo `src/lib/<name>-service.ts` chuẩn hoá CRUD, không gọi `doc()/getDoc()` trực tiếp từ component
