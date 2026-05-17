Firestore Batch 2 findings

Target: ecommerce-acf / (default), STANDARD, Firestore Native.

New client access paths introduced in Sprint 1 Batch 2:
- affiliateLinks
- users/{uid}/affiliateProfile/current
- users/{uid}/affiliateTransactions/{transactionId}
- users/{uid}/loyaltyState/current
- users/{uid}/loyaltyTransactions/{transactionId}
- users/{uid}/walletState/current
- users/{uid}/walletTransactions/{transactionId}
- users/{uid}/walletClaims/{claimId}
- users/{uid}/addresses/{addressId}
- globalSettings/{settingId}

Query patterns:
- affiliateLinks where affiliate_id == uid, limit
- affiliateLinks where affiliateId == uid, limit (legacy compatibility)
- users/{uid}/loyaltyTransactions orderBy created_at desc, limit
- users/{uid}/walletTransactions orderBy created_at desc, limit
- users/{uid}/addresses orderBy created_at desc, limit
- users/{uid}/affiliateTransactions limit

Rules risk notes:
- User-owned reads must be scoped to request.auth.uid.
- Users must not self-credit wallet/loyalty/affiliate balances.
- Owner-created wallet transactions are limited to topup intents and withdraw requests.
- Loyalty owner writes are limited to redeem transactions and balance decreases.
- Affiliate owner writes are limited to creating links with zero metrics; commission/ledger writes are admin-only.
- Wallet claim credit still requires backend/admin finalization for balance crediting.
