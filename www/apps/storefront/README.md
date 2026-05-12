# ACF Anti-Counterfeit E-commerce Platform - Customer Storefront

This is the customer-facing storefront application for the ACF Anti-Counterfeit E-commerce Platform. The application is designed to provide a secure and trustworthy shopping experience with built-in anti-counterfeit measures.

## Features Implemented

### 1. Multi-role Interface
- Customer, Shop Owner, Moderator, Carrier, and Admin interfaces
- Role-based access control
- VNeID authentication (simulated in demo)

### 2. Anti-Counterfeit Verification
- QR code scanning functionality
- Product authenticity verification
- Counterfeit reporting mechanism

### 3. Escrow Payment System
- Secure payment holding
- Fund release mechanism
- Refund capabilities
- Order tracking

## Implementation Plan Based on Requirements

### Phase 0: Legal & Preparation (1-2 months)
- [ ] Register e-commerce platform with Ministry of Industry and Trade
- [ ] Conduct data privacy impact assessment (Decree 13/2023/ND-CP)
- [ ] Draft platform regulations and terms of service
- [ ] Submit VNeID integration request to C06 Center

### Phase 1: MVP Production (2-3 months)
- [ ] Separate Customer App / Seller Center / Admin Portal
- [ ] Integrate VNPay sandbox (payments + Escrow)
- [ ] Integrate GHN API (shipping)
- [ ] Implement core features (Product Detail, Cart, Checkout, Search)
- [ ] Deploy Cloud Functions (Escrow auto-release, notifications)
- [ ] Security audit + Firestore rules
- [ ] UAT with payment and shipping partners

### Phase 2: Advanced Features (2-3 months)
- [ ] VNeID integration (after C06 approval)
- [ ] Additional payment methods (MoMo, ZaloPay)
- [ ] Additional shipping partners (Viettel Post, GHTK)
- [ ] Direct escrow agreement with banks
- [ ] Real QR codes for products
- [ ] AI counterfeit detection (using Gemini)
- [ ] Mobile app (React Native)

### Phase 3: Expansion (3-6 months)
- [ ] Partnership with SICPA (international anti-counterfeit tech)
- [ ] Integration with government agencies (Market Management, Customs)
- [ ] Blockchain traceability
- [ ] Regional expansion (Southeast Asia)
- [ ] Electronic invoicing system

## Technical Architecture

The storefront connects to the Medusa.js backend and implements the following features:

1. **Frontend**: React-based application with TypeScript
2. **Authentication**: VNeID integration for identity verification
3. **Payments**: Escrow system with multiple payment gateways
4. **Shipping**: Integration with major Vietnamese logistics providers
5. **Anti-counterfeit**: QR code verification and blockchain tracking
6. **Security**: Firebase security rules, rate limiting, 2FA for admins

## Running the Application

1. Install dependencies:
   ```bash
   cd www/apps/storefront
   yarn install
   ```

2. Run the development server:
   ```bash
   yarn dev
   ```

3. Access the application at http://localhost:3000

## Legal Compliance

This platform is designed to comply with Vietnamese regulations:
- Decree 52/2013/NĐ-CP on e-commerce
- Decree 13/2023/NĐ-CP on personal data protection
- Law on Cybersecurity 2018
- Resolution 41/2025/NQ-CP on anti-counterfeiting
- Criminal Code Article 192 on fake goods
- Intellectual Property Law 2005 (amended 2019, 2022)