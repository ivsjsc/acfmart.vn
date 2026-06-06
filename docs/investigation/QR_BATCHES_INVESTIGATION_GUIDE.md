# QR Batches Investigation Guide - Evidence Collection Protocol

## Objective

Collect **hard evidence** from real authenticated network requests to determine the exact root cause of QR batches not loading on acfmart.store.

---

## Investigation Steps

### Step 1: Install Network Interceptor

**Purpose**: Capture ALL real API requests and responses automatically.

1. Login to acfmart.store as the **affected seller**
2. Open browser DevTools Console (F12)
3. **IMPORTANT**: Do this BEFORE navigating to the QRVerified page
4. Paste and run [`diagnose-qr-batches-interceptor.js`](file:///d:/IVS/Apps/DEVELOPER/acfmart/diagnose-qr-batches-interceptor.js)
5. You should see: `✅ Interceptor installed successfully.`

### Step 2: Capture Page Load Request

**Purpose**: See what happens when the page tries to load batches.

1. Navigate to: `https://acfmart.store/seller/qr-verified`
2. Watch the console output
3. Look for a request like:
   ```
   📤 REQUEST [req_xxxxx]
   Method: GET
   URL: https://api.acfmart.vn/v1/sellers/me/qr-batches?page=1&limit=20
   Authorization: ✓ Present (Bearer token)
   ```

4. Then look for the response:
   ```
   📥 RESPONSE [req_xxxxx]
   Status: 200 OK  (or 403, 401, 500, etc.)
   Response Body: { ... }
   ```

5. **Critical**: Note the exact status code and response body

### Step 3: Capture Batch Creation Request

**Purpose**: See if POST succeeds and what it returns.

1. On the QRVerified page, fill out the "Tạo batch QR" form:
   - Select a product
   - Select a SKU (if available)
   - Enter quantity (e.g., 100)

2. Click "Tạo batch" button

3. Watch the console for POST request:
   ```
   📤 REQUEST [req_xxxxx]
   Method: POST
   URL: https://api.acfmart.vn/v1/sellers/me/qr-batches
   Request Payload: {
     "productId": "prod_123",
     "skuId": "sku_456",
     "quantity": 100
   }
   ```

4. Then look for the response:
   ```
   📥 RESPONSE [req_xxxxx]
   Status: 201 Created  (or 400, 403, etc.)
   Response Body: {
     "id": "batch_789",
     "productId": "prod_123",
     "skuId": "sku_456",
     "quantity": 100,
     "status": "PENDING",
     "createdAt": "2026-06-06T..."
   }
   ```

### Step 4: Capture Refresh Request

**Purpose**: Verify batch persists and can be retrieved.

1. After POST succeeds, wait 2-3 seconds
2. Click "Làm mới" (Refresh) button
3. Or reload the page
4. Watch for new GET request
5. Check if the created batch appears in response data

### Step 5: Generate Diagnostic Report

**Purpose**: Get a comprehensive summary of all captured requests.

Run this in console:
```javascript
generateQrDiagnosticReport()
```

This will output a structured report with analysis.

---

## Evidence to Collect

### For EACH request (GET and POST), capture:

#### 1. Status Code
- `200` = Success
- `201` = Created (POST success)
- `400` = Bad Request (validation error)
- `401` = Unauthorized (token expired)
- `403` = Forbidden (seller not resolved)
- `500` = Server Error

#### 2. Authorization Header
- Present or missing
- **DO NOT** copy the actual token value

#### 3. Request Payload (for POST only)
```json
{
  "productId": "prod_123",
  "skuId": "sku_456",
  "quantity": 100
}
```

#### 4. Response Body
**For GET success (200)**:
```json
{
  "data": [
    {
      "id": "batch_789",
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

**For POST success (201)**:
```json
{
  "id": "batch_789",
  "productId": "prod_123",
  "skuId": "sku_456",
  "quantity": 100,
  "status": "PENDING",
  "createdAt": "2026-06-06T20:00:00.000Z"
}
```

**For 403 Forbidden**:
```json
{
  "statusCode": 403,
  "message": "No seller profile linked to this user"
}
```

**For 400 Bad Request**:
```json
{
  "statusCode": 400,
  "message": "Product not found or not owned by seller",
  "code": "PRODUCT_NOT_SYNCED"
}
```

---

## Backend Resolution Path to Verify

The backend resolves seller through this path:

```
Firebase ID Token
  → firebaseUid (from token)
    → user record (find by firebaseUid OR id)
      → user.id
        → seller record (find by ownerUserId = user.id AND status = 'ACTIVE')
          → seller.id
            → request.user.sellerId
```

### Critical Query (Backend Code)

File: [`auth.module.ts:14-47`](file:///d:/IVS/Apps/DEVELOPER/ivs-trust-platform/apps/api/src/modules/auth/auth.module.ts#L14-L47)

```typescript
// Step 1: Find user by Firebase UID
const user = await prisma.user.findFirst({
  where: {
    OR: [
      { firebaseUid },  // Try firebaseUid field
      { id: firebaseUid },  // Or try id field directly
    ],
  },
});

// Step 2: Find seller with ACTIVE status
const seller = await prisma.seller.findFirst({
  where: { ownerUserId: user.id, status: 'ACTIVE' },
});

// Step 3: Return sellerId (can be undefined if not found)
return {
  userId: user.id,
  email: user.email,
  roles: roleCodes,
  sellerId: seller?.id,  // ← This is critical
};
```

### What to Check in Production Database

Run these queries (via Prisma Studio or admin script):

```typescript
// 1. Find the user
const user = await prisma.user.findFirst({
  where: {
    email: 'affected-seller@example.com'  // Replace with actual email
  }
});

console.log('User ID:', user.id);
console.log('User email:', user.email);
console.log('User firebaseUid:', user.firebaseUid);

// 2. Find ALL sellers for this user (regardless of status)
const sellers = await prisma.seller.findMany({
  where: { ownerUserId: user.id },
  select: {
    id: true,
    status: true,
    ownerUserId: true,
    shopName: true,
    createdAt: true,
    updatedAt: true,
  }
});

console.log('Sellers found:', sellers.length);
console.log('Sellers:', JSON.stringify(sellers, null, 2));

// 3. Check if ACTIVE seller exists
const activeSeller = sellers.find(s => s.status === 'ACTIVE');
console.log('Has ACTIVE seller:', !!activeSeller);

// 4. Test the exact query backend uses
const resolvedSeller = await prisma.seller.findFirst({
  where: { ownerUserId: user.id, status: 'ACTIVE' },
});

console.log('Backend would resolve seller:', resolvedSeller?.id || 'NULL');
```

---

## Possible Scenarios & Solutions

### Scenario A: 403 Forbidden - Seller Status Not ACTIVE

**Evidence**:
- GET returns 403
- Response: `{ "message": "No seller profile linked to this user" }`
- DB shows: `seller.status = "PENDING"` (or other non-ACTIVE value)

**Business Decision Required**:

**Option 1**: Only ACTIVE sellers can access QR batches (current behavior)
- **Action**: Update seller status to ACTIVE in DB
- **Frontend**: Show clear message if seller not ACTIVE

**Option 2**: Allow PENDING/UNDER_REVIEW sellers to view/create batches
- **Action**: Modify backend resolver to accept multiple statuses
- **Constraint**: Batches remain DRAFT/PENDING until seller is ACTIVE
- **Public verification**: Still blocked until seller is ACTIVE

### Scenario B: 403 Forbidden - ownerUserId Mismatch

**Evidence**:
- GET returns 403
- DB shows:
  - `user.id = "user_123"`
  - `seller.ownerUserId = "user_456"` (DIFFERENT!)

**Root Cause**: Seller was created with wrong ownerUserId

**Fix**: Update seller.ownerUserId to match user.id

### Scenario C: 403 Forbidden - User Record Not Found

**Evidence**:
- GET returns 403
- DB query: `user.findFirst({ where: { firebaseUid } })` returns NULL

**Root Cause**: User not synced from Firebase to platform DB

**Fix**: Create user record or fix firebaseUid mapping

### Scenario D: 200 Success but Empty Data

**Evidence**:
- GET returns 200
- Response: `{ "data": [], "total": 0 }`

**This is normal** if no batches have been created yet.

**Next**: Try creating a batch with POST

### Scenario E: POST Succeeds but GET Still Empty

**Evidence**:
- POST returns 201 with batch id
- GET returns 200 with empty data array

**Possible Causes**:
1. **Pagination issue**: Batch exists but not in first page
2. **sellerId mismatch**: Batch created with different sellerId
3. **Caching**: Query cached, need to wait or invalidate

**Fix**: Check batch record in DB:
```typescript
const batch = await prisma.qrBatch.findUnique({
  where: { id: 'batch_id_from_post_response' }
});
console.log('Batch sellerId:', batch.sellerId);
```

---

## Acceptance Criteria Checklist

After fixing the issue, verify ALL of these:

### ✅ 1. GET on Page Load
- [ ] Status code: 200 (or 403 with clear error message)
- [ ] Authorization header: Present
- [ ] If 200: Response contains `data` array (can be empty)
- [ ] If 403: Response contains error message explaining why

### ✅ 2. POST Batch Creation
- [ ] Status code: 201 (or clear error if validation fails)
- [ ] Request payload contains: productId, quantity
- [ ] Response contains: `id` (batch ID)
- [ ] Response contains: productId, skuId, quantity, status, createdAt

### ✅ 3. GET After POST
- [ ] Status code: 200
- [ ] Response `data` array contains the batch created in step 2
- [ ] Batch `id` matches POST response `id`
- [ ] All fields match (productId, skuId, quantity, status)

### ✅ 4. UI Rendering
- [ ] Batch table shows the batch row
- [ ] Batch ID displayed
- [ ] Product name displayed (not just productId)
- [ ] Quantity displayed
- [ ] Status pill shows correct status
- [ ] Action buttons visible (Tải, Kích hoạt)

### ✅ 5. Counts Update
- [ ] "Batch QR" metric shows correct count
- [ ] "Mã QR đã cấp" shows total quantity
- [ ] "Sản phẩm IVS" shows product count

### ✅ 6. Page Reload Persistence
- [ ] Close browser tab
- [ ] Reopen `/seller/qr-verified`
- [ ] Batch still appears in table
- [ ] Counts still correct
- [ ] All data matches before reload

---

## What to Report Back

After running the diagnostic, provide:

1. **Full console output** from `generateQrDiagnosticReport()`
2. **Screenshots** of:
   - DevTools Network tab showing GET request
   - DevTools Network tab showing POST request (if attempted)
   - QRVerified page UI showing the batch table
   - Any error messages displayed

3. **Database query results** (if you have DB access):
   - user.id, user.email, user.firebaseUid
   - seller.id, seller.ownerUserId, seller.status
   - seller.createdAt, seller.updatedAt

4. **Answers to these questions**:
   - What is the seller's current status in DB?
   - Should this seller be able to create QR batches?
   - Are there existing batches in DB for this seller?
   - What business rule do you want for non-ACTIVE sellers?

---

## Files Reference

### Diagnostic Tools
- [`diagnose-qr-batches-interceptor.js`](file:///d:/IVS/Apps/DEVELOPER/acfmart/diagnose-qr-batches-interceptor.js) - Network interceptor (USE THIS)
- [`diagnose-qr-batches.js`](file:///d:/IVS/Apps/DEVELOPER/acfmart/diagnose-qr-batches.js) - Alternative diagnostic script

### Backend Code
- [`auth.module.ts`](file:///d:/IVS/Apps/DEVELOPER/ivs-trust-platform/apps/api/src/modules/auth/auth.module.ts) - User/seller resolver
- [`seller-qr.controller.ts`](file:///d:/IVS/Apps/DEVELOPER/ivs-trust-platform/apps/api/src/modules/sellers/seller-qr.controller.ts) - QR batch endpoints

### Frontend Code
- [`SellerQrVerifiedScreen.tsx`](file:///d:/IVS/Apps/DEVELOPER/acfmart/src/features/seller/components/SellerQrVerifiedScreen.tsx) - QRVerified page
- [`use-ivs-seller-qr.ts`](file:///d:/IVS/Apps/DEVELOPER/acfmart/src/hooks/use-ivs-seller-qr.ts) - React Query hooks

---

## Next Steps

1. **Run diagnostic** on affected seller account
2. **Collect evidence** (console output + screenshots + DB queries)
3. **Report findings** with all evidence
4. **Decide business rule** for non-ACTIVE sellers
5. **Apply appropriate fix** based on evidence and business decision
6. **Test full flow** end-to-end
7. **Verify acceptance criteria** met

**DO NOT deploy** until we have hard evidence from real network requests and have confirmed the fix works on the affected seller account.
