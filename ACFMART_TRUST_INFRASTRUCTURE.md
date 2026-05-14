# ACFMart Trust Infrastructure Documentation

## Overview

ACFMart is positioned as a "Trusted Commerce Platform" that addresses the critical trust deficit in Vietnamese e-commerce. Unlike traditional marketplaces focused on price and convenience, ACFMart differentiates through a multi-layer trust infrastructure.

## Strategic Positioning

Shopee wins with:
- Convenience + Price

TikTok Shop wins with:
- Attention + Creator

ACFMart wins with:
- **Trust Infrastructure**

## Trust Stack Architecture

```
Layer 7: Compliance + Audit
Layer 6: Affiliate Trust Scoring
Layer 5: Verified Logistics
Layer 4: Escrow Payment
Layer 3: QR Authentication
Layer 2: Seller Verification
Layer 1: Marketplace Core
```

## Implementation Roadmap

### Phase 1 (0-3 months): Foundation
- Ministry of Industry and Trade compliance
- Seller verification system (5-layer)
- QR verification system
- Escrow workflow
- GHN/GHTK integration
- VNPay/MoMo integration

### Phase 2 (3-9 months): Ecosystem
- Affiliate dashboard
- Creator economy platform
- Risk scoring system
- Fraud detection
- Dispute resolution center
- Seller analytics

### Phase 3 (9-18 months): Advanced Features
- Internal wallet system
- Buy Now Pay Later (BNPL)
- Loyalty system
- AI-powered moderation
- Dynamic trust scoring

## 1. Seller Verification Layer

ACFMart implements a stronger verification system than Shopee:

| Layer | Requirement | Description |
|-------|-------------|-------------|
| L1 | CCCD/VNeID | Identity verification |
| L2 | Business License | Legal entity verification |
| L3 | Bank Verification | Financial backing verification |
| L4 | Random Audit | Ongoing compliance checks |
| L5 | Brand Authorization | Official partnership verification |

### Implementation Details

The anti-counterfeit module already includes basic verification functionality:

```javascript
async verifyProduct(qrCode) {
  // Check if the QR code exists in the system
  // Return verification details
}
```

We need to extend this to include seller verification levels.

## 2. QR Trust System

The core differentiation of ACFMart - a complete lifecycle tracking system:

### QR Code Lifecycle Tracking
- Product manufacturing
- Warehouse intake
- Package preparation
- Pickup by courier
- Hub transit
- Delivery to customer
- Customer confirmation

### Implementation

The current implementation generates QR codes:

```javascript
async createQrCode(productId, batchNumber, serialNumber) {
  const qrCode = `ACF-${productId}-${batchNumber}-${serialNumber}-${Date.now()}`
  return qrCode
}
```

We need to enhance this to track the full lifecycle.

## 3. Escrow Payment System

Instead of immediate payment to sellers, ACFMart holds funds until:
- Product is delivered
- Buyer confirms authenticity via QR scan
- Satisfaction period expires

### Current Implementation

```javascript
async createEscrow(orderId, amount, currency, buyerId, sellerId, paymentMethod) {
  // Creates escrow record
}
```

## Help Center Structure

Based on the Shopee analysis, ACFMart should restructure its help center around trust:

| Help Category | Focus | Purpose |
|---------------|-------|---------|
| Safe Shopping | Anti-counterfeit | Protect buyers from fake products |
| QR Verification | Trust layer | Confirm product authenticity |
| Escrow & Payments | Secure transactions | Hold funds safely until delivery |
| Verified Sellers | Seller credibility | Ensure trustworthy merchants |
| Verified Logistics | Package integrity | Prevent tampering during shipping |
| Complaints & Compensation | Buyer protection | Resolve disputes effectively |
| Affiliate Policy | Content quality | Maintain ethical marketing |
| Data Policy | Compliance | Ensure privacy and legal compliance |
| Certification Process | Transparency | Show verification procedures |

## Key Differentiators from Shopee

### What to Learn from Shopee
- Effective affiliate and logistics UX
- Comprehensive help center structure
- User issue classification system

### What ACFMart Does Better
- Stronger trust and anti-counterfeit measures
- High-trust commerce infrastructure
- Multi-layer verification system
- QR-based authentication
- Escrow payment system

## Policies to Implement Early

### 1. Anti-Counterfeit Policy
- Reporting mechanism
- Processing SLA
- Seller freezing protocol
- Compensation fund
- Evidence workflow
- QR verification logs

### 2. Seller Risk Scoring
Weighted factors:
- QR compliance (high weight)
- Refund rate (high weight)
- Fake reports (very high weight)
- Delivery SLA (medium weight)
- Customer satisfaction (high weight)

### 3. Affiliate Moderation
- AI content scanning
- Anti-spam measures
- Anti-self-referral detection
- Delayed commission payout (T+7)

## Implementation Recommendations

### Immediate Actions (Phase 1)
1. Enhance the anti-counterfeit service to include seller verification levels
2. Extend QR tracking to include full lifecycle
3. Improve escrow service with conditional release mechanisms
4. Create comprehensive help center content focused on trust
5. Implement seller risk scoring system

### Seller Verification Enhancement

We should modify the anti-counterfeit service to include seller verification:

```javascript
// Example of enhanced verification
async verifySellerLevel(userId, level) {
  switch(level) {
    case 1:
      // Verify identity document
      return await this.verifyIdentity(userId);
    case 2:
      // Verify business license
      return await this.verifyBusinessLicense(userId);
    case 3:
      // Verify bank account
      return await this.verifyBankAccount(userId);
    // ... additional levels
  }
}
```

### QR Lifecycle Enhancement

Extend the QR verification to include tracking:

```javascript
// Example of lifecycle tracking
async trackQrLifecycle(qrCode, event, location, actor) {
  // Record the movement of the product
  return await this.recordMovement(qrCode, event, location, actor);
}
```

### Escrow Condition Enhancement

Modify escrow release to require verification:

```javascript
// Example of conditional release
async releasePaymentOnVerification(escrowId, buyerId) {
  // Check if buyer confirmed authenticity via QR scan
  // Then release payment
}
```

## Conclusion

ACFMart's success depends on building a robust trust infrastructure that differentiates it from competitors. By focusing on verification, escrow, and anti-counterfeit measures, ACFMart can capture the market segment that prioritizes safety and authenticity over price alone.

The key is to implement these features systematically, starting with the foundational elements in Phase 1, then expanding to more sophisticated systems in later phases. The help center should be organized around trust topics rather than generic e-commerce functions, emphasizing the verification and safety aspects that make ACFMart unique.