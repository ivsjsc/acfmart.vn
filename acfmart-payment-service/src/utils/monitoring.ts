import axios from 'axios';
import { Pool } from 'pg';
import { Transaction, TransactionStatus, TransactionModel } from '../models/Transaction';

// Create a database connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5400'), // Changed to 5400 to match monitoring
  database: process.env.DB_NAME || 'acfmart_payments',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

interface AlertThresholds {
  webhookFailRate: number; // >5% in 15min
  escrowStuckCount: number; // >10 orders
  idempotencyCollisions: number; // >0
  apiTimeoutThreshold: number; // >800ms (p95)
  trackingSyncLag: number; // >1h
  labelGenFailureRate: number; // >2% of orders
  searchLatencyThreshold: number; // >200ms (p95)
  errorRate: number; // >1% in 5min
  dbCpuThreshold: number; // >80% for 5min
  diskUsageThreshold: number; // >85%
}

export const DEFAULT_THRESHOLDS: AlertThresholds = {
  webhookFailRate: 0.05, // 5%
  escrowStuckCount: 10,
  idempotencyCollisions: 0, // Any collision is bad
  apiTimeoutThreshold: 800, // ms
  trackingSyncLag: 60 * 60 * 1000, // 1 hour in ms
  labelGenFailureRate: 0.02, // 2%
  searchLatencyThreshold: 200, // ms
  errorRate: 0.01, // 1%
  dbCpuThreshold: 80, // %
  diskUsageThreshold: 85, // %
};

export class MonitoringService {
  private thresholds: AlertThresholds;
  private slackWebhookUrl?: string;

  constructor(thresholds: Partial<AlertThresholds> = {}) {
    this.thresholds = { ...DEFAULT_THRESHOLDS, ...thresholds };
    this.slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
  }

  async checkWebhookFailures(timeWindowMinutes: number = 15): Promise<void> {
    const client = await pool.connect();
    
    try {
      // Query for webhooks processed in the last time window
      const query = `
        SELECT 
          COUNT(*) as total_count,
          SUM(CASE WHEN processed = false THEN 1 ELSE 0 END) as failed_count
        FROM webhooks_log 
        WHERE created_at >= NOW() - INTERVAL '${timeWindowMinutes} minutes'
      `;
      
      const result = await client.query(query);
      const { total_count, failed_count } = result.rows[0];
      
      if (parseInt(total_count) > 0) {
        const failureRate = parseInt(failed_count) / parseInt(total_count);
        
        if (failureRate > this.thresholds.webhookFailRate) {
          await this.sendAlert(
            '🚨 Webhook Fail Rate High',
            `Webhook failure rate: ${(failureRate * 100).toFixed(2)}% in last ${timeWindowMinutes} minutes (${failed_count}/${total_count})`,
            'high'
          );
        }
      }
    } finally {
      client.release();
    }
  }

  async checkEscrowStuckOrders(maxAgeHours: number = 24): Promise<void> {
    const client = await pool.connect();
    
    try {
      const query = `
        SELECT COUNT(*) as stuck_count
        FROM transactions 
        WHERE status = $1 
        AND created_at <= NOW() - INTERVAL '${maxAgeHours} hours'
      `;
      
      const result = await client.query(query, [TransactionStatus.HELD]);
      const stuckCount = parseInt(result.rows[0].stuck_count);
      
      if (stuckCount > this.thresholds.escrowStuckCount) {
        await this.sendAlert(
          '⏰ Escrow Orders Stuck',
          `Found ${stuckCount} escrow orders stuck in HELD status for more than ${maxAgeHours} hours`,
          'high'
        );
      }
    } finally {
      client.release();
    }
  }

  async checkIdempotencyCollisions(): Promise<void> {
    const client = await pool.connect();
    
    try {
      const query = `
        SELECT idempotency_key, COUNT(*) as collision_count
        FROM transactions 
        WHERE idempotency_key IS NOT NULL
        GROUP BY idempotency_key
        HAVING COUNT(*) > 1
      `;
      
      const result = await client.query(query);
      
      if (result.rows.length > this.thresholds.idempotencyCollisions) {
        await this.sendAlert(
          '⚠️ Idempotency Key Collisions',
          `Found ${result.rows.length} idempotency keys with collisions`,
          'medium'
        );
      }
    } finally {
      client.release();
    }
  }

  async checkApiPerformance(): Promise<void> {
    // Check payment service response times
    try {
      const startTime = Date.now();
      await axios.get(`${process.env.PAYMENT_SERVICE_URL}/healthz`);
      const responseTime = Date.now() - startTime;
      
      if (responseTime > this.thresholds.apiTimeoutThreshold) {
        await this.sendAlert(
          '⏱️ Payment API Slow',
          `Payment service response time: ${responseTime}ms (threshold: ${this.thresholds.apiTimeoutThreshold}ms)`,
          'high'
        );
      }
    } catch (error) {
      await this.sendAlert(
        '❌ Payment API Unreachable',
        `Payment service health check failed: ${error.message}`,
        'critical'
      );
    }
  }

  async checkSearchLatency(): Promise<void> {
    // Test search performance
    try {
      const startTime = Date.now();
      await axios.get(`${process.env.SEARCH_SERVICE_URL || process.env.OPENSEARCH_URL}/_cluster/health`);
      const responseTime = Date.now() - startTime;
      
      if (responseTime > this.thresholds.searchLatencyThreshold) {
        await this.sendAlert(
          '🔍 Search Service Slow',
          `Search service response time: ${responseTime}ms (threshold: ${this.thresholds.searchLatencyThreshold}ms)`,
          'high'
        );
      }
    } catch (error) {
      await this.sendAlert(
        '❌ Search Service Unreachable',
        `Search service health check failed: ${error.message}`,
        'critical'
      );
    }
  }

  async checkIndexCountMismatch(): Promise<void> {
    if (!process.env.OPENSEARCH_URL) return;
    
    try {
      // Compare DB count with index count
      const client = await pool.connect();
      
      try {
        // Get count from DB
        const dbResult = await client.query('SELECT COUNT(*) as count FROM transactions WHERE status != $1', [TransactionStatus.REFUNDED]);
        const dbCount = parseInt(dbResult.rows[0].count);
        
        // Get count from OpenSearch
        const indexResponse = await axios.get(`${process.env.OPENSEARCH_URL}/products/_count`);
        const indexCount = indexResponse.data.count;
        
        const diffPercentage = Math.abs(dbCount - indexCount) / ((dbCount + indexCount) / 2);
        
        if (diffPercentage > 0.01) { // More than 1% difference
          await this.sendAlert(
            '📦 Index Count Mismatch',
            `DB count: ${dbCount}, Index count: ${indexCount}, Diff: ${Math.round(diffPercentage * 100)}%`,
            'medium'
          );
        }
      } finally {
        client.release();
      }
    } catch (error) {
      await this.sendAlert(
        '❌ Index Count Check Failed',
        `Could not compare index counts: ${error.message}`,
        'medium'
      );
    }
  }

  async checkExpiredTransactions(): Promise<void> {
    try {
      // Call the payment service to check for expired transactions
      // This would be implemented in the PaymentService class
      console.log('Checking for expired transactions...');
    } catch (error) {
      await this.sendAlert(
        '❌ Expired Transaction Check Failed',
        `Could not check expired transactions: ${error.message}`,
        'high'
      );
    }
  }

  private async sendAlert(title: string, message: string, severity: 'low' | 'medium' | 'high' | 'critical'): Promise<void> {
    console.log(`[${severity.toUpperCase()}] ${title}: ${message}`);
    
    if (this.slackWebhookUrl) {
      try {
        let color = '#cccccc'; // default
        if (severity === 'critical') color = '#ff0000';
        else if (severity === 'high') color = '#ff6600';
        else if (severity === 'medium') color = '#ffff00';
        
        await axios.post(this.slackWebhookUrl, {
          attachments: [{
            color: color,
            title: title,
            text: message,
            fields: [
              {
                title: 'Severity',
                value: severity,
                short: true
              },
              {
                title: 'Timestamp',
                value: new Date().toISOString(),
                short: true
              }
            ]
          }]
        });
      } catch (error) {
        console.error('Failed to send Slack alert:', error.message);
      }
    }
  }

  async runHealthChecks(): Promise<void> {
    console.log('Running scheduled health checks...');
    
    await Promise.allSettled([
      this.checkWebhookFailures(),
      this.checkEscrowStuckOrders(),
      this.checkIdempotencyCollisions(),
      this.checkApiPerformance(),
      this.checkSearchLatency(),
      this.checkIndexCountMismatch(),
      this.checkExpiredTransactions()
    ]);
    
    console.log('Health checks completed.');
  }
}

// Initialize and export a singleton instance
export const monitoringService = new MonitoringService();

// For standalone execution
if (require.main === module) {
  monitoringService.runHealthChecks()
    .then(() => {
      console.log('Health checks completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('Error during health checks:', error);
      process.exit(1);
    });
}