# QR Batch API Staging Verification Report

**Date**: [Fill in date]
**Tester**: [Fill in name]
**Backend Commit**: f1e4b1f
**Frontend Commit**: 60f5d72b
**Backend URL**: https://api.acfmart.vn
**Frontend URL**: https://acfmart.web.app

---

## Test Environment

- [ ] Backend deployed and healthy
- [ ] Frontend deployed and accessible
- [ ] Test accounts prepared:
  - [ ] ACTIVE seller account (email: _______________)
  - [ ] PENDING seller account (email: _______________)
  - [ ] REJECTED seller account (email: _______________, if available)

---

## Test Scenario 1: ACTIVE Seller - Full Flow

**Seller Email**: _______________
**Firebase UID**: _______________
**Seller ID**: _______________

### Step 1: Login and Navigate

- [ ] Logged in as ACTIVE seller
- [ ] Navigated to `/seller/qr-verified`
- [ ] Page loaded without errors: YES / NO

### Step 2: GET /v1/sellers/me/qr-batches (Initial Load)

**Capture from Browser DevTools > Network tab:**

```
Request URL: https://api.acfmart.vn/v1/sellers/me/qr-batches?page=1&limit=20
Request Method: GET
Status Code: _____ (Expected: 200)

Response Headers:
Content-Type: application/json
[Other headers]

Response Body:
{
  "data": [
    // List existing batches or empty array
  ],
  "total": _____,
  "page": 1,
  "limit": 20
}
```

**Result**: ✅ PASS / ❌ FAIL

**Notes**: _______________

### Step 3: POST /v1/sellers/me/qr-batches (Create Batch)

**Action**: Select product, enter quantity (e.g., 100), click "Tạo batch"

**Capture from Browser DevTools > Network tab:**

```
Request URL: https://api.acfmart.vn/v1/sellers/me/qr-batches
Request Method: POST
Status Code: _____ (Expected: 201)

Request Body:
{
  "productId": "_______________",
  "skuId": "_______________" (or null),
  "quantity": 100
}

Response Headers:
Content-Type: application/json

Response Body:
{
  "id": "BATCH_ID_HERE",
  "sellerId": "_______________",
  "productId": "_______________",
  "skuId": null,
  "quantity": 100,
  "status": "CREATED",
  "createdAt": "2026-06-06T..."
}
```

**Result**: ✅ PASS / ❌ FAIL

**Batch ID Created**: _______________

**UI Verification**:
- [ ] Success toast appeared: "Đã tạo batch QR tem xác thực"
- [ ] Batch appeared in table immediately: YES / NO
- [ ] Batch ID matches response: YES / NO
- [ ] Quantity displays correctly: YES / NO
- [ ] Status pill shows "CREATED": YES / NO

### Step 4: Refresh Page and Verify GET

**Action**: Press F5 to refresh the page

**Capture from Browser DevTools > Network tab:**

```
Request URL: https://api.acfmart.vn/v1/sellers/me/qr-batches?page=1&limit=20
Request Method: GET
Status Code: _____ (Expected: 200)

Response Body:
{
  "data": [
    {
      "id": "SAME_BATCH_ID_AS_ABOVE",
      "productId": "_______________",
      "productName": "_______________",
      "quantity": 100,
      "status": "CREATED",
      "createdAt": "2026-06-06T..."
    }
  ],
  "total": _____,
  "page": 1,
  "limit": 20
}
```

**Result**: ✅ PASS / ❌ FAIL

**UI Verification**:
- [ ] Created batch still visible after reload: YES / NO
- [ ] Batch ID matches POST response: YES / NO
- [ ] All fields render correctly: YES / NO

### Step 5: POST → GET Consistency Check

- [ ] Batch ID from POST: _______________
- [ ] Batch ID from GET after reload: _______________
- [ ] IDs match: YES / NO

**Result**: ✅ PASS / ❌ FAIL

---

## Test Scenario 2: PENDING/UNDER_REVIEW Seller - Blocked Creation

**Seller Email**: _______________
**Firebase UID**: _______________
**Seller ID**: _______________
**Seller Status**: PENDING / UNDER_REVIEW (circle one)

### Step 1: Login and Navigate

- [ ] Logged in as PENDING seller
- [ ] Navigated to `/seller/qr-verified`
- [ ] Page loaded: YES / NO

### Step 2: GET /v1/sellers/me/qr-batches

**Capture from Browser DevTools > Network tab:**

```
Request URL: https://api.acfmart.vn/v1/sellers/me/qr-batches?page=1&limit=20
Request Method: GET
Status Code: _____ (Expected: 200)

Response Body:
{
  "data": [],
  "total": 0,
  "page": 1,
  "limit": 20
}
```

**Result**: ✅ PASS / ❌ FAIL

**Notes**: PENDING sellers can VIEW batches (if any exist)

### Step 3: POST /v1/sellers/me/qr-batches (Should Be Blocked)

**Action**: Try to create a batch (select product, enter quantity, submit)

**Capture from Browser DevTools > Network tab:**

```
Request URL: https://api.acfmart.vn/v1/sellers/me/qr-batches
Request Method: POST
Status Code: _____ (Expected: 403)

Response Body:
{
  "statusCode": 403,
  "message": "Gian hàng chưa đủ điều kiện tạo batch QR. Vui lòng hoàn tất xác thực.",
  "error": "Forbidden"
}
```

**Result**: ✅ PASS / ❌ FAIL

**UI Verification**:
- [ ] Error message displayed: YES / NO
- [ ] Message text (Vietnamese): _______________
- [ ] Message contains "chưa đủ điều kiện": YES / NO
- [ ] Message contains "hoàn tất xác thực": YES / NO
- [ ] UI does NOT show empty state "Chưa có batch QR nào": YES / NO
- [ ] Error appears in error banner at top: YES / NO

**Screenshot**: [Attach screenshot showing 403 error message]

---

## Test Scenario 3: REJECTED/SUSPENDED Seller - Full Block

**Seller Email**: _______________
**Firebase UID**: _______________
**Seller ID**: _______________
**Seller Status**: REJECTED / SUSPENDED (circle one)

### Step 1: Login and Navigate

- [ ] Logged in as REJECTED seller
- [ ] Navigated to `/seller/qr-verified`
- [ ] Page loaded: YES / NO

### Step 2: GET /v1/sellers/me/qr-batches (Should Be Blocked)

**Capture from Browser DevTools > Network tab:**

```
Request URL: https://api.acfmart.vn/v1/sellers/me/qr-batches?page=1&limit=20
Request Method: GET
Status Code: _____ (Expected: 403)

Response Body:
{
  "statusCode": 403,
  "message": "Seller account is not eligible to access QR batches",
  "error": "Forbidden"
}
```

**Result**: ✅ PASS / ❌ FAIL

**UI Verification**:
- [ ] Error message displayed: YES / NO
- [ ] Message: "Gian hàng chưa đủ điều kiện truy cập QRVerified. Vui lòng hoàn tất xác thực."
- [ ] UI shows error state, NOT empty state: YES / NO
- [ ] Cannot access any QR batch features: YES / NO

**Screenshot**: [Attach screenshot showing 403 error]

---

## Test Scenario 4: Product/SKU Validation

**Seller**: ACTIVE seller from Scenario 1

### Test 4a: Invalid Product ID

**Action**: Send POST with non-existent productId (use browser console or API tool)

```
POST https://api.acfmart.vn/v1/sellers/me/qr-batches
{
  "productId": "non-existent-product-id",
  "quantity": 100
}
```

**Expected Response**:

```
Status Code: 400

{
  "statusCode": 400,
  "message": {
    "code": "PRODUCT_NOT_SYNCED",
    "message": "Product not found or not owned by seller"
  },
  "error": "Bad Request"
}
```

**Result**: ✅ PASS / ❌ FAIL

### Test 4b: Invalid SKU ID

**Action**: Send POST with valid productId but invalid skuId

```
POST https://api.acfmart.vn/v1/sellers/me/qr-batches
{
  "productId": "valid-product-id",
  "skuId": "non-existent-sku-id",
  "quantity": 100
}
```

**Expected Response**:

```
Status Code: 400

{
  "statusCode": 400,
  "message": "SKU 'non-existent-sku-id' does not exist for this product",
  "error": "Bad Request"
}
```

**Result**: ✅ PASS / ❌ FAIL

---

## Test Scenario 5: Error Handling

### Test 5a: Expired Token (401)

**Action**: Clear cookies/localStorage or use expired token

**Expected UI Message**: "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại."

**Result**: ✅ PASS / ❌ FAIL

### Test 5b: Server Error (500)

**Action**: Block API in DevTools Network tab or simulate server error

**Expected UI**: Shows maintenance state "Dịch vụ tem QR đang gặp sự cố"

**Result**: ✅ PASS / ❌ FAIL

---

## Summary

| Scenario | Expected | Actual | Status |
|----------|----------|--------|--------|
| ACTIVE: GET batches | 200 | _____ | ✅/❌ |
| ACTIVE: POST create batch | 201 | _____ | ✅/❌ |
| ACTIVE: GET after reload | 200, same batch ID | _____ | ✅/❌ |
| ACTIVE: UI renders batch | Batch visible | _____ | ✅/❌ |
| PENDING: GET batches | 200 | _____ | ✅/❌ |
| PENDING: POST create | 403 + Vietnamese msg | _____ | ✅/❌ |
| REJECTED: GET batches | 403 | _____ | ✅/❌ |
| Invalid product | 400 | _____ | ✅/❌ |
| Invalid SKU | 400 | _____ | ✅/❌ |
| 401 error handling | Vietnamese message | _____ | ✅/❌ |
| 500 error handling | Maintenance state | _____ | ✅/❌ |

**Overall Result**: ✅ ALL PASS / ❌ SOME FAILURES

---

## Issues Found

1. _______________
2. _______________
3. _______________

---

## Screenshots

[Attach screenshots for each test scenario]

1. ACTIVE seller: GET response
2. ACTIVE seller: POST response
3. ACTIVE seller: UI after reload
4. PENDING seller: 403 error message
5. REJECTED seller: 403 error message

---

## Network Evidence

### ACTIVE Seller Flow

**GET → POST → GET sequence:**

1. **GET** (before creation):
   - URL: `https://api.acfmart.vn/v1/sellers/me/qr-batches?page=1&limit=20`
   - Status: _____
   - Batches: _____

2. **POST** (create):
   - URL: `https://api.acfmart.vn/v1/sellers/me/qr-batches`
   - Status: _____
   - Batch ID: _____

3. **GET** (after reload):
   - URL: `https://api.acfmart.vn/v1/sellers/me/qr-batches?page=1&limit=20`
   - Status: _____
   - Batch ID in response: _____
   - **IDs match**: YES / NO

---

## Conclusion

**Ready for Production Deployment**: YES / NO

**Reason**: _______________

**Approved By**: _______________
**Date**: _______________

---

## Appendix: How to Capture Network Evidence

### Using Browser DevTools (Chrome/Edge)

1. Open `https://acfmart.web.app/seller/qr-verified`
2. Press `F12` to open DevTools
3. Go to **Network** tab
4. Check **Preserve log** checkbox
5. Filter by `Fetch/XHR`
6. Perform actions (login, navigate, create batch, etc.)
7. Click on each request to see:
   - Headers (Request/Response)
   - Payload (Request Body)
   - Response (Response Body)
8. Right-click → **Copy** → **Copy as cURL** or **Copy response**

### Using the Verification Script

```bash
# Get Firebase ID token from browser localStorage
# Then run:
node verify-qr-batches.js "<firebase-token>" ACTIVE
node verify-qr-batches.js "<firebase-token>" PENDING
node verify-qr-batches.js "<firebase-token>" REJECTED
```
