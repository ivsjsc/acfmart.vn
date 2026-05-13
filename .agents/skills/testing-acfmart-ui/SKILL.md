---
name: testing-acfmart-ui
description: Test ACFMart frontend UI pages end-to-end. Use when verifying login pages, guide pages, social feed, admin panels, or banner slider changes.
---

# Testing ACFMart Frontend UI

## Dev Server Setup

```bash
cd /home/ubuntu/repos/acfmart.vn/src-acfmart
npm run dev
```

The dev server runs on `http://localhost:3000` (Vite). Wait for the "ready" message before navigating.

## Route Catalog

### Public Pages (no auth required)
| Route | Component | Description |
|-------|-----------|-------------|
| `/` | HomeScreen | Homepage with BannerSlider, categories, live streams |
| `/login/cloud` | LoginCloudScreen | Admin/moderator login (dark slate theme) |
| `/login/store` | LoginStoreScreen | Merchant login (orange theme, Google OAuth) |
| `/login/online` | LoginOnlineScreen | Affiliate login (dark gradient, Google+Facebook OAuth) |
| `/guide/create-moderator` | GuideCreateModeratorPage | How to create moderator accounts |
| `/guide/moderator` | GuideModeratorPage | Moderator workflow guide |
| `/guide/seller` | GuideSellerPage | Seller registration & product guide |
| `/social` | SocialFeedScreen | Social commerce feed (dark mode, mock data) |

### Auth-Gated Pages (require Firebase login + role)
| Route | Required Role | Description |
|-------|--------------|-------------|
| `/admin` | admin/moderator | Admin dashboard |
| `/admin/users` | admin | User management & role assignment |
| `/admin/vendors` | admin/moderator | Vendor approval/rejection |
| `/admin/banners` | admin/moderator | Banner CRUD management |
| `/seller/*` | seller | Seller center pages |

## Testing Tips

- **BannerSlider on homepage**: Requires banner data in Firestore `banners` collection or Remote Config `homepage_banners` key. Without data, component renders nothing (graceful empty state — not a bug).
- **Social Feed**: Currently uses hardcoded mock data. No backend integration yet. Test UI layout only.
- **Admin pages**: Require Firebase authentication. To test locally, you need a Firebase user with the appropriate role in Firestore `users/{uid}.role`.
- **Console warnings**: `SW registration failed` for `sw.js` is a pre-existing issue (service worker MIME type), not related to UI changes.
- **Navigation**: The app uses React Router. Use the nav bar links or direct URL entry. Sometimes the address bar needs `ctrl+l` to focus properly during browser automation.
- **Zalo login**: Uses localStorage for PKCE verifier (not sessionStorage). Full mobile app-switch test requires a physical device with Zalo app installed.

## Firebase Project
- Project ID: `ecommerce-acf`
- Storage bucket: `ecommerce-acf.firebasestorage.app` (ASIA1)

## Devin Secrets Needed
- No secrets required for public page testing
- Firebase admin credentials needed for auth-gated page testing (not currently provisioned)
