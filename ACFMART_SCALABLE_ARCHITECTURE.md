# ACFMart Scalable Architecture Design

## Overview
This document outlines a microservices architecture designed to scale ACFMart platform while reducing API latency to <200ms p95 for core flows and maintaining upgrade flexibility from Starter → Growth → Enterprise tiers.

## Core Requirements
1. Reduce API latency to <200ms p95 for core flows (search, checkout, QR verify)
2. Enable independent scaling of modules based on actual demand
3. Maintain upgrade path from Starter → Growth → Enterprise without full rewrite
4. Leverage ACF QR system APIs to reduce internal processing load

## Architecture Overview

### 1. Service Decomposition Strategy

#### Core Services:
- **Frontend Gateway Service** - Handles client requests, caching, CDN
- **Product Catalog Service** - Product data, search indexing, recommendations
- **Inventory Service** - Stock levels, allocation, reservation
- **Order Management Service** - Order lifecycle, fulfillment
- **Payment Escrow Service** - Secure payment processing, escrow management
- **User Management Service** - Authentication, authorization, profiles
- **QR Verification Service** - Integration with ACF QR systems
- **Shipping Service** - Integration with GHN/GHTK APIs
- **Notification Service** - Multi-channel messaging
- **Analytics Service** - Business intelligence and metrics

### 2. High-Level Architecture Diagram

```
┌─────────────────┐    ┌─────────────────────┐    ┌─────────────────┐
│   Client Apps   │◄──►│  Frontend Gateway   │◄──►│  CDN & Caching  │
└─────────────────┘    └─────────────────────┘    └─────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌─────────────────┐ ┌─────────────────┐   ┌─────────────────┐
│   Product       │ │   Inventory     │   │   User Mgmt     │
│   Service       │ │   Service       │   │   Service       │
└─────────────────┘ └─────────────────┘   └─────────────────┘
        │                     │                     │
        ▼                     ▼                     ▼
┌─────────────────┐ ┌─────────────────┐   ┌─────────────────┐
│   Search        │ │   Payment       │   │   Auth/         │
│   Service       │ │   Service       │   │   Authorization │
└─────────────────┘ └─────────────────┘   └─────────────────┘
        │                     │                     │
        ▼                     ▼                     ▼
┌─────────────────┐ ┌─────────────────┐   ┌─────────────────┐
│   QR Verify     │ │   Order Mgmt    │   │   Notification  │
│   Service       │ │   Service       │   │   Service       │
└─────────────────┘ └─────────────────┘   └─────────────────┘
        │                     │                     │
        ▼                     ▼                     ▼
┌─────────────────┐ ┌─────────────────┐   ┌─────────────────┐
│   ACF QR API    │ │   Shipping      │   │   Analytics     │
│   Integration   │ │   Service       │   │   Service       │
└─────────────────┘ └─────────────────┘   └─────────────────┘
```

### 3. Detailed Service Design

#### 3.1 Frontend Gateway Service
- **Technology**: Cloudflare Workers / AWS Lambda@Edge
- **Responsibilities**:
  - Request routing and load balancing
  - API rate limiting and security
  - Response caching (CDN integration)
  - SSL termination
  - Static asset serving
- **Performance Target**: <50ms response time
- **Scalability**: Auto-scales based on traffic

#### 3.2 Product Catalog Service
- **Technology**: Node.js/Express with Redis caching
- **Database**: PostgreSQL with read replicas
- **Responsibilities**:
  - Product information management
  - Category and brand hierarchy
  - Product images and metadata
  - Integration with search service
- **Performance Target**: <100ms for product details
- **Caching Strategy**: Redis cache with 10-minute TTL

#### 3.3 Search Service (OpenSearch-based)
- **Technology**: AWS OpenSearch / ElasticSearch
- **Responsibilities**:
  - Full-text search capabilities
  - Faceted search
  - Autocomplete suggestions
  - Search analytics
- **Performance Target**: <150ms for search queries
- **Integration**: Real-time sync with Product Catalog

#### 3.4 QR Verification Service
- **Technology**: Node.js with TypeScript
- **Database**: PostgreSQL for local cache
- **Responsibilities**:
  - Interface with ACF QR verification API
  - Local caching of verification results
  - Trust scoring and analytics
  - Batch processing for high-volume verifications
- **Performance Target**: <200ms for verification
- **Integration**: Direct API calls to ACF QR system

#### 3.5 Payment Escrow Service
- **Technology**: Node.js with PostgreSQL
- **Database**: PostgreSQL with WAL archiving
- **Responsibilities**:
  - Secure payment processing
  - Escrow fund management
  - Integration with VNPay/MoMo
  - Transaction reconciliation
- **Performance Target**: <200ms for payment initiation
- **Security**: PCI DSS compliant processing

#### 3.6 Order Management Service
- **Technology**: Node.js with event sourcing
- **Database**: PostgreSQL with TimescaleDB for time-series data
- **Responsibilities**:
  - Order lifecycle management
  - State machine for order progression
  - Integration with shipping and payment services
- **Performance Target**: <150ms for order creation
- **Reliability**: Event-driven architecture for consistency

### 4. Performance Optimization Strategies

#### 4.1 Caching Hierarchy
```
CDN (CloudFlare) -> Gateway Cache (Redis) -> Service Cache (Redis) -> Database Cache (PostgreSQL)
```

#### 4.2 Database Optimization
- Connection pooling (PgBouncer)
- Read replicas for analytics and search indexing
- Partitioning for time-series data (orders, logs)
- Index optimization for frequently queried fields

#### 4.3 Asynchronous Processing
- Message queues (Google Cloud Pub/Sub) for non-critical operations
- Event-driven architecture for service communication
- Batch processing for reconciliation and reporting

### 5. Scalability Patterns

#### 5.1 Horizontal Pod Autoscaling (HPA)
```
- Product Service: Based on CPU/memory and request rate
- Search Service: Based on query volume and latency
- QR Verification: Based on verification request rate
- Payment Service: Based on transaction volume
```

#### 5.2 Database Scaling
- Read replicas for read-heavy operations
- Sharding strategy for future growth
- Connection pooling to optimize resource usage

#### 5.3 CDN and Edge Computing
- Global CDN for static assets
- Edge functions for personalized content
- Regional caching for location-specific data

### 6. Upgrade Path Strategy

#### 6.1 Tier Definitions
- **Starter Tier**: Single region deployment, shared resources
- **Growth Tier**: Auto-scaling, read replicas, basic caching
- **Enterprise Tier**: Multi-region, advanced caching, dedicated resources

#### 6.2 Migration Strategy
- Feature flags to enable/disable capabilities
- Configurable resource allocation
- Gradual rollout of advanced features
- Non-breaking API versions

### 7. ACF QR System Integration

#### 7.1 API Integration Points
- Verification API: `/api/v1/qr/verify`
- Seller Management: `/api/v1/seller/{seller_id}`
- QR Code Generation: `/api/v1/qr/generate`
- Analytics: `/api/v1/analytics/qr-stats`

#### 7.2 Caching Strategy
- Local Redis cache for recent verification results (TTL: 1 hour)
- Bulk verification during peak times to reduce API calls
- Fallback mechanism if ACF API is unavailable

#### 7.3 Performance Optimization
- Batch verification for multiple codes
- Asynchronous processing for complex verification flows
- Local trust scoring to reduce verification frequency for trusted sources

### 8. Implementation Roadmap

#### Phase 1: Foundation (Weeks 1-4)
- Set up service skeleton and basic infrastructure
- Implement Frontend Gateway with CDN
- Create Product Catalog and Search services
- Establish CI/CD pipelines

#### Phase 2: Core Flows (Weeks 5-8)
- Implement Payment Escrow Service
- Integrate QR Verification Service with ACF API
- Optimize core flows for <200ms p95 latency
- Implement caching layers

#### Phase 3: Advanced Features (Weeks 9-12)
- Add Order Management Service
- Implement advanced search and recommendations
- Complete multi-tier architecture
- Performance testing and optimization

#### Phase 4: Production Readiness (Weeks 13-16)
- Implement monitoring and alerting
- Set up disaster recovery
- Complete security audits
- Performance tuning and optimization

### 9. Monitoring and Observability

#### 9.1 Metrics Collection
- Request rate, error rate, and latency (RED method)
- Business metrics (conversion rates, revenue)
- Infrastructure metrics (CPU, memory, disk)

#### 9.2 Distributed Tracing
- OpenTelemetry integration across all services
- Trace correlation IDs for request flow
- Performance bottleneck identification

#### 9.3 Alerting
- Latency thresholds (<200ms p95)
- Error rate thresholds (<1%)
- Infrastructure resource utilization

### 10. Security Considerations

#### 10.1 Data Protection
- Encryption at rest and in transit
- Secure key management (Google Secret Manager)
- Regular security scanning

#### 10.2 Access Control
- JWT-based authentication
- Role-based access control (RBAC)
- API rate limiting and DDoS protection

This architecture ensures that ACFMart can scale independently across modules while maintaining the required performance targets and enabling smooth upgrades from starter to enterprise tier.