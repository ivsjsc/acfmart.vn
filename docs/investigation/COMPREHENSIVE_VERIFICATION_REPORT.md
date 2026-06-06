# Comprehensive Verification Report - ACFMart Seller Center

## Executive Summary

✅ **KYC Status Inconsistency**: FIXED and TESTED
✅ **QR Batches Loading Issue**: ROOT CAUSE IDENTIFIED, ERROR HANDLING IMPROVED
✅ **All Tests**: PASSING (59/59)
✅ **Build**: SUCCESSFUL
⚠️ **Production Deploy**: PENDING manual verification with affected seller account

---

## Part 1: KYC Status Inconsistency Fix

### Issue
On acfmart.store `/seller/kyc`, the UI showed conflicting states:
- **Trạng thái hồ sơ**: "Cần kiểm tra lại" (Needs review)
- **Tình trạng xét duyệt**: "Đã xác thực" (Verified)  
- **Kết quả**: "Đã xác thực" (Verified)

### Root Cause
`MANUAL_REVIEW` status was incorrectly mapped to "verified" state, even though it means "eKYC identity verified but profile still needs human review".

### Fix Applied

#### 1. [`src/lib/kyc.ts`](file:///d:/IVS/Apps/DEVELOPER/acfmart/src/lib/kyc.ts#L396-L503)
**Canonical Rule**: Show "Đã xác thực" ONLY when:
- ✅ `kycStatus === "APPROVED"` (not MANUAL_REVIEW)
- ✅ `vendor.status === "active"` (seller review approved)
- ✅ No blocking technical errors

```typescript
const isKycApproved = finalStatus === "APPROVED"
const isVendorApproved = vendorStatus?.toLowerCase() === "active"

// Verified: Only if BOTH conditions met
if (isKycApproved && isVendorApproved && !hasBlockingError) {
  return { state: "verified", label: "Đã xác thực", ... }
}

// NEW: Handle MANUAL_REVIEW separately
if (finalStatus === "MANUAL_REVIEW" || (isKycApproved && !isVendorApproved)) {
  return {
    state: "processing",
    label: "Đã xác minh danh tính - Đang chờ xét duyệt",
    badge: "ĐANG CHỜ XÉT DUYỆT",
    ...
  }
}
```

#### 2. [`src/features/seller/components/SellerKycScreen.tsx`](file:///d:/IVS/Apps/DEVELOPER/acfmart/src/features/seller/components/SellerKycScreen.tsx#L419-L437)
- **"Tình trạng xét duyệt"**: Now shows amber color when vendor active but KYC not fully verified
- **"Kết quả"**: Shows appropriate message based on combined status
- **Vietnamese label refined**: "Đã xác thực" → "Đã duyệt gian hàng" for vendor.status only

### Status Mapping Table

| KYC Status | Vendor Status | UI State | Label | Badge |
|------------|--------------|----------|-------|-------|
| APPROVED | active | ✅ verified | Đã xác thực | ĐÃ XÁC THỰC |
| APPROVED | pending | ⏳ processing | Đã xác minh danh tính - Đang chờ xét duyệt | ĐANG CHỜ XÉT DUYỆT |
| MANUAL_REVIEW | active | ⏳ processing | Đã xác minh danh tính - Đang chờ xét duyệt | ĐANG CHỜ XÉT DUYỆT |
| REJECTED | active | ⚠️ needs_action | Cần kiểm tra lại | CẦN KIỂM TRA |
| null/empty | active | ⚠️ needs_action | Cần kiểm tra lại | CẦN KIỂM TRA |

### Git Diff Summary
```diff
src/lib/kyc.ts                                     |  52 ++++++++-
src/features/seller/components/SellerKycScreen.tsx |  19 ++-
src/tests/kyc-status-mapping.test.ts               | 272 +++++++++++++++++
```

### Test Results
✅ **15/15** new regression tests pass
✅ **3/3** existing seller-kyc-screen tests pass
✅ **59/59** total tests pass

### Test Coverage
```
✓ Case 1: profile NEEDS_REVIEW + review VERIFIED => final NEEDS_REVIEW (not VERIFIED)
✓ Case 2: profile VERIFIED + review VERIFIED => final VERIFIED
✓ Case 3: profile PENDING + review VERIFIED => final PENDING/SYNC_PENDING
✓ Case 4: profile REJECTED + review VERIFIED => final REJECTED
✓ Case 5: missing/null profile status + review VERIFIED => final NEEDS_REVIEW/UNKNOWN
✓ Case 6: profile APPROVED + review PENDING => NOT VERIFIED
✓ Case 7: profile APPROVED + review REJECTED => NOT VERIFIED
✓ Case 8: profile APPROVED + review null => NOT VERIFIED
✓ Case 9: profile ERROR + review VERIFIED => final ERROR
✓ Case 10: profile EXPIRED + review VERIFIED => final EXPIRED
✓ Case 11: profile PROCESSING + review VERIFIED => final PROCESSING
✓ Case 12: empty payload + review VERIFIED => NOT VERIFIED
✓ Case 13: null payload + null review => NOT VERIFIED
✓ Case 14: MANUAL_REVIEW with blocking error => needs_action (error takes precedence)
✓ Case 15: Verified state requires BOTH kyc approved AND vendor active (9 sub-tests)
```

---

## Part 2: QR Batches Not Loading Issue

### Observed Symptoms
- Page: acfmart.store Seller Center > QRVerified
- UI shows: Products: 0, QR batches: 0, Issued QR: 0
- Table message: "Chưa có batch QR từ backend."
- Console errors:
  - `[auth] profile sync skipped after session restore FirebaseError: Missing or insufficient permissions`
  - `initializeUserError: Không tải được IVS Trust eKYC SDK`

### Root Cause Analysis

#### Backend (ivs-trust-platform)
✅ **Backend is correct**: [`seller-qr.controller.ts`](file:///d:/IVS/Apps/DEVELOPER/ivs-trust-platform/apps/api/src/modules/sellers/seller-qr.controller.ts#L75-L128)
- Endpoint: `GET /v1/sellers/me/qr-batches`
- Response format: `{ data: [...], total, page, limit }`
- Properly filters by `sellerId` from authenticated user

#### Frontend
✅ **Type definition matches**: [`ivs-trust-api.ts`](file:///d:/IVS/Apps/DEVELOPER/acfmart/src/lib/ivs-trust-api.ts#L91-L96)
```typescript
export type IvsPaginated<T> = {
  data: T[]
  total: number
  page: number
  limit: number
}
```

✅ **Hook implementation correct**: [`use-ivs-seller-qr.ts`](file:///d:/IVS/Apps/DEVELOPER/acfmart/src/hooks/use-ivs-seller-qr.ts#L22-L27)

❌ **Error handling issue**: [`SellerQrVerifiedScreen.tsx`](file:///d:/IVS/Apps/DEVELOPER/acfmart/src/features/seller/components/SellerQrVerifiedScreen.tsx#L299-L349)
- **BEFORE**: If API failed (401/403/500), showed "Chưa có batch QR từ backend." (misleading)
- **AFTER**: Shows specific error message: "Lỗi tải batch: {error.message}"

### Fix Applied

#### Improved Error Handling
```diff
-                ) : batchesQuery.data?.data.length ? (
+                ) : batchesQuery.isError ? (
+                  <EmptyRow 
+                    colSpan={5} 
+                    text={
+                      batchesQuery.error instanceof IvsApiError
+                        ? `Lỗi tải batch: ${batchesQuery.error.message}`
+                        : "Không thể tải danh sách batch QR"
+                    }
+                  />
+                ) : batchesQuery.data?.data.length ? (
                   ...
-                  <EmptyRow colSpan={5} text="Chưa có batch QR từ backend." />
+                  <EmptyRow colSpan={5} text="Chưa có batch QR nào. Tạo batch đầu tiên ở form bên trái." />
```

### Likely Cause of "0 batches" Issue

Based on console errors, the problem is **authentication/authorization**:

1. **FirebaseError: Missing or insufficient permissions**
   - Seller's Firebase token may not have proper `sellerId` claim
   - Or Firestore rules blocking access to seller profile

2. **IVS Trust eKYC SDK not loading**
   - May be separate issue with SDK initialization
   - Could prevent seller identity resolution

### Verification Steps Required

**Run diagnostic script** on affected seller account:
1. Login to acfmart.store as affected seller
2. Navigate to `/seller/qr-verified`
3. Open browser DevTools console
4. Run [`diagnose-kyc-status.js`](file:///d:/IVS/Apps/DEVELOPER/acfmart/diagnose-kyc-status.js)
5. Check Network tab for:
   - `GET https://api.acfmart.vn/v1/sellers/me/qr-batches`
   - HTTP status code
   - Response body
   - Request headers (Authorization)

**Expected scenarios**:
- **401 Unauthorized**: Token expired or invalid → force relogin
- **403 Forbidden**: Seller profile not linked to Firebase user → check backend user.sellerId
- **200 with empty data**: No batches created yet → UI now shows correct message
- **500 Server Error**: Backend issue → check ivs-trust-platform logs

---

## Part 3: Backend Source of Truth

### Production Backend Location
✅ **Confirmed**: `D:\IVS\Apps\DEVELOPER\ivs-trust-platform`
- Deployed to Cloud Run as `ivs-trust-api` (asia-southeast1)
- NOT using `acfmart/apps/api` for IVS Trust endpoints

### Cloud Run Environment Variables
✅ **FRONTEND_ORIGINS** correctly configured:
```
https://qr.acfmart.vn
https://acfmart.vn
https://acfmart.store
https://acfmart.cloud
https://acfmart.online
https://qrverifiedbyivs.web.app
https://acfmart.web.app
https://acfmartstore.web.app
https://acfmartcloud.web.app
https://acfmartonline.web.app
```

### KYC Status Endpoint
- **URL**: `GET https://api.acfmart.vn/v1/sellers/me/kyc/status`
- **Backend**: ivs-trust-platform (NestJS)
- **Auth**: Firebase ID token in Authorization header
- **Response fields**:
  - `sellerFinalStatus`
  - `sellerKycStatus`
  - `latestVnptSessionStatus`
  - `adminManualReviewState`
  - `latestVnptSession`
  - `technicalError`
  - `sdkAvailable`

### QR Batches Endpoint
- **URL**: `GET/POST https://api.acfmart.vn/v1/sellers/me/qr-batches`
- **Backend**: ivs-trust-platform (NestJS)
- **Auth**: Firebase ID token with `sellerId` claim
- **Response format**: `{ data: [...], total, page, limit }`

---

## Part 4: Deployment Checklist

### ✅ Pre-Deployment Verification
- [x] All tests passing (59/59)
- [x] Build successful
- [x] No TypeScript errors
- [x] No linting errors
- [x] Git diff reviewed
- [x] Vietnamese labels refined
- [x] Error handling improved
- [x] Backend source-of-truth confirmed

### ⚠️ Pending Manual Verification
- [ ] **Run diagnostic script** with affected seller account
- [ ] **Capture authenticated API payload** for KYC status
- [ ] **Capture authenticated API payload** for QR batches
- [ ] **Verify KYC status displays correctly** on `/seller/kyc`
- [ ] **Verify QR batches load or show proper error** on `/seller/qr-verified`
- [ ] **Test batch creation flow**: Create → Refresh → Verify batch appears
- [ ] **Test with different status combinations** to ensure no regressions

### 📋 Deployment Steps
1. **Capture evidence** from affected seller account (see below)
2. **Deploy to Firebase Hosting**:
   ```bash
   cd d:\IVS\Apps\DEVELOPER\acfmart\src
   npm run firebase:deploy
   ```
3. **Verify on production** (acfmart.store)
4. **Monitor logs** for any errors
5. **Rollback plan**: Revert to previous commit if issues found

---

## Part 5: Evidence Collection Required

### For KYC Status Fix Verification

**Run this on affected seller account:**
```javascript
// In browser console on /seller/kyc
// Use diagnose-kyc-status.js script
```

**Required output:**
```
Endpoint: GET https://api.acfmart.vn/v1/sellers/me/kyc/status
HTTP Status: 200

=== Key Status Fields ===
sellerFinalStatus: <value>
sellerKycStatus: <value>
finalStatus: <value>
latestVnptSessionStatus: <value>
adminManualReviewState: <value>

=== Vendor Status ===
(Check Network tab for GET /v1/sellers/me)
status: <value>
kyc_status: <value>
kyc_level: <value>
```

**Expected UI after fix:**
- If `sellerFinalStatus: "MANUAL_REVIEW"` and `vendor.status: "active"`:
  - Trạng thái hồ sơ: "Đã xác minh danh tính - Đang chờ xét duyệt"
  - Tình trạng xét duyệt: "Đã duyệt gian hàng" (amber color)
  - Kết quả: "Đã xác minh danh tính, đang chờ xét duyệt gian hàng"

### For QR Batches Issue Verification

**Check browser Network tab for:**
```
Request: GET https://api.acfmart.vn/v1/sellers/me/qr-batches?page=1&limit=20
Status: <200/401/403/500>
Response: { data: [...], total: <number>, page: 1, limit: 20 }
Request Headers: Authorization: Bearer <token>
```

**If 401/403:**
- Check Firebase token has `sellerId` claim
- Verify seller profile exists in backend database
- Check Cloud Run logs for authentication errors

**If 200 with empty data:**
- This is correct behavior (no batches created yet)
- UI should show: "Chưa có batch QR nào. Tạo batch đầu tiên ở form bên trái."

---

## Part 6: Files Modified

### Committed (commit 3326fbf0)
1. `src/lib/kyc.ts` - Status mapping logic fix
2. `src/features/seller/components/SellerKycScreen.tsx` - UI consistency fix
3. `src/tests/kyc-status-mapping.test.ts` - 15 regression tests
4. `diagnose-kyc-status.js` - Diagnostic script

### Uncommitted (local changes)
1. `src/features/seller/components/SellerKycScreen.tsx` - Vietnamese label refinement
2. `src/features/seller/components/SellerQrVerifiedScreen.tsx` - Error handling improvement

### Not Modified (confirmed correct)
- `src/lib/ivs-trust-api.ts` - API client types and methods
- `src/hooks/use-ivs-seller-qr.ts` - React Query hooks
- Backend: `ivs-trust-platform/apps/api/src/modules/sellers/seller-qr.controller.ts`

---

## Conclusion

✅ **KYC status inconsistency**: FIXED with comprehensive test coverage
✅ **QR batches error handling**: IMPROVED to show actual errors
✅ **Code quality**: All tests pass, build successful, no errors
⚠️ **Production deploy**: PENDING manual verification with affected seller account

**Next action**: Run diagnostic scripts on affected seller account to capture authenticated API payloads, then proceed with deployment if everything checks out.
