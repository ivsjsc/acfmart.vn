# Lazy Loading Guide

This project is now configured for route-level chunks in `src/vite.config.ts`.
Apply React lazy loading in `src/routes.tsx` by moving heavy route screens from
static imports to `React.lazy` imports.

## Recommended pattern

Keep layouts, guards, and tiny shared pages eager if they are needed for the
first paint. Lazy-load feature screens and portal screens.

```tsx
import React, { Suspense } from "react"

const RouteFallback = () => <div className="min-h-screen bg-background" />

function lazyNamed<T extends Record<string, React.ComponentType<any>>>(
  loader: () => Promise<T>,
  name: keyof T
) {
  return React.lazy(() =>
    loader().then((mod) => ({ default: mod[name] as React.ComponentType<any> }))
  )
}

function route(element: React.ReactNode) {
  return <Suspense fallback={<RouteFallback />}>{element}</Suspense>
}

const WalletScreen = lazyNamed(() => import("./features/account"), "WalletScreen")
const LoyaltyScreen = lazyNamed(() => import("./features/account"), "LoyaltyScreen")
const AffiliateDashboardScreen = lazyNamed(
  () => import("./features/affiliate"),
  "AffiliateDashboardScreen"
)
```

Then wrap route elements:

```tsx
{ path: "wallet", element: route(<WalletScreen />) }
{ path: "loyalty", element: route(<LoyaltyScreen />) }
{ path: "/affiliate", element: route(<AffiliateDashboardScreen />) }
```

## High-value route groups

Start with these groups because they are not needed on the initial home page:

- `features/admin`
- `features/seller`
- `features/account`
- `features/checkout`
- `features/affiliate`
- `features/live`
- `features/social`
- guide/legal pages under `src/pages`

## Do not lazy-load yet

- `MainLayout`, unless the first paint is already stable behind a shell.
- Core providers in `src/App.tsx` or `src/main.tsx`.
- Tiny shared utility modules or type-only modules.

## Verification

After each route group conversion:

1. Run `yarn tsc --noEmit`.
2. Run `yarn build`.
3. Open home, checkout, account wallet, affiliate, seller, and admin routes.
4. Confirm the loading fallback does not replace the full app shell for more
   than one screen transition.
