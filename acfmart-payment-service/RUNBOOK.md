# ACFMart Payment Service - Operations Runbook

## Table of Contents
1. [Introduction](#introduction)
2. [Common Issues & Troubleshooting](#common-issues--troubleshooting)
3. [Incident Response Procedures](#incident-response-procedures)
4. [Maintenance Tasks](#maintenance-tasks)
5. [Monitoring & Alerting](#monitoring--alerting)
6. [Security Incidents](#security-incidents)

## Introduction

This runbook provides guidance for operations staff managing the ACFMart Payment Service. It covers common troubleshooting procedures, incident response protocols, and maintenance tasks.

### Service Overview
- **Purpose**: Handle escrow payments for ACFMart platform
- **Tech Stack**: Node.js, Express, PostgreSQL, Redis
- **External Dependencies**: VNPay, MoMo, OpenSearch
- **Key Components**: Payment processing, Webhook handling, Escrow management

## Common Issues & Troubleshooting

### 1. Webhook Failures

**Symptoms**:
- High webhook failure rate alerts
- Payment status not updating properly
- Funds not releasing automatically

**Troubleshooting Steps**:
1. Check webhook logs in the database:
   ```sql
   SELECT * FROM webhooks_log 
   WHERE processed = false 
   ORDER BY created_at DESC 
   LIMIT 10;
   ```
2. Verify external service availability (VNPay, MoMo, etc.)
3. Check internal API connectivity
4. Review recent deployments that might affect webhook handlers
5. Verify webhook signatures are configured correctly

**Resolution**:
- Retry failed webhooks manually if needed
- Update PSP credentials if they've changed
- Scale up webhook processing capacity if experiencing high volume

### 2. Escrow Orders Stuck in HELD Status

**Symptoms**:
- Orders remain in HELD status beyond expected delivery time
- Funds not released to merchants
- Customer complaints about delayed settlements

**Troubleshooting Steps**:
1. Identify stuck orders:
   ```sql
   SELECT * FROM transactions 
   WHERE status = 'HELD' 
   AND created_at <= NOW() - INTERVAL '24 hours' 
   ORDER BY created_at ASC;
   ```
2. Check if shipping webhooks were received for these orders
3. Verify the escrow release mechanism is functioning
4. Look for any disputes or exceptions related to these orders

**Resolution**:
- Manually trigger release for confirmed deliveries
- Investigate why shipping webhooks weren't received
- Implement manual override process for exceptional cases

### 3. Payment Processing Delays

**Symptoms**:
- Slow payment initiation times
- Timeout errors during checkout
- High error rates in payment APIs

**Troubleshooting Steps**:
1. Check response times for external payment providers (VNPay, MoMo)
2. Monitor database performance and connection pool usage
3. Verify Redis cache performance and availability
4. Check system resource utilization (CPU, Memory)

**Resolution**:
- Implement circuit breaker pattern for failing external services
- Optimize database queries
- Increase infrastructure capacity if needed
- Add retry mechanisms with exponential backoff

### 4. Search Index Mismatches

**Symptoms**:
- Search results don't match database records
- Products missing from search results
- Inconsistent product counts between DB and search index

**Troubleshooting Steps**:
1. Compare record counts between DB and OpenSearch
2. Check event subscriber logs for failed syncs
3. Verify OpenSearch cluster health

**Resolution**:
- Run manual reindex for missing products
- Fix broken event subscribers
- Restart event bus if needed

## Incident Response Procedures

### Critical Incident: Payment Service Down

**Immediate Actions (0-5 minutes)**:
1. Acknowledge alert and verify service status
2. Check monitoring dashboards for error patterns
3. Verify if the issue affects all payment methods or specific ones

**Investigation (5-15 minutes)**:
1. Check application logs for error patterns
2. Verify database connectivity
3. Test external payment provider APIs
4. Check infrastructure resources (CPU, Memory, Disk)

**Resolution (15+ minutes)**:
1. If database issue: engage database administrator
2. If external provider issue: check provider status pages
3. If code issue: rollback recent deployment if possible
4. If infrastructure issue: scale resources or restart services
5. Document root cause and remediation steps

### High Severity: Funds Not Releasing

**Immediate Actions (0-5 minutes)**:
1. Verify the scope - how many orders affected?
2. Check if shipping webhooks are being received
3. Verify escrow release mechanism

**Investigation (5-15 minutes)**:
1. Check shipping webhook logs
2. Examine escrow state machine logs
3. Verify communication between services

**Resolution (15+ minutes)**:
1. Manually release funds for confirmed deliveries
2. Identify and fix the root cause
3. Implement temporary workaround if needed
4. Inform affected merchants about delays

## Maintenance Tasks

### Daily Tasks
- [ ] Check overnight batch jobs (expired transactions cleanup)
- [ ] Review error logs for anomalies
- [ ] Verify backup completion
- [ ] Monitor webhook processing queue

### Weekly Tasks
- [ ] Review performance metrics and trends
- [ ] Check for stuck escrow transactions
- [ ] Verify reconciliation reports
- [ ] Update monitoring thresholds based on traffic patterns

### Monthly Tasks
- [ ] Perform database maintenance (analyze, vacuum)
- [ ] Review security logs
- [ ] Test disaster recovery procedures
- [ ] Update payment provider agreements and credentials

## Monitoring & Alerting

### Key Metrics to Watch
- Webhook failure rate (>5% triggers alert)
- Escrow orders stuck >24h (>10 orders triggers alert)
- Payment API response time (>800ms triggers alert)
- Database connection pool utilization (>80% triggers alert)
- Error rate (>1% triggers alert)

### Alert Escalation
1. **Level 1 (Automated)**: Slack notifications to #payment-alerts
2. **Level 2 (On-call)**: PagerDuty/SMS alerts for critical issues
3. **Level 3 (Management)**: Email escalation for business-impacting issues

### Runbook Updates
- Update this document after each significant incident
- Add new troubleshooting procedures as they emerge
- Review quarterly with the operations team

## Security Incidents

### Suspected Fraudulent Transactions
1. Immediately flag the transaction in the system
2. Temporarily suspend related accounts
3. Engage fraud investigation team
4. Report to payment providers if needed
5. Notify legal/compliance teams

### Data Breach
1. Isolate affected systems immediately
2. Preserve evidence and logs
3. Engage security team and legal counsel
4. Follow incident response procedures
5. Notify authorities as required by law

---

**Contact Information**:
- On-call engineer: [pager contact]
- Engineering manager: [contact info]
- DevOps team: [contact info]
- Security team: [contact info]