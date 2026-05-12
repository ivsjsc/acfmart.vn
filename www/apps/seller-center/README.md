# ACF Anti-Counterfeit E-commerce Platform - Seller Center

This is the seller management application for the ACF Anti-Counterfeit E-commerce Platform. This application allows verified sellers to manage their products, orders, and financials while ensuring compliance with anti-counterfeit measures.

## Features

### 1. Product Management
- Add and manage products with detailed attributes
- Bulk upload capabilities
- Product certification and verification tools
- QR code generation for anti-counterfeit measures

### 2. Order Management
- View and process customer orders
- Manage shipments and deliveries
- Handle returns and refunds
- Integrate with various shipping providers

### 3. Financial Overview
- Track sales and revenue
- View pending settlements
- Monitor platform fees
- Access to available balance

### 4. Anti-Counterfeit Tools
- Generate unique QR codes for products
- Verify product authenticity
- Access to product certificates
- Track verification reports

### 5. Shop Settings
- Customize shop profile and policies
- Configure shipping options
- Set up payment methods
- Manage shop appearance

### 6. Analytics & Reports
- Sales reports and insights
- Traffic analysis
- Customer behavior insights
- Performance metrics

## Authentication

- VNeID verification required for seller registration
- Multi-factor authentication for enhanced security
- Business credential verification process

## Running the Application

1. Install dependencies:
   ```bash
   cd www/apps/seller-center
   yarn install
   ```

2. Run the development server:
   ```bash
   yarn dev
   ```

3. Access the application at http://localhost:3001

## Integration Points

The Seller Center connects to:
- Medusa.js backend for core e-commerce operations
- Anti-counterfeit module for product verification
- Escrow module for payment management
- VNeID system for authentication
- Various payment gateways and shipping providers