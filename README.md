# ACFMart.vn — Verified Commerce Platform by IVS JSC

**ACFMart.vn** is a trust-first commerce platform developed by **IVS JSC — Integrate Vision Synergy**.

The platform is designed for verified sellers, product authenticity workflows, QR-based verification, buyer-first marketplace experience, and operational compliance readiness.

This repository is published as a public technical portfolio to demonstrate IVS JSC’s product architecture, software engineering capability, marketplace design, and digital trust infrastructure direction.

---

## Product Positioning

ACFMart.vn is positioned as a **Verified Commerce Platform**, not a generic low-price marketplace.

The product direction focuses on:

- Verified seller onboarding
- Product origin and authenticity workflows
- QR-based product verification
- Buyer-first product discovery
- Admin moderation and compliance readiness
- Affiliate and growth infrastructure readiness
- Future integration with QRVerified by IVS and IVS Trust Platform

---

## Core Modules

### Marketplace Experience

- Buyer-facing product discovery
- Product detail and catalog structure
- Seller and product data workflows
- Checkout and order-flow readiness
- Responsive web experience

### Seller & Product Trust

- Seller onboarding direction
- Product verification readiness
- Product authenticity data model
- QR verification integration direction
- Moderation and compliance checkpoints

### Operations & Admin

- Admin dashboard direction
- Seller and product review workflow
- Policy and legal content structure
- Operational reporting foundation
- Audit-friendly system organization

---

## Architecture

| Layer | Implementation / Direction |
|---|---|
| Monorepo | npm workspaces + Turborepo |
| Frontend | Next.js, React, TypeScript |
| UI | Tailwind CSS, Radix UI, responsive component architecture |
| API | Node.js, Express, TypeScript |
| Database | Prisma ORM, PostgreSQL-ready schema direction |
| Realtime / Queue | Socket.IO, Bull, Redis-ready architecture |
| Security | Helmet, CORS, rate limiting, token-based backend structure |
| Validation | Zod, React Hook Form |
| Charts / Dashboard | Recharts |

---

## Repository Structure

```txt
acfmart.vn/
├── apps/
│   ├── web/              # Marketplace web application
│   └── api/              # API service
├── packages/
│   ├── database/         # Prisma database package
│   └── types/            # Shared TypeScript types
├── docs/                 # Planning, product, deployment and technical documents
├── public/               # Static and legal assets
├── package.json          # Root workspace scripts
└── README.md
```

---

## Technology Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Radix UI
- React Query
- Zustand
- Recharts

### Backend

- Node.js
- Express
- TypeScript
- Prisma
- CORS
- Helmet
- Express Rate Limit
- Socket.IO
- Bull / Redis-ready queue structure

### Tooling

- npm workspaces
- Turborepo
- ESLint
- Prettier
- Husky
- lint-staged

---

## Getting Started

### Prerequisites

- Node.js `>= 20`
- npm `>= 10`
- PostgreSQL-compatible database for full backend/database workflows
- Redis-compatible service for queue/realtime workflows, where applicable

### 1. Clone the repository

```bash
git clone https://github.com/ivsjsc/acfmart.vn.git
cd acfmart.vn
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run all development workspaces

```bash
npm run dev
```

### 4. Run the API only

```bash
npm run dev:api
```

### 5. Build all workspaces

```bash
npm run build
```

### 6. Run lint / tests

```bash
npm run lint
npm run test
```

---

## Database Commands

```bash
npm run db:generate
npm run db:migrate:dev
npm run db:migrate:deploy
```

Use migration commands carefully. Do not run production migrations without reviewing the target environment, migration status, and backup strategy.

---

## Environment Configuration

Create local environment files as required by each workspace.

Do not commit production configuration, service credentials, private operational files, or customer data.

---

## Security & Compliance Notes

This repository is structured for a trust-first commerce platform and should be handled with production discipline:

- Keep credentials outside Git.
- Use environment-specific configuration management.
- Review API authentication and authorization before production deployment.
- Apply rate limiting and request validation to public endpoints.
- Protect seller, buyer, payment, and verification data.
- Review payment, logistics, consumer protection, privacy, and e-commerce compliance before commercial launch.

---

## Related Repository

- **QRVerified by IVS:** https://github.com/ivsjsc/qr-ivs

---

## Maintainer

**IVS JSC — Integrate Vision Synergy**  
Product and technical direction: **Nguyễn Minh Triết**

---

## Copyright

Copyright © IVS JSC. All rights reserved.

This repository is shared for portfolio, demonstration, and technical reference purposes only.
