# Production QR PDF Export Testing Guide

## Quick Start

### Step 1: Get Firebase ID Token

**In browser console after login as seller:**

```javascript
// Firebase v8 (compat)
firebase.auth().currentUser.getIdToken(true).then(console.log)

// Firebase v9+ (modular)
import { getAuth } from "firebase/auth";
getAuth().currentUser.getIdToken(true).then(console.log)
```

**Token format should be:** `eyJxxxxx.yyyyy.zzzzz` (JWT format)

**DO NOT use:**
- ❌ `AIza...` (API key)
- ❌ Refresh token

---

### Step 2: List Batches

```powershell
.\list-qr-batches.ps1 -Token "YOUR_FIREBASE_ID_TOKEN"
```

This will show all batches and provide the command to test PDF export.

---

### Step 3: Test PDF Export

```powershell
.\test-qr-pdf-export.ps1 -Token "YOUR_FIREBASE_ID_TOKEN" -BatchId "BATCH_ID_FROM_STEP_2"
```

**Expected output:**
- ✓ VALID PDF file detected (%PDF-)
- File downloaded: `qrverified-a4-test.pdf`

---

### Step 4: Verify PDF Content

Open `qrverified-a4-test.pdf` and check:

1. ✓ QR tem renders correctly
2. ✓ Text "Quét để xác thực" displays properly (no font issues)
3. ✓ QR code scans to: `https://qr.acfmart.vn/verify/{publicCode}`

---

## Test Cases Matrix

| Case | Token Used | Batch Used | Expected Result |
|------|-----------|------------|-----------------|
| **Seller ACTIVE** | Token from ACTIVE seller | Batch owned by same seller | **200** `application/pdf`, file starts with `%PDF-` |
| **Seller NOT ACTIVE** | Token from inactive seller | Batch owned by same seller | **403** Forbidden |
| **Cross-seller** | Token from Seller A | Batch owned by Seller B | **403** Forbidden |

### Priority
1. ✅ **Must test NOW:** Seller ACTIVE → PDF export (case 1)
2. ⏳ Test later: Seller NOT ACTIVE (case 2) - needs inactive seller account
3. ⏳ Test later: Cross-seller (case 3) - needs two different seller accounts

---

## If Test Fails

### DO NOT COMMIT
Prepare to rollback Cloud Run revision.

### Check Cloud Run Traffic

```powershell
gcloud run services describe ivs-trust-api `
  --region asia-southeast1 `
  --format="yaml(status.traffic)"
```

### Rollback to Previous Revision

```powershell
gcloud run services update-traffic ivs-trust-api `
  --region asia-southeast1 `
  --to-revisions ivs-trust-api-00008-xxxxx=100
```

Replace `ivs-trust-api-00008-xxxxx` with the actual previous revision name.

### Check Logs

```powershell
gcloud logging read --limit=50 --freshness=1h
```

---

## About Prisma Schema Change

The addition of:
```prisma
binaryTargets = ["native", "debian-openssl-3.0.x"]
```

**Is VALID** because:
- ✅ This is Prisma Client runtime binary config
- ✅ NOT a database migration
- ✅ Required for Cloud Run Debian runtime
- ✅ Needed for OpenSSL 3.0.x compatibility

---

## Commit (ONLY AFTER TESTS PASS)

```powershell
git add -A

git commit -m "fix: harden QR PDF export for Cloud Run Chromium runtime

- Switch Cloud Run image to Debian slim with Chromium dependencies
- Configure Puppeteer executablePath via PUPPETEER_EXECUTABLE_PATH
- Add ca-certificates and Unicode font support for PDF labels
- Add Prisma debian-openssl-3.0.x binary target for Cloud Run runtime
- Add Docker/Puppeteer smoke test scripts
- Fix seller PDF export permission response"
```

---

## Status Checklist

- [ ] Production deployed (live)
- [ ] Test with ACTIVE seller token - PDF export works
- [ ] PDF file validated (%PDF- header)
- [ ] PDF content verified (QR, fonts, scan URL)
- [ ] Test with inactive seller token (403) - if account available
- [ ] Test cross-seller access (403) - if accounts available
- [ ] All tests passed
- [ ] Commit code
- [ ] **OR** Rollback if failed

---

## Files Created

- `test-qr-pdf-export.ps1` - PDF export test script
- `list-qr-batches.ps1` - List batches helper script
- `PRODUCTION_TEST_GUIDE.md` - This guide
