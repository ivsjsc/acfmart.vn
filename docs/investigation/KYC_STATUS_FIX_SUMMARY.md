# Seller Verification Status Inconsistency - Fix Summary

## Issue Description

On acfmart.store seller verification page (`/seller/kyc`), the UI showed inconsistent states:
- **Profile status / Trạng thái hồ sơ**: "Cần kiểm tra lại" (Needs review)
- **Review status / Tình trạng xét duyệt**: "Đã xác thực" (Verified)
- **Result / Kết quả**: "Đã xác thực" (Verified)

This created confusion where the seller appeared partially verified but also fully verified at the same time.

## Root Cause

The bug was in the status mapping logic in [`src/lib/kyc.ts`](file:///d:/IVS/Apps/DEVELOPER/acfmart/src/lib/kyc.ts#L396-L468):

### Before Fix
```typescript
// Line 407-420 (OLD CODE)
if (
  (finalStatus === "APPROVED" || finalStatus === "MANUAL_REVIEW") &&  // ❌ BUG
  !hasBlockingError &&
  sessionStatus !== "ERROR" &&
  sessionStatus !== "TECHNICAL_ERROR" &&
  sessionStatus !== "REJECTED"
) {
  return {
    state: "verified",
    label: "Đã xác thực",  // ← Shows "verified" even for MANUAL_REVIEW
    badge: "ĐÃ XÁC THỰC",
    ...
  }
}
```

**Problem**: `MANUAL_REVIEW` status was being treated as "verified", when it actually means "eKYC identity verified, but profile still needs human review".

Additionally, the "Kết quả" (Result) row in [`SellerKycScreen.tsx`](file:///d:/IVS/Apps/DEVELOPER/acfmart/src/features/seller/components/SellerKycScreen.tsx#L424) only checked `vendor.status === "active"` without considering the KYC profile status.

## Solution

### 1. Fixed Status Mapping Logic ([kyc.ts](file:///d:/IVS/Apps/DEVELOPER/acfmart/src/lib/kyc.ts))

**New canonical rule**: Show "Đã xác thực" (Verified) ONLY when BOTH conditions are met:
1. ✅ KYC final status = `APPROVED` (not `MANUAL_REVIEW`)
2. ✅ Vendor status = `active` (seller review approved)
3. ✅ No blocking technical errors

```typescript
// Line 406-428 (NEW CODE)
const isKycApproved = finalStatus === "APPROVED"
const isVendorApproved = vendorStatus?.toLowerCase() === "active"

// Verified: Only if KYC is fully approved AND vendor is active AND no blocking error
if (
  isKycApproved &&
  isVendorApproved &&
  !hasBlockingError &&
  sessionStatus !== "ERROR" &&
  sessionStatus !== "TECHNICAL_ERROR" &&
  sessionStatus !== "REJECTED"
) {
  return {
    state: "verified",
    label: "Đã xác thực",
    badge: "ĐÃ XÁC THỰC",
    ...
  }
}

// NEW: Handle MANUAL_REVIEW separately
if (
  finalStatus === "MANUAL_REVIEW" ||
  (isKycApproved && !isVendorApproved)
) {
  return {
    state: "processing",
    label: "Đã xác minh danh tính - Đang chờ xét duyệt",
    badge: "ĐANG CHỜ XÉT DUYỆT",
    levelLabel: "eKYC đã xác minh, hồ sơ đang được kiểm tra",
    ...
  }
}
```

### 2. Fixed UI Consistency ([SellerKycScreen.tsx](file:///d:/IVS/Apps/DEVELOPER/acfmart/src/features/seller/components/SellerKycScreen.tsx#L419-L437))

**"Tình trạng xét duyệt" (Review status)**:
- Now shows amber color when `vendor.status === "active"` BUT `kycUiState.state !== "verified"`
- This visually indicates that vendor is active but KYC is not fully verified

**"Kết quả" (Result)**:
```typescript
// Before
value={vendor.status === "active" ? "Đã xác thực" : "Chưa hoàn tất"}

// After
value={
  kycUiState.state === "verified" && vendor.status === "active"
    ? "Đã xác thực"
    : kycUiState.state === "processing" && finalStatus === "MANUAL_REVIEW"
    ? "Đã xác minh danh tính, đang chờ xét duyệt gian hàng"
    : "Chưa hoàn tất"
}
```

### 3. Error Priority Fix

Moved blocking error check BEFORE `MANUAL_REVIEW` check to ensure technical errors always take precedence:

```typescript
// CRITICAL: Check blocking errors FIRST
if (
  hasBlockingError ||
  finalStatus === "TECHNICAL_ERROR" ||
  finalStatus === "ERROR" ||
  sessionStatus === "ERROR" ||
  sessionStatus === "TECHNICAL_ERROR"
) {
  return {
    state: "needs_action",
    label: "Cần kiểm tra lại",
    ...
  }
}
```

## Status Mapping Table

| KYC Status | Vendor Status | Final UI State | Label | Badge |
|------------|--------------|----------------|-------|-------|
| APPROVED | active | ✅ verified | Đã xác thực | ĐÃ XÁC THỰC |
| APPROVED | pending | ⏳ processing | Đã xác minh danh tính - Đang chờ xét duyệt | ĐANG CHỜ XÉT DUYỆT |
| APPROVED | rejected | ⏳ processing | Đã xác minh danh tính - Đang chờ xét duyệt | ĐANG CHỜ XÉT DUYỆT |
| APPROVED | null | ⏳ processing | Đã xác minh danh tính - Đang chờ xét duyệt | ĐANG CHỜ XÉT DUYỆT |
| MANUAL_REVIEW | active | ⏳ processing | Đã xác minh danh tính - Đang chờ xét duyệt | ĐANG CHỜ XÉT DUYỆT |
| MANUAL_REVIEW | pending | ⏳ processing | Đã xác minh danh tính - Đang chờ xét duyệt | ĐANG CHỜ XÉT DUYỆT |
| REJECTED | active | ⚠️ needs_action | Cần kiểm tra lại | CẦN KIỂM TRA |
| REJECTED | pending | ⚠️ needs_action | Cần kiểm tra lại | CẦN KIỂM TRA |
| PROCESSING | active | ⏳ processing | Đang xác thực | ĐANG XÁC THỰC |
| TECHNICAL_ERROR | active | ⚠️ needs_action | Cần kiểm tra lại | CẦN KIỂM TRA |
| EXPIRED | active | ⚠️ needs_action | Cần kiểm tra lại | CẦN KIỂM TRA |
| null/empty | active | ⚠️ needs_action | Cần kiểm tra lại | CẦN KIỂM TRA |
| null/empty | null | 📝 not_started | Chưa xác thực | CHƯA XÁC THỰC |

## Files Modified

1. **[`src/lib/kyc.ts`](file:///d:/IVS/Apps/DEVELOPER/acfmart/src/lib/kyc.ts)** - Core status mapping logic
   - Modified `getSellerKycUiState()` function (lines 396-503)
   - Added explicit check for both KYC approval AND vendor active status
   - Added new handling for `MANUAL_REVIEW` state
   - Reordered error checking to take precedence

2. **[`src/features/seller/components/SellerKycScreen.tsx`](file:///d:/IVS/Apps/DEVELOPER/acfmart/src/features/seller/components/SellerKycScreen.tsx)** - UI component
   - Modified "Tình trạng xét duyệt" tone logic (lines 421-428)
   - Modified "Kết quả" value logic (lines 429-437)

3. **[`src/tests/kyc-status-mapping.test.ts`](file:///d:/IVS/Apps/DEVELOPER/acfmart/src/tests/kyc-status-mapping.test.ts)** - NEW comprehensive test suite
   - 15 regression tests covering all status combinations
   - Tests ensure "verified" only shows when BOTH KYC and vendor are approved
   - Tests cover edge cases (null values, errors, expired sessions)

## Test Results

✅ All 15 new regression tests pass:
```
✓ Case 1: profile NEEDS_REVIEW + review VERIFIED => final NEEDS_REVIEW (not VERIFIED)
✓ Case 2: profile VERIFIED + review VERIFIED => final VERIFIED
✓ Case 3: profile PENDING + review VERIFIED => final PENDING/SYNC_PENDING
✓ Case 4: profile REJECTED + review VERIFIED => final REJECTED
✓ Case 5: missing/null profile status + review VERIFIED => final NEEDS_REVIEW/UNKNOWN (not VERIFIED)
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

✅ All 3 existing seller-kyc-screen tests still pass

## Verification Steps

To verify the fix on the affected seller account:

1. **Deploy the changes** to production (acfmart.store)

2. **Login as the affected seller** and navigate to `/seller/kyc`

3. **Expected behavior**:
   - If `kycStatus = MANUAL_REVIEW` and `vendor.status = active`:
     - **Trạng thái hồ sơ**: "Đã xác minh danh tính - Đang chờ xét duyệt"
     - **Tình trạng xét duyệt**: "Đã xác thực" (with amber color, not green)
     - **Kết quả**: "Đã xác minh danh tính, đang chờ xét duyệt gian hàng"
   
   - If `kycStatus = APPROVED` and `vendor.status = active`:
     - **Trạng thái hồ sơ**: "Đã xác thực"
     - **Tình trạng xét duyệt**: "Đã xác thực" (with green color)
     - **Kết quả**: "Đã xác thực"

4. **Diagnostic script** (optional): Run [`diagnose-kyc-status.js`](file:///d:/IVS/Apps/DEVELOPER/acfmart/diagnose-kyc-status.js) in browser console to capture API response

## Notes

- ✅ No backend changes required (fix is purely frontend)
- ✅ No CORS/env/deployment changes needed
- ✅ No changes to unrelated Seller Center modules
- ✅ Conflict is resolved by logic, not just text label changes
- ✅ Regression tests prevent future regressions

## Next Steps

1. Deploy to staging/production
2. Verify with affected seller account
3. Monitor for any edge cases not covered by tests
4. Consider adding backend validation to ensure `sellerFinalStatus` is always set correctly
