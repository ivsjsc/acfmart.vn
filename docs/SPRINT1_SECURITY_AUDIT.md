# Sprint 1 Security Audit

Audit date: 2026-05-17

## Data flow mapping

### 1. Mua hàng thành công

| Step | Event / trigger | Collection | Fields changed | Security condition |
| --- | --- | --- | --- | --- |
| Buyer submits checkout | Client creates one order per shop | `orders/{orderId}` | `customerId`, `shopId`, `items`, `subtotal`, `shippingFee`, `codFee`, `total`, `paymentStatus`, `status`, `timeline` | Buyer can only create their own order. COD starts as `paymentStatus=cod/status=awaiting_confirm`; online starts as `paymentStatus=pending/status=payment_pending`. Client cannot create `paid`. |
| Payment confirmed | Payment webhook/admin updates order | `orders/{orderId}` | `paymentStatus=paid`, `status=awaiting_confirm`, payment reference fields if available | Must be backend/admin only. Rules do not allow buyer to set `paid`. |
| Seller escrow created | Cloud Function `orders/{orderId}` created/updated where `paymentStatus` becomes `paid` | `sellerTransactions`, `sellerBalances/{shopId}`, `financeProcessed/{kind_orderId}` | `order_revenue`, `commission`, `payment_gateway`, `pendingBalance`, `totalLifetimeRevenue`, `totalFeesPaid` | Idempotency document is created atomically before ledger writes. |
| Delivery completed | Cloud Function sees `status` change to `delivered` or `completed` | `sellerBalances/{shopId}` | `pendingBalance -= net`, `holdBalance += net`, `nextPayoutAt` | Trigger only once per order via `financeProcessed`. |
| Loyalty earn | Backend should run after paid/completed order | `users/{uid}/loyaltyTransactions/{id}`, `users/{uid}/loyaltyState/current` | `type=earn`, positive `points`, `balance`, `total_earned`, `lifetime_spend` | Must be backend/admin. Current client rules only allow user `redeem`, not self-credit. |
| Affiliate commission | Backend should run after paid order with valid affiliate link | `users/{affiliateUid}/affiliateTransactions/{id}`, `users/{affiliateUid}/affiliateProfile/current`, `affiliateLinks/{linkId}` | `amount`, `pending_commission`, `lifetime_commission`, `conversions`, `total_commission` | Must be backend/admin. Users can create links but cannot set commission rate or write referrals/commission. |

### 2. Hoàn tiền / trả hàng

| Step | Event / trigger | Collection | Fields changed | Security condition |
| --- | --- | --- | --- | --- |
| Buyer requests return | Client creates/updates return request flow | `orders/{orderId}` or return request collection if added later | `status=return_requested`, reason/evidence fields | Should be restricted to order owner and pre-refund statuses. |
| Admin approves refund | Backend/admin updates order | `orders/{orderId}` | `paymentStatus=refunded`, `status=refunded` | Buyer/seller cannot mark refunded directly. |
| Seller ledger reversed | Cloud Function sees `paymentStatus` change to `refunded` | `sellerTransactions`, `sellerBalances/{shopId}`, `financeProcessed` | transaction `type=refund`, `amount=-net`, `pendingBalance -= net`, `totalLifetimeRevenue -= net` | Idempotent; should also account for already moved hold/available balances in the next hardening pass. |
| Loyalty reversed | Backend writes reversal | `users/{uid}/loyaltyTransactions`, `users/{uid}/loyaltyState/current` | negative adjustment or refund transaction, `balance`, `total_earned`/`total_redeemed` | Must be backend/admin; no user self-debit/credit except controlled redeem. |
| Affiliate reversed | Backend writes reversal | `users/{affiliateUid}/affiliateTransactions`, `affiliateLinks/{linkId}` | negative adjustment, `pending_commission`, `total_commission` | Must be backend/admin. |

### 3. Rút tiền ví

| Step | Event / trigger | Collection | Fields changed | Security condition |
| --- | --- | --- | --- | --- |
| User requests withdraw | Client transaction | `users/{uid}/walletTransactions/{id}` | `type=withdraw`, negative `amount`, `balance`, `status=pending`, `method`, `idempotency_key` | Rules require matching wallet state mutation in the same request. |
| Balance locked | Same client transaction | `users/{uid}/walletState/current` | `balance -= amount`, `locked_balance += amount`, `total_withdrawn += amount`, `last_transaction_id` | Rules verify no negative balance and transaction amount matches state delta. |
| Admin approves/pays | Backend/admin | `users/{uid}/walletTransactions/{id}`, payment provider records | `status=completed`, payout reference | User cannot update completed state. |
| Admin rejects | Backend/admin | `users/{uid}/walletTransactions/{id}`, `walletState/current` | `status=failed/rejected`, unlock balance | Must be backend/admin and transactional. |

## Code verification

| File | Risk | Status |
| --- | --- | --- |
| `src/features/checkout/components/CheckoutScreen.tsx` | Client marked non-COD orders as `paid`. | Fixed: online orders now start as `pending`. |
| `src/lib/order-service.ts` | Multi-shop orders were written sequentially and accepted weak amount/payment input. | Fixed: batch write plus validation for customer/order ids, item price/quantity, money fields, COD vs online payment status. |
| `src/lib/wallet-service.ts` | Amount validation allowed decimals and no upper bound. | Fixed: integer, 1,000 VND increment, min 10,000, max 50,000,000. |
| `src/lib/affiliate-service.ts` | Client could request custom `commission_bps` when creating a link. | Fixed: user-created links now always store `commission_bps=null`; backend/profile default controls rate. |
| `functions/src/finance.ts` | Idempotency check used read-then-write and could double-process concurrent retries. | Fixed: `financeProcessed` uses atomic `create`. |
| `src/lib/affiliate-service.ts` | `recordAffiliateCommission` is still present in client code. | Must move behind backend/Admin SDK call before enabling order-driven affiliate automation. Firestore rules block normal users from writing commission records. |
| `src/lib/order-processing-service.ts` | Stubbed timeline/refund behavior remains. | Treat as demo-only until replaced by real backend workflow. |
| `src/features/seller/components/SellerAnalyticsScreen.tsx`, `src/features/seller/components/SellerShopScreen.tsx` | Seller screens still consume seller mock fixtures. | Outside completed Firestore refactor scope; keep tracked for Sprint 2 cleanup. |

## Critical test scenarios

1. Self-credit wallet hack: from a non-admin account, try to update `users/{uid}/walletState/current.balance` directly to a higher number. Expected: denied.
2. Fake paid order hack: from buyer account, create `orders/{id}` with `paymentStatus=paid`. Expected: denied; valid online order with `paymentStatus=pending` succeeds.
3. Invalid wallet withdraw: create `walletTransactions/{id}` with `amount=-50000` but no matching `walletState` update, or mismatch the delta. Expected: denied.
4. Affiliate leak/write: user A tries to read/write user B affiliate link/referral or set `commission_bps=10000` on a new link. Expected: denied for B data; new link with custom commission denied.
5. Refund/idempotency: mark an already processed paid order as refunded twice or replay the function. Expected: only one refund ledger write and one `financeProcessed/order_refunded_*` record.
