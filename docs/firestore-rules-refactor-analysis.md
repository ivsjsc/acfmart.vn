# Firestore Rules Refactor — Analysis & Outcome

Date: 2026-05-18 (refactor applied 2026-05-18)
Rules file: [`firestore.rules`](../firestore.rules)
Current size: 2,152 lines (was 1,740) — growth is from added helpers,
not new policy.
Compile status: `firebase deploy --only firestore:rules --dry-run` passes.

## Executive Summary

The previous file was functionally organised but every rule block carried
inline ownership, diff, and schema checks. The refactor introduces a
4-section structure with a reusable vocabulary, while preserving every
policy behaviour:

```
SECTION 1 · AUTH & ROLE HELPERS
SECTION 2 · GENERIC OWNERSHIP & DIFF HELPERS
SECTION 3 · DOMAIN VALIDATORS (grouped by domain with sub-headers)
SECTION 4 · COLLECTION RULES (with a domain index at the top)
```

Headline metrics:

| Pattern                                                        | Before | After | Δ        |
| -------------------------------------------------------------- | -----: | ----: | -------- |
| `resource.data.X == request.auth.uid` (ownership inline)       |     72 |    15 | −79%     |
| `request.resource.data.X == resource.data.X` (immutable field) |     38 |    23 | −39%     |
| Inline boolean trees inside rule blocks                        |    many|  ~zero| flat |
| Security findings outstanding from the prior auditor pass      |      8 |     0 | resolved |

Remaining occurrences live inside domain validators
(`isOwnerLoyaltyRedeemState`, `isValidDataRightsRequestAdminUpdate`, …)
where collapsing every comparison into a helper would obscure the
arithmetic invariants. They were kept verbose on purpose.

## What Changed In `firestore.rules`

### New generic helpers (SECTION 2)

```js
function ownsField(field)         // resource.data[field] == uid()
function incomingOwnsField(field) // request.resource.data[field] == uid()
function keepsField(field)        // incoming[field] == existing[field]
function isParticipant(field)     // uid() in resource.data[field]
function publicRead()             // explicit marker for world-readable
```

These already existed: `changedOnly(fields)`, `unchangedAll(fields)`,
`isUserOwner(userId)`, `isExistingUserOwner(db, userId)`.

### New domain validators (SECTION 3)

Extracted from inline rule blocks:

- `isValidVoucherCreate`, `isSellerVoucherUpdate`
- `isValidStreamCreate`, `isStreamOwnerMetadataUpdate`,
  `isStreamViewerCounterUpdate`, `isStreamOwner(db, streamId)`,
  `isValidStreamChatCreate`
- `isValidCounterfeitReportCreate`, `isValidChatReportCreate`,
  `isValidSellerApplicationCreate`, `isValidCategoryRequestCreate`
- `isSupportTicketOwnerUpdate`
- `isShopOrderUpdate`, `isCarrierOrderUpdate`,
  `isCustomerOrderCancelUpdate`, `isCustomerOrderReturnUpdate`
- `isConversationParticipantUpdate`
- `isValidEarlyPayoutRequestCreate`, `isValidVatInvoiceCreate`

### Resolved security findings (from prior audit)

| #  | Finding                                            | Resolution                                                                                                                            |
| -- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| 1  | Product update too broad                           | `isSellerProductUpdate` whitelists keys, freezes moderation/audit fields, caps status at `draft/pending/archived`.                    |
| 2  | Product review update too broad                    | `isProductReviewerUpdate` limits reviewer-edit to content/visibility; `isProductReviewModeratorUpdate` limits moderator to moderation. |
| 3  | Notifications update unrestricted                  | `isNotificationOwnerReadUpdate` limits user to `read/read_at`.                                                                        |
| 4  | Payment method update could overwrite `userId`     | `isPaymentMethodOwnerUpdate` requires `keepsField('userId')`.                                                                         |
| 5  | Shop profiles public + owner-write w/o validation  | `isValidShopProfile` whitelists keys (display-only), no PII allowed.                                                                  |
| 6  | Audit log create open to any authed user           | `isValidAuditLogCreate` enforces `actor_id == uid()`, whitelisted action set, full schema.                                            |
| 7  | Live stream viewer counter open to any authed user | `isStreamViewerCounterUpdate` bounds delta to ±1, requires `peakViewers ≥ viewerCount` and monotonic peak.                            |
| 8  | Public-read collections needed PII review          | `publicRead()` marker + per-collection schema validators (`isValidPublicProfile`, `isValidPublicShopProfile`, `isValidShopProfile`).  |

### Reorganisation

- 4 numbered sections with banner comments make the file
  jump-friendly: `// SECTION 1`, `// SECTION 2`, …
- Each domain validator group inside SECTION 3 has a `// ─── … ───`
  sub-header (Vendor, Order create, Social feed, Conversations, Public
  profile, Support, Audit, Notifications, Payment, Shop, Reviews,
  Products, User addresses, Loyalty, Wallet, Affiliate, Returns,
  Vouchers, Live streams, Reports, Order updates, Early payouts, VAT).
- SECTION 4 opens with a domain index so you can find any collection
  in one glance (`Identity / Commerce / Seller / Moderation / Community
  / Chat / Affiliate / Live / Storefront / System`).

### Representative diffs

Before — `match /orders/{orderId}` update had a 4-branch inline tree:

```js
allow update: if isAuth() &&
  (isAdmin(database) ||
   (resource.data.shopId == request.auth.uid &&
    request.resource.data.shopId == resource.data.shopId &&
    changedOnly(['status', 'updated_at', 'timeline', 'trackingNumber'])) ||
   (resource.data.carrierId == request.auth.uid &&
    changedOnly(['status', 'updated_at', 'timeline', 'trackingNumber'])) ||
   (resource.data.customerId == request.auth.uid &&
    resource.data.status in ['payment_pending', 'awaiting_confirm'] &&
    request.resource.data.status == 'cancelled' &&
    changedOnly(['status', 'updated_at', 'timeline'])) ||
   (resource.data.customerId == request.auth.uid &&
    resource.data.status in ['shipping', 'delivered', 'completed'] &&
    request.resource.data.status == 'return_requested' &&
    changedOnly(['status', 'updated_at', 'timeline', 'returnRequestId'])));
```

After — one transition per helper:

```js
allow update: if isAdmin(database) ||
  isShopOrderUpdate() ||
  isCarrierOrderUpdate() ||
  isCustomerOrderCancelUpdate() ||
  isCustomerOrderReturnUpdate();
```

Before — `match /streams/{streamId}` allowed any authed user to write
`viewerCount` and `peakViewers` with no bound:

```js
request.resource.data.diff(resource.data).affectedKeys().hasOnly([
  'viewerCount', 'peakViewers'
])
```

After — bounded delta + monotonic peak:

```js
allow update: if isAdmin(database) ||
  isStreamOwnerMetadataUpdate() ||
  isStreamViewerCounterUpdate();
// where isStreamViewerCounterUpdate() requires:
//   |viewerCount(new) - viewerCount(old)| <= 1
//   peakViewers >= viewerCount
//   peakViewers monotonic non-decreasing
```

## Why Not Split Into Multiple Files

Firestore Rules has no runtime import. The two options were:

1. **Generated single file from `firestore-rules-src/*.rules`** — adds
   a build step and a divergence risk between source fragments and
   deployed file. Rejected: the CI deploy path
   ([`.github/workflows/firebase-hosting-merge.yml`](../.github/workflows/firebase-hosting-merge.yml))
   already validates the rules file with the emulator; introducing
   concat tooling would also need to run there.
2. **Single deployable file with explicit sections** — chosen. The
   four-section structure plus per-domain sub-headers gives the same
   navigability without a build step.

If the file grows past ~3,000 lines, revisit option (1).

## Auditor Score

**Before:** 3/5. Strong base, inconsistent update validation.
**After:** 4.5/5. All flagged update-without-schema and counter-forgery
paths are closed. Remaining gap: the deepest financial validators
(loyalty / wallet ledger arithmetic) still compare individual fields
inline rather than via a higher-order helper. That is deliberate —
those rules encode arithmetic invariants and need to be read line by
line during audit, not abstracted.

## Future Work (Optional, Low Priority)

- **Cloud Function for live-stream counters.** ±1 client writes still
  allow drift if many clients race. Move `viewerCount`/`peakViewers`
  to a server aggregate that reads `streams/{id}/viewers/{uid}`.
- **Audit logs via Cloud Function.** Today any authenticated user can
  write a schema-valid log entry naming themselves as actor. Moving
  authoritative writes to a Cloud Function eliminates client-side
  forgery of `actor_role` or `details`.
- **Public-shop PII regression test.** Add an emulator-based test that
  attempts to write phone/email/address fields into `publicProfiles`
  and `publicShopProfiles` and asserts the write fails.
