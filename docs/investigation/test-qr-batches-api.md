# Backend API Direct Test Commands

## Prerequisites
You need a Firebase ID token from a seller account on acfmart.store

### How to get Firebase ID token:
1. Login to https://acfmart.store as a seller
2. Open DevTools (F12) → Console
3. Run: `firebase.auth().currentUser.getIdToken().then(console.log)`
4. Copy the token

---

## Test 1: ACTIVE Seller - GET batches

```bash
curl -X GET "https://api.acfmart.vn/v1/sellers/me/qr-batches?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Accept: application/json"
```

**Expected**: 200 OK with batch list

---

## Test 2: ACTIVE Seller - POST create batch

First, you need a valid productId. Check the dashboard:

```bash
curl -X GET "https://api.acfmart.vn/v1/sellers/me/dashboard" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Accept: application/json"
```

Then create a batch (replace product-id):

```bash
curl -X POST "https://api.acfmart.vn/v1/sellers/me/qr-batches" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "your-product-id-here",
    "quantity": 100
  }'
```

**Expected**: 201 Created with batch ID

---

## Test 3: ACTIVE Seller - GET batches after creation

```bash
curl -X GET "https://api.acfmart.vn/v1/sellers/me/qr-batches?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Accept: application/json"
```

**Expected**: 200 OK with the newly created batch in the list

---

## Test 4: PENDING Seller - POST should fail

Login as PENDING seller, get token, then:

```bash
curl -X POST "https://api.acfmart.vn/v1/sellers/me/qr-batches" \
  -H "Authorization: Bearer PENDING_SELLER_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "any-product-id",
    "quantity": 100
  }'
```

**Expected**: 403 Forbidden with message "Gian hàng chưa đủ điều kiện tạo batch QR. Vui lòng hoàn tất xác thực."

---

## Test 5: REJECTED Seller - GET should fail

Login as REJECTED seller, get token, then:

```bash
curl -X GET "https://api.acfmart.vn/v1/sellers/me/qr-batches?page=1&limit=20" \
  -H "Authorization: Bearer REJECTED_SELLER_TOKEN" \
  -H "Accept: application/json"
```

**Expected**: 403 Forbidden

---

## PowerShell Version (Windows)

### GET batches
```powershell
$headers = @{
  "Authorization" = "Bearer YOUR_FIREBASE_TOKEN"
  "Accept" = "application/json"
}

Invoke-RestMethod -Uri "https://api.acfmart.vn/v1/sellers/me/qr-batches?page=1&limit=20" -Method GET -Headers $headers | ConvertTo-Json -Depth 10
```

### POST create batch
```powershell
$headers = @{
  "Authorization" = "Bearer YOUR_FIREBASE_TOKEN"
  "Accept" = "application/json"
  "Content-Type" = "application/json"
}

$body = @{
  productId = "your-product-id"
  quantity = 100
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://api.acfmart.vn/v1/sellers/me/qr-batches" -Method POST -Headers $headers -Body $body | ConvertTo-Json -Depth 10
```

---

## Verification Checklist

Run these commands in order and capture the output:

- [ ] **ACTIVE seller GET** → Status 200, shows batches
- [ ] **ACTIVE seller POST** → Status 201, returns batch ID: ___________
- [ ] **ACTIVE seller GET again** → Status 200, shows same batch ID
- [ ] **Batch ID matches** → YES / NO
- [ ] **PENDING seller POST** → Status 403, Vietnamese message
- [ ] **REJECTED seller GET** → Status 403

---

## Sample Response Format

### GET Success (200)
```json
{
  "data": [
    {
      "id": "batch-uuid-here",
      "productId": "product-uuid",
      "productName": "Product Name",
      "skuId": null,
      "quantity": 100,
      "status": "CREATED",
      "createdAt": "2026-06-06T14:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20
}
```

### POST Success (201)
```json
{
  "id": "batch-uuid-here",
  "sellerId": "seller-uuid",
  "productId": "product-uuid",
  "skuId": null,
  "quantity": 100,
  "status": "CREATED",
  "createdAt": "2026-06-06T14:00:00.000Z"
}
```

### POST Blocked (403)
```json
{
  "statusCode": 403,
  "message": "Gian hàng chưa đủ điều kiện tạo batch QR. Vui lòng hoàn tất xác thực.",
  "error": "Forbidden"
}
```

### GET Blocked (403)
```json
{
  "statusCode": 403,
  "message": "Seller account is not eligible to access QR batches",
  "error": "Forbidden"
}
```
