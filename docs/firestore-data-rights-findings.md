# Firestore Data Rights Findings

Date: 2026-05-18

Scope: account privacy controls and PDPD data subject requests for `/account/settings?tab=privacy`.

Firestore database:
- Project: `ecommerce-acf`
- Database: `(default)`
- Edition: `STANDARD`
- Type: `FIRESTORE_NATIVE`
- Location: `asia-southeast1`

New paths:
- `users/{uid}/privacySettings/current`
- `users/{uid}/dataRightsRequests/{requestId}`

Access model:
- The authenticated owner can read their own privacy settings and data-rights requests.
- The authenticated owner can create/update only `privacySettings/current`.
- The authenticated owner can create data-rights requests with status `pending`.
- Admin/owner roles can read and process request status.
- Users cannot write role, admin, or cross-user permission fields through these paths.

Queries added:
- `users/{uid}/dataRightsRequests` ordered by `created_at desc`, limited to 10.

Validation notes:
- Privacy settings are strict boolean fields plus `user_id`, `policy_version`, and timestamps.
- Data-rights requests are strict enum types/status values with bounded strings.
- Admin updates are limited to `status`, `admin_note`, `updated_at`, and `processed_at`.

Targeted attack review for the new paths:
- Public list exploit: denied because every new rule requires authenticated owner or admin.
- Unauthorized read/write: denied by `isExistingUserOwner(database, userId)` and admin checks.
- Update bypass/schema pollution: denied by `keys().hasOnly(...)` validators on settings and requests.
- Ownership hijacking: denied because `user_id` must equal the path `userId`; admin request updates must keep it unchanged.
- Immutable field modification: admin request updates cannot change `type`, `description`, `contact_email`, `policy_version`, `source`, or `created_at`.
- Type juggling: denied by boolean, enum, string-length, and timestamp checks.
- Resource exhaustion: bounded `description`, `contact_email`, `policy_version`, and `admin_note` strings.
- Required omission: denied by `keys().hasAll(...)` validators.
- Privilege escalation: new paths contain no role/admin fields and do not affect `/users/{uid}.role`.
- Orphaned subcollection access: denied for owners when the parent `users/{uid}` document does not exist.
- Query mismatch: `dataRightsRequests` owner list query is allowed by path ownership and does not require composite indexes.
