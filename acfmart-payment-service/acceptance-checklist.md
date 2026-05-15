# ACFMart Escrow Payment Service - Acceptance Checklist

## Phase 2 - API Integration Staging

### Core Functionality
- [ ] Payment hold mechanism implemented (escrow)
- [ ] Payment release mechanism after delivery confirmation
- [ ] Payment refund functionality
- [ ] Multi-PSP support (VNPay, MoMo, ZaloPay)
- [ ] Transaction status tracking (PENDING → HELD → RELEASED/REFUNDED)
- [ ] Proper error handling and status codes (400, 403, 409, 429, 502)

### Security & Compliance
- [ ] No card data storage (PAN, CVV, expiry)
- [ ] PSP token usage only
- [ ] Idempotency key validation and enforcement
- [ ] HMAC-SHA256 webhook signature validation
- [ ] IP whitelisting for webhooks (PSP/3PL sources)
- [ ] Rate limiting (max 5 req/s per IP)
- [ ] Audit logging for all financial transactions

### Testing Coverage
- [ ] Unit tests ≥80% coverage for hold/release/refund logic
- [ ] Integration tests with mocked PSP responses
- [ ] E2E tests: Checkout → Hold → Webhook → Release → Verify DB state
- [ ] Idempotency tests: Multiple requests with same key → Single transaction
- [ ] Load test: 200 concurrent hold requests, no duplicates, P95 < 800ms
- [ ] Security tests: Injection, broken auth, bypass attempts

### Performance & Reliability
- [ ] Transaction processing time < 800ms (P95)
- [ ] Auto-expiration of unconfirmed transactions (24h)
- [ ] Reconciliation mechanism for failed webhooks
- [ ] Retry logic for PSP communication failures
- [ ] Circuit breaker for PSP outages

### Monitoring & Observability
- [ ] Health checks: /healthz (DB, Redis, PSP connectivity)
- [ ] Metrics: Request rate, error rate, latency, pending escrow count
- [ ] Alerting: Error rate > 1%, pending > 50 orders > 2h
- [ ] Structured logging for troubleshooting

---

## Phase 3 - Production Go-Live

### Pre-Launch Requirements
- [ ] HĐQT approval of technical implementation
- [ ] PSP contracts signed (VNPay, MoMo)
- [ ] 3PL integration completed for delivery webhooks
- [ ] Security audit passed (penetration testing)
- [ ] Load test results approved (simulating peak traffic)
- [ ] Rollback plan documented and tested

### Production Deployment
- [ ] K8s deployment with HPA (min 2, max 4 replicas)
- [ ] TLS termination and SSL certificates
- [ ] Database backup configured (PITR ≤ 15 minutes)
- [ ] Secrets management via K8s Secrets/Vault
- [ ] Monitoring and alerting configured (Slack integration)

### Go-Live Criteria
- [ ] All Phase 2 tests passing in staging
- [ ] UAT sign-off: 10 internal test orders end-to-end
- [ ] Zero critical bugs in test cycle
- [ ] Performance meets SLA requirements
- [ ] Security assessment cleared
- [ ] Operations team trained on monitoring and incident response

### Success Metrics (Post-Launch)
- [ ] 99.9% uptime maintained
- [ ] Average transaction processing time < 500ms
- [ ] Zero security incidents
- [ ] Customer complaints < 0.1% of transactions
- [ ] Successful reconciliation of all escrow flows

---

## Board Approval Requirements

### Technical Readiness
- [ ] Architecture review completed by senior engineers
- [ ] Code quality gates passed (linting, formatting)
- [ ] Documentation complete (API, deployment, ops)
- [ ] Disaster recovery procedures tested

### Financial Controls
- [ ] Budget adherence: Phase 2 (150tr) and Phase 3 (300tr)
- [ ] Payment reconciliation accuracy: 99.99%
- [ ] Chargeback and fraud prevention mechanisms
- [ ] Compliance with Vietnamese e-commerce regulations

### Risk Assessment
- [ ] Business continuity plan for payment service downtime
- [ ] PSP failure contingency plans
- [ ] Data privacy and protection compliance (DPIA v1.0)
- [ ] Regular security updates and patching schedule

---

**Prepared by:** Technical Team  
**Reviewed by:** Engineering Lead  
**Approved by:** HĐQT

**Date of Review:** _______________

**Signatures:**
- Technical Lead: _______________
- Security Officer: _______________
- Finance Representative: _______________
- Board Member: _______________