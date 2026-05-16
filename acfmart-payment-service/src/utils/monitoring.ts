import axios from 'axios';
import { Pool } from 'pg';
import { TransactionModel, TransactionStatus } from '../models/Transaction';

export interface MonitoringConfig {
  alertThresholds: {
    webhookFailRate: number; // >5% trong 15p
    escrowStuckCount: number; // >10 orders
    apiTimeoutMs: number; // >800ms (p95)
    trackingSyncLagMinutes: number; // >1h chưa sync
    labelGenFailRate: number; // >2% đơn
    searchLatencyMs: number; // >200ms (p95)
    errorRate: number; // >1% trong 5p
    dbCpuPercent: number; // >80%
    diskUsagePercent: number; // >85%
  };
  alertChannels: {
    slackWebhookUrl?: string;
    sentryDsn?: string;
    pagerDutyUrl?: string;
  };
  checkIntervals: {
    webhookHealth: number; // ms
    escrowHealth: number;
    shippingHealth: number;
    searchHealth: number;
    infraHealth: number;
  };
}

export class MonitoringService {
  private readonly pool: Pool;
  private config: MonitoringConfig;

  constructor(config: MonitoringConfig) {
    this.config = config;
    this.pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'acfmart_payments',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
    });
  }

  async startMonitoring(): Promise<void> {
    console.log('Starting monitoring service...');
    
    // Start all monitoring checks
    this.startWebhookHealthCheck();
    this.startEscrowHealthCheck();
    this.startShippingHealthCheck();
    this.startSearchHealthCheck();
    this.startInfraHealthCheck();
  }

  private startWebhookHealthCheck(): void {
    setInterval(async () => {
      try {
        await this.checkWebhookHealth();
      } catch (error: unknown) {
        console.error('Error in webhook health check:', this.getErrorMessage(error));
      }
    }, this.config.checkIntervals.webhookHealth);
  }

  private startEscrowHealthCheck(): void {
    setInterval(async () => {
      try {
        await this.checkEscrowHealth();
      } catch (error: unknown) {
        console.error('Error in escrow health check:', this.getErrorMessage(error));
      }
    }, this.config.checkIntervals.escrowHealth);
  }

  private startShippingHealthCheck(): void {
    setInterval(async () => {
      try {
        await this.checkShippingHealth();
      } catch (error: unknown) {
        console.error('Error in shipping health check:', this.getErrorMessage(error));
      }
    }, this.config.checkIntervals.shippingHealth);
  }

  private startSearchHealthCheck(): void {
    setInterval(async () => {
      try {
        await this.checkSearchHealth();
      } catch (error: unknown) {
        console.error('Error in search health check:', this.getErrorMessage(error));
      }
    }, this.config.checkIntervals.searchHealth);
  }

  private startInfraHealthCheck(): void {
    setInterval(async () => {
      try {
        await this.checkInfraHealth();
      } catch (error: unknown) {
        console.error('Error in infra health check:', this.getErrorMessage(error));
      }
    }, this.config.checkIntervals.infraHealth);
  }

  private async checkWebhookHealth(): Promise<void> {
    const client = await this.pool.connect();
    
    try {
      // Calculate webhook failure rate in the last 15 minutes
      const fifteenMinutesAgo = new Date();
      fifteenMinutesAgo.setMinutes(fifteenMinutesAgo.getMinutes() - 15);
      
      const result = await client.query(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN processed = false THEN 1 ELSE 0 END) as failed
        FROM webhook_logs 
        WHERE created_at >= $1
      `, [fifteenMinutesAgo]);
      
      const total = parseInt(result.rows[0].total) || 1;
      const failed = parseInt(result.rows[0].failed) || 0;
      const failRate = (failed / total) * 100;
      
      if (failRate > this.config.alertThresholds.webhookFailRate) {
        await this.sendAlert({
          title: 'High Webhook Failure Rate',
          message: `Webhook failure rate is ${failRate.toFixed(2)}% (threshold: ${this.config.alertThresholds.webhookFailRate}%)`,
          level: 'critical'
        });
      }
    } catch (error: unknown) {
      console.error('Error checking webhook health:', this.getErrorMessage(error));
    } finally {
      client.release();
    }
  }

  private async checkEscrowHealth(): Promise<void> {
    const client = await this.pool.connect();
    
    try {
      // Count stuck escrow transactions (>24h in HELD state)
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
      
      const result = await client.query(`
        SELECT COUNT(*) as stuck_count
        FROM transactions 
        WHERE status = $1 AND created_at <= $2
      `, [TransactionStatus.HELD, twentyFourHoursAgo]);
      
      const stuckCount = parseInt(result.rows[0].stuck_count);
      
      if (stuckCount > this.config.alertThresholds.escrowStuckCount) {
        await this.sendAlert({
          title: 'Escrow Transactions Stuck',
          message: `${stuckCount} escrow transactions have been stuck for more than 24 hours`,
          level: 'high'
        });
      }
    } catch (error: unknown) {
      console.error('Error checking escrow health:', this.getErrorMessage(error));
    } finally {
      client.release();
    }
  }

  private async checkShippingHealth(): Promise<void> {
    // Placeholder for shipping health checks
    // This would integrate with shipping APIs to check response times, error rates, etc.
    console.log('Shipping health check executed');
  }

  private async checkSearchHealth(): Promise<void> {
    // Placeholder for search health checks
    // This would check search response times, error rates, index consistency, etc.
    console.log('Search health check executed');
  }

  private async checkInfraHealth(): Promise<void> {
    // Placeholder for infrastructure health checks
    // This would monitor CPU, memory, disk usage, error rates, etc.
    console.log('Infrastructure health check executed');
  }

  private async sendAlert(alert: {
    title: string;
    message: string;
    level: 'low' | 'medium' | 'high' | 'critical';
  }): Promise<void> {
    console.log(`ALERT: ${alert.title} - ${alert.message} (Level: ${alert.level})`);
    
    // Send to Slack if configured
    if (this.config.alertChannels.slackWebhookUrl) {
      try {
        await axios.post(this.config.alertChannels.slackWebhookUrl, {
          text: `[${alert.level.toUpperCase()}] ${alert.title}: ${alert.message}`
        });
      } catch (error: unknown) {
        console.error('Failed to send Slack alert:', this.getErrorMessage(error));
      }
    }
    
    // Send to Sentry if configured
    if (this.config.alertChannels.sentryDsn) {
      try {
        // Would integrate with Sentry SDK here
        console.log('Would send to Sentry:', alert);
      } catch (error: unknown) {
        console.error('Failed to send Sentry alert:', this.getErrorMessage(error));
      }
    }
    
    // Send to PagerDuty if configured
    if (this.config.alertChannels.pagerDutyUrl) {
      try {
        await axios.post(this.config.alertChannels.pagerDutyUrl, {
          summary: alert.title,
          severity: alert.level === 'critical' ? 'critical' : 'error',
          source: 'acfmart-monitoring',
          custom_details: {
            message: alert.message,
            level: alert.level
          }
        });
      } catch (error: unknown) {
        console.error('Failed to send PagerDuty alert:', this.getErrorMessage(error));
      }
    }
  }

  async stopMonitoring(): Promise<void> {
    // Clean shutdown
    await this.pool.end();
    console.log('Monitoring service stopped');
  }

  /**
   * Helper method to get error message from unknown error
   */
  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    
    if (typeof error === 'string') {
      return error;
    }
    
    try {
      return JSON.stringify(error);
    } catch (jsonError) {
      return 'Unknown error';
    }
  }
}

// Default configuration for the monitoring service
export const defaultMonitoringConfig: MonitoringConfig = {
  alertThresholds: {
    webhookFailRate: 5, // >5% trong 15p
    escrowStuckCount: 10, // >10 orders
    apiTimeoutMs: 800, // >800ms (p95)
    trackingSyncLagMinutes: 60, // >1h chưa sync
    labelGenFailRate: 2, // >2% đơn
    searchLatencyMs: 200, // >200ms (p95)
    errorRate: 1, // >1% trong 5p
    dbCpuPercent: 80, // >80%
    diskUsagePercent: 85, // >85%
  },
  alertChannels: {
    slackWebhookUrl: process.env.SLACK_WEBHOOK_URL,
    sentryDsn: process.env.SENTRY_DSN,
    pagerDutyUrl: process.env.PAGERDUTY_URL,
  },
  checkIntervals: {
    webhookHealth: 5 * 60 * 1000, // 5 minutes
    escrowHealth: 10 * 60 * 1000, // 10 minutes
    shippingHealth: 15 * 60 * 1000, // 15 minutes
    searchHealth: 5 * 60 * 1000, // 5 minutes
    infraHealth: 2 * 60 * 1000, // 2 minutes
  },
};

// Initialize and export a singleton instance
export const monitoringService = new MonitoringService(defaultMonitoringConfig);

// For standalone execution
if (require.main === module) {
  monitoringService.startMonitoring()
    .then(() => {
      console.log('Monitoring service started');
      process.exit(0);
    })
    .catch(error => {
      console.error('Error starting monitoring service:', error);
      process.exit(1);
    });
}