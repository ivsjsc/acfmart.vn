# Firestore KYC Notes

Scope:
- `vendors/{vendorId}` now carries KYC summary fields: `kyc_status`, `kyc_provider`, `kyc_application_id`, `kyc_verified_at`.
- `kycApplications/{applicationId}` stores the eKYC lifecycle and is readable only by the owner (`firebase_uid`) or moderators.
- `auditLogs/{logId}` includes KYC audit events from the backend.

Query patterns used by the app:
- Owner KYC history: `where("firebase_uid", "==", uid)` with client-side sorting.
- Existing seller moderation queries remain unchanged.

Security posture:
- Client writes to KYC applications are denied.
- Cloud Functions admin SDK is the only writer for KYC application state and webhook updates.
- KYC uploads, if used, are isolated under `kyc-docs/{userId}` with owner-only access.

