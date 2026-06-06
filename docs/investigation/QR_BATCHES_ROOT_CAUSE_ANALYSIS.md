# QR Batches Loading Issue - Root Cause Analysis

## TL;DR

**Likely Root Cause**: Seller status is NOT `ACTIVE` in the production database.

The backend ONLY resolves `sellerId` if the seller has `status: 'ACTIVE'`. If the seller status is `PENDING`, `REJECTED`, or any other value, the backend cannot identify the seller, causing all QR batch operations to fail with 403 Forbidden.

---

## Detailed Analysis

### Backend Authentication Flow

1. **Firebase ID Token** → Backend verifies token and gets `firebaseUid`
2. **User Resolver** ([`auth.module.ts:14-47`](file:///d:/IVS/Apps/DEVELOPER/ivs-trust-platform/apps/api/src/modules/auth/auth.module.ts#L14-L47)) → Looks up user in database:
   ```typescript
   const user = await prisma.user.findFirst({
     where: {
       OR: [
         { firebaseUid },
         { id: firebaseUid },
       ],
     },
   });
   ```

3. **Seller Resolution** ([`auth.module.ts:37-39`](file:///d:/IVS/Apps/DEVELOPER/ivs-trust-platform/apps/api/src/modules/auth/auth.module.ts#L37-L39)) → **CRITICAL**:
   ```typescript
   const seller = await prisma.seller.findFirst({
     where: { ownerUserId: user.id, status: 'ACTIVE' },  // ← MUST be 'ACTIVE'
   });
   ```

4. **AuthenticatedUser** object is created with `sellerId: seller?.id` (could be `undefined`)

5. **QR Batch Controller** ([`seller-qr.controller.ts:31-36`](file:///d:/IVS/Apps/DEVELOPER/ivs-trust-platform/apps/api/src/modules/sellers/seller-qr.controller.ts#L31-L36)):
   ```typescript
   private getSellerId(user: AuthenticatedUser): string {
     if (!user.sellerId) {
       throw new ForbiddenException('No seller profile linked to this user');  // ← 403 ERROR
     }
     return user.sellerId;
   }
   ```

### The Problem

If `seller.status !== 'ACTIVE'`, then:
- `seller` variable is `null`
- `sellerId` is `undefined`
- `getSellerId()` throws **403 Forbidden**
- Frontend receives error and shows "Chưa có batch QR từ backend" (misleading)

### Why This Happens

The affected seller account likely has:
- ✅ Firebase user exists
- ✅ User record exists in database
- ✅ Seller record exists in database
- ❌ **Seller status is NOT 'ACTIVE'** (could be 'PENDING', 'UNDER_REVIEW', 'REJECTED', etc.)

---

## Verification Steps

### Step 1: Run Diagnostic Script

1. Login to acfmart.store as the affected seller
2. Navigate to `/seller/qr-verified`
3. Open browser DevTools Console (F12)
4. Run [`diagnose-qr-batches.js`](file:///d:/IVS/Apps/DEVELOPER/acfmart/diagnose-qr-batches.js)
5. Look for this output:

```
Firebase Token Claims (sanitized):
  - sellerId: NOT SET ⚠️ THIS IS CRITICAL
```

**If you see this**, it confirms the sellerId is not being resolved.

### Step 2: Check Network Tab

In DevTools Network tab, look for:

```
Request: GET https://api.acfmart.vn/v1/sellers/me/qr-batches?page=1&limit=20
Status: 403 Forbidden
Response: { "statusCode": 403, "message": "No seller profile linked to this user" }
```

**If you see 403**, it confirms the sellerId resolution failed.

### Step 3: Check Production Database

Run this query on the production database (Prisma):

```typescript
// Find the user
const user = await prisma.user.findFirst({
  where: { email: 'affected-seller@example.com' },  // Replace with actual email
});

// Check seller status
const seller = await prisma.seller.findFirst({
  where: { ownerUserId: user.id },
  select: {
    id: true,
    status: true,
    ownerUserId: true,
    shopName: true,
  },
});

console.log('Seller status:', seller.status);  // ← This is likely NOT 'ACTIVE'
```

**Expected finding**: `seller.status` is something like:
- `'PENDING'`
- `'UNDER_REVIEW'`
- `'REJECTED'`
- `'SUSPENDED'`
- Or any value other than `'ACTIVE'`

---

## Solutions

### Option 1: Fix the Seller Status (Recommended)

If the seller should have access, update their status to `ACTIVE`:

```typescript
await prisma.seller.update({
  where: { id: 'seller-id-here' },
  data: { status: 'ACTIVE' },
});
```

**After this change**:
- Seller can access QR batches
- POST /qr-batches will work
- GET /qr-batches will return batches

### Option 2: Relax the Backend Constraint (If Business Logic Allows)

If sellers should be able to create QR batches even before being fully approved, change the resolver:

**File**: [`ivs-trust-platform/apps/api/src/modules/auth/auth.module.ts`](file:///d:/IVS/Apps/DEVELOPER/ivs-trust-platform/apps/api/src/modules/auth/auth.module.ts#L37-L39)

```typescript
// BEFORE (current):
const seller = await prisma.seller.findFirst({
  where: { ownerUserId: user.id, status: 'ACTIVE' },
});

// AFTER (allow any status except maybe REJECTED/SUSPENDED):
const seller = await prisma.seller.findFirst({
  where: { 
    ownerUserId: user.id,
    status: { notIn: ['REJECTED', 'SUSPENDED'] },
  },
});
```

**WARNING**: This is a business logic decision. Only do this if sellers SHOULD have QR access before full approval.

### Option 3: Better Error Message (Frontend Improvement)

Even if the 403 is correct, the frontend should show a clear error message instead of "Chưa có batch QR từ backend".

**Already fixed** in this commit:
- [`SellerQrVerifiedScreen.tsx`](file:///d:/IVS/Apps/DEVELOPER/acfmart/src/features/seller/components/SellerQrVerifiedScreen.tsx#L300-L311)
- Now shows: "Lỗi tải batch: {error.message}"

---

## Additional Checks

### Check if Product Exists

Even if sellerId resolves, batch creation requires the product to exist in the trust-platform database:

```typescript
// Backend checks this (seller-qr.controller.ts:142-152):
const product = await this.prisma.product.findFirst({
  where: { id: body.productId, sellerId },
});
if (!product) {
  throw new BadRequestException({
    code: 'PRODUCT_NOT_SYNCED',
    message: 'Product not found or not owned by seller',
  });
}
```

**If product doesn't exist**:
- Frontend should auto-sync using `upsertSellerProduct()`
- This is already implemented in [`SellerQrVerifiedScreen.tsx:92-111`](file:///d:/IVS/Apps/DEVELOPER/acfmart/src/features/seller/components/SellerQrVerifiedScreen.tsx#L92-L111)

### Check SKU Validity

The SKU selection in the UI might be using mock data. Verify:

1. In the QRVerified page, check the product dropdown
2. Select a product
3. Check the SKU dropdown
4. Open DevTools Console and run:
   ```javascript
   // Check if products are loaded from backend
   console.log('Products:', window.__INITIAL_PRODUCTS__); // Or check React state
   ```

**If products/SKUs are mock data**:
- Need to replace with backend-loaded data
- Use `useSellerProducts()` hook (already implemented)

---

## Acceptance Criteria Verification

After applying the fix, verify:

### ✅ 1. POST creates batch and returns id

```bash
POST https://api.acfmart.vn/v1/sellers/me/qr-batches
Body: { "productId": "prod_123", "skuId": "sku_456", "quantity": 100 }

Response (201):
{
  "id": "batch_789",
  "productId": "prod_123",
  "skuId": "sku_456",
  "quantity": 100,
  "status": "PENDING",
  "createdAt": "2026-06-06T20:00:00.000Z"
}
```

### ✅ 2. Subsequent GET returns that same id

```bash
GET https://api.acfmart.vn/v1/sellers/me/qr-batches?page=1&limit=20

Response (200):
{
  "data": [
    {
      "id": "batch_789",  // ← Same id as POST response
      "productId": "prod_123",
      "productName": "Test Product",
      "skuId": "sku_456",
      "quantity": 100,
      "status": "PENDING",
      "createdAt": "2026-06-06T20:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20
}
```

### ✅ 3. UI table renders that batch

- Table shows 1 row
- Batch ID: `batch_789`
- Product name displayed
- Quantity: 100
- Status pill shows "PENDING"
- Action buttons visible (Tải, Kích hoạt)

### ✅ 4. Counts update

- Metric cards show:
  - Products: 1 (or more)
  - Batch QR: 1
  - Mã QR đã cấp: 100

### ✅ 5. Refresh page still shows the batch

- Close browser
- Reopen `/seller/qr-verified`
- Batch still appears in table
- Counts still correct

---

## Next Actions

1. **Run [`diagnose-qr-batches.js`](file:///d:/IVS/Apps/DEVELOPER/acfmart/diagnose-qr-batches.js)** on affected seller account
2. **Check the output** for `sellerId: NOT SET` warning
3. **Check Network tab** for 403 Forbidden status
4. **Check production database** for seller.status value
5. **Apply fix** (Option 1: update status to ACTIVE, or Option 2: relax constraint)
6. **Test full flow**: Create batch → Refresh → Verify batch appears
7. **Report back** with diagnostic output and database findings

---

## Files Referenced

### Backend (ivs-trust-platform)
- [`apps/api/src/modules/auth/auth.module.ts`](file:///d:/IVS/Apps/DEVELOPER/ivs-trust-platform/apps/api/src/modules/auth/auth.module.ts) - User resolver with seller status check
- [`apps/api/src/modules/sellers/seller-qr.controller.ts`](file:///d:/IVS/Apps/DEVELOPER/ivs-trust-platform/apps/api/src/modules/sellers/seller-qr.controller.ts) - QR batch endpoints
- [`packages/auth-core/src/types.ts`](file:///d:/IVS/Apps/DEVELOPER/ivs-trust-platform/packages/auth-core/src/types.ts) - AuthenticatedUser type
- [`packages/auth-core/src/firebase-auth.guard.ts`](file:///d:/IVS/Apps/DEVELOPER/ivs-trust-platform/packages/auth-core/src/firebase-auth.guard.ts) - Firebase auth guard

### Frontend (acfmart)
- [`src/features/seller/components/SellerQrVerifiedScreen.tsx`](file:///d:/IVS/Apps/DEVELOPER/acfmart/src/features/seller/components/SellerQrVerifiedScreen.tsx) - QRVerified page
- [`src/hooks/use-ivs-seller-qr.ts`](file:///d:/IVS/Apps/DEVELOPER/acfmart/src/hooks/use-ivs-seller-qr.ts) - React Query hooks
- [`src/lib/ivs-trust-api.ts`](file:///d:/IVS/Apps/DEVELOPER/acfmart/src/lib/ivs-trust-api.ts) - API client
- [`diagnose-qr-batches.js`](file:///d:/IVS/Apps/DEVELOPER/acfmart/diagnose-qr-batches.js) - Diagnostic script
