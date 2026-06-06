# 🔴 CRITICAL SECURITY NOTICE: VNPT Credentials Rotation Required

## Date: 2026-01-06
## Severity: HIGH
## Status: IMMEDIATE ACTION REQUIRED

---

## Issue Summary

VNPT eKYC credentials were exposed in browser network requests due to SDK 2.1.0 making direct calls to `https://api.idg.vnpt.vn/file-service/v1/addFile` with the following headers visible in browser DevTools:

- `Authorization`
- `Token-Id`
- `Token-Key`

### Exposure Details

- **SDK Version**: ekyc-web-sdk-2.1.0.js
- **Direct VNPT Endpoint**: `https://api.idg.vnpt.vn/file-service/v1/addFile`
- **Exposed Headers**: Authorization, Token-Id, Token-Key
- **Affected Users**: All sellers who completed KYC verification before 2026-01-06
- **Discovery Date**: 2026-01-06

---

## Actions Completed ✅

1. ✅ **Removed SDK 2.1.0** from seller KYC flow
2. ✅ **Migrated to SDK 3.2.1** with session-based authentication
3. ✅ **Eliminated all hardcoded VNPT URLs** from frontend code
4. ✅ **Removed TOKEN_ID, TOKEN_KEY, ACCESS_TOKEN** from frontend initialization
5. ✅ **Implemented backend proxy pattern**: All SDK calls now route through:
   - `https://api.acfmart.vn/v1/sellers/me/kyc/vnpt/sdk-proxy/*`
6. ✅ **Deployed fixed version** to Firebase Hosting (4 targets)
7. ✅ **Updated TypeScript interfaces** to mark token fields as deprecated/optional

---

## Required Actions 🚨

### 1. Rotate VNPT Credentials (IMMEDIATE)

Contact VNPT/IDG to rotate the following credentials:

- **TOKEN_ID**: Current value compromised - generate new
- **TOKEN_KEY**: Current value compromised - generate new  
- **ACCESS_TOKEN**: Current value compromised - generate new
- **API Secrets**: Any other shared secrets used for VNPT API authentication

**Contact**: VNPT/IDG API Support Team
**Reason**: Credentials were visible in browser Network tab for all KYC sessions

### 2. Audit VNPT API Access Logs

Review VNPT API access logs for the period from first KYC implementation to 2026-01-06:

- Check for unauthorized API calls using compromised credentials
- Identify any suspicious patterns or data access
- Document any potential data breaches

### 3. Update Backend Configuration

After receiving new credentials from VNPT:

1. Update backend environment variables:
   ```
   VNPT_TOKEN_ID=<new_token_id>
   VNPT_TOKEN_KEY=<new_token_key>
   VNPT_ACCESS_TOKEN=<new_access_token>
   ```

2. Restart backend services to pick up new credentials

3. Verify SDK proxy endpoint works with new credentials

### 4. Notify Affected Sellers (Optional)

Consider notifying sellers who completed KYC during the exposure period:

- Inform them of the security incident
- Assure them that personal data was not compromised
- Explain that credentials have been rotated
- No action required from sellers

---

## Technical Changes Made

### Frontend Changes

**File**: `src/features/seller/components/VnptEkycSdkModal.tsx`

- Changed SDK asset path from `/vnpt-ekyc` to `/vnpt-ekyc/v3.2.1`
- Removed loading of `ekyc-web-sdk-2.1.0.js` and related assets
- Now loads SDK 3.2.1:
  - `/vnpt-ekyc/v3.2.1/lib/VNPTBrowserSDKAppV4.1.0.js`
  - `/vnpt-ekyc/v3.2.1/lib/VNPTQRBrowserApp.js`
- Removed from SDK config:
  - `TOKEN_KEY: config.tokenKey`
  - `TOKEN_ID: config.tokenId`
  - `AUTHORIZION: config.accessToken`
- SDK now uses only `BACKEND_URL` pointing to our proxy

**File**: `src/lib/kyc.ts`

- Updated `VnptSdkConfig` interface:
  - `tokenId`, `tokenKey`, `accessToken` now optional
  - Added security comments marking them as deprecated

### Backend Requirements (Already Implemented)

The backend must have these endpoints working:

1. **Session Creation**:
   ```
   POST https://api.acfmart.vn/v1/sellers/me/kyc/vnpt/session
   ```
   Returns `sdkConfig.backendUrl` = proxy URL

2. **SDK Proxy**:
   ```
   POST https://api.acfmart.vn/v1/sellers/me/kyc/vnpt/sdk-proxy/file-service/v1/addFile
   ```
   - Receives SDK requests from frontend
   - Adds VNPT credentials server-side
   - Forwards to `https://api.idg.vnpt.vn/file-service/v1/addFile`
   - Returns response to frontend

---

## Verification Steps

After credential rotation, verify:

### 1. Browser Network Tab

Open DevTools > Network tab during KYC flow:

✅ **PASS**:
- `addFile` requests go to: `api.acfmart.vn/v1/sellers/me/kyc/vnpt/sdk-proxy/file-service/v1/addFile`
- NO requests to `api.idg.vnpt.vn` or `sandbox-idg.vnpt.vn`
- NO `Token-Id`, `Token-Key`, or `Authorization` headers visible

❌ **FAIL**:
- Any direct VNPT API calls
- Any VNPT credentials in headers

### 2. Test KYC Flow

1. Navigate to seller portal
2. Start KYC verification
3. Complete document capture
4. Complete face capture
5. Submit result

Expected: All API calls route through `api.acfmart.vn` proxy

### 3. Backend Logs

Check backend logs for SDK proxy endpoint:

- Requests should be logged
- Credentials should NOT appear in logs
- Upstream calls to VNPT should succeed with new credentials

---

## Security Best Practices Going Forward

1. **Never expose API credentials in frontend code**
2. **Always use backend proxy for third-party API calls**
3. **Regularly rotate credentials (every 90 days recommended)**
4. **Monitor network traffic for credential exposure**
5. **Use environment variables for all secrets**
6. **Audit dependencies that might make direct API calls**

---

## Related Files

- `src/features/seller/components/VnptEkycSdkModal.tsx` - SDK modal component
- `src/lib/kyc.ts` - KYC types and interfaces
- `src/lib/ivs-trust-api.ts` - API client for IVS Trust
- `public/vnpt-ekyc/v3.2.1/` - SDK 3.2.1 assets
- `functions/` - Backend proxy implementation (if using Firebase Functions)

---

## Questions?

Contact the development team for any questions about this security incident or the remediation steps.
