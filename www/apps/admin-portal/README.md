# ACF Anti-Counterfeit E-commerce Platform - Admin Portal

This is the administrative portal for the ACF Anti-Counterfeit E-commerce Platform. This internal application allows administrators to manage the platform, monitor activities, handle compliance, and oversee the anti-counterfeit operations.

## Features

### 1. Platform Analytics
- Real-time metrics on users, sellers, revenue, and orders
- Trend analysis and reporting
- Performance monitoring

### 2. User Management
- Manage all platform users (customers, sellers, moderators)
- Ban/unban users as needed
- Review seller applications and verify credentials

### 3. Payment Processing
- Monitor escrow transactions
- Handle payment disputes
- Manage payment gateway integrations
- Track transaction history

### 4. Compliance Management
- Regulatory reporting tools
- Legal document management
- Policy management system
- Audit logs and activity tracking

### 5. Product Management
- Approve product listings
- Handle counterfeit reports
- Manage categories and certificates
- Review product authenticity

## Security Features

- Two-factor authentication (2FA) required
- IP whitelisting for access
- Session management and automatic logout
- Activity logging and monitoring
- Role-based access controls

## Running the Application

1. Install dependencies:
   ```bash
   cd www/apps/admin-portal
   yarn install
   ```

2. Run the development server:
   ```bash
   yarn dev
   ```

3. Access the application at http://localhost:7000

## Integration Points

The Admin Portal connects to:
- Medusa.js backend for core e-commerce operations
- Anti-counterfeit module for product verification
- Escrow module for payment management
- VNeID system for authentication
- Various payment gateways and shipping providers