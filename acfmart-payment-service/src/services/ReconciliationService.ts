import { Pool } from 'pg';
import { TransactionModel, TransactionStatus } from '../models/Transaction';
import * as csv from 'csv-parser';
import * as fs from 'fs';

export interface VNPayReconciliationRecord {
  vnp_TxnRef: string;           // order_id của bạn (khóa nối với escrow)
  vnp_TransactionNo: string;    // mã giao dịch VNPay
  vnp_Amount: string;           // tiền gốc (đơn vị VND, không có thập phân)
  vnp_BankCode: string;         // mã ngân hàng
  vnp_PayDate: string;          // ngày thanh toán (yyyymmddhhmmss)
  vnp_OrderInfo: string;        // thông tin đơn hàng
  vnp_TransactionStatus: string;// "00" thành công, "02" pending, khác = fail
  vnp_Fee: string;              // phí giao dịch
  vnp_NetAmount: string;        // số tiền thực nhận sau phí
}

export interface ReconciliationResult {
  matched: number;
  unmatched: number;
  discrepancies: Array<{
    record: VNPayReconciliationRecord;
    localTransaction?: any;
    issue: string;
  }>;
}

export class ReconciliationService {
  private readonly pool: Pool;

  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'acfmart_payments',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
    });
  }

  /**
   * Đọc file CSV đối soát VNPay và thực hiện đối soát với dữ liệu cục bộ
   */
  async processVNPayReconciliation(csvFilePath: string): Promise<ReconciliationResult> {
    const results: VNPayReconciliationRecord[] = [];

    // Đọc file CSV
    return new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (data: any) => {
          results.push({
            vnp_TxnRef: data.vnp_TxnRef,
            vnp_TransactionNo: data.vnp_TransactionNo,
            vnp_Amount: data.vnp_Amount,
            vnp_BankCode: data.vnp_BankCode,
            vnp_PayDate: data.vnp_PayDate,
            vnp_OrderInfo: data.vnp_OrderInfo,
            vnp_TransactionStatus: data.vnp_TransactionStatus,
            vnp_Fee: data.vnp_Fee,
            vnp_NetAmount: data.vnp_NetAmount,
          });
        })
        .on('end', async () => {
          try {
            const result = await this.reconcileVNPayRecords(results);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        })
        .on('error', reject);
    });
  }

  /**
   * Thực hiện đối soát các bản ghi VNPay với dữ liệu cục bộ
   */
  async reconcileVNPayRecords(records: VNPayReconciliationRecord[]): Promise<ReconciliationResult> {
    const client = await this.pool.connect();
    let matched = 0;
    let unmatched = 0;
    const discrepancies: ReconciliationResult['discrepancies'] = [];

    try {
      for (const record of records) {
        // Tìm giao dịch cục bộ theo vnp_TxnRef (mã đơn hàng)
        const localTransaction = await TransactionModel.findByOrderId(client, record.vnp_TxnRef);

        if (!localTransaction) {
          // Giao dịch tồn tại ở VNPay nhưng không có trong hệ thống cục bộ
          unmatched++;
          discrepancies.push({
            record,
            issue: 'Transaction exists in VNPay but not in local system'
          });
          continue;
        }

        matched++;

        // Kiểm tra sự khác biệt giữa dữ liệu VNPay và dữ liệu cục bộ
        const amountMatch = parseInt(localTransaction.amount.toString()) === parseInt(record.vnp_Amount);
        const statusMatch = this.mapVNPayStatus(record.vnp_TransactionStatus) === localTransaction.status;

        if (!amountMatch || !statusMatch) {
          discrepancies.push({
            record,
            localTransaction,
            issue: `Mismatch - Amount: ${amountMatch ? 'OK' : 'DIFF'}, Status: ${statusMatch ? 'OK' : 'DIFF'}`
          });
        }

        // Cập nhật trạng thái nếu cần thiết
        if (!statusMatch) {
          const newStatus = this.mapVNPayStatus(record.vnp_TransactionStatus);
          await TransactionModel.updateStatus(client, localTransaction.transaction_id, newStatus);
        }
      }

      return {
        matched,
        unmatched,
        discrepancies
      };
    } finally {
      client.release();
    }
  }

  /**
   * Ánh xạ trạng thái từ VNPay sang trạng thái của hệ thống
   */
  private mapVNPayStatus(vnPayStatus: string): TransactionStatus {
    switch (vnPayStatus) {
      case '00': // Thành công
        return TransactionStatus.HELD; // Tiền đã thanh toán, đang giữ trong escrow
      case '02': // Pending
        return TransactionStatus.PENDING;
      case '04': // Đã bị huỷ
        return TransactionStatus.REFUNDED;
      default:
        return TransactionStatus.FAILED;
    }
  }

  /**
   * Gửi thông báo về các sự sai lệch tìm thấy trong quá trình đối soát
   */
  async reportDiscrepancies(results: ReconciliationResult): Promise<void> {
    if (results.discrepancies.length === 0) {
      console.log('No discrepancies found during reconciliation');
      return;
    }

    console.log(`Found ${results.discrepancies.length} discrepancies during reconciliation:`);
    
    for (const discrepancy of results.discrepancies) {
      console.log(`- Issue: ${discrepancy.issue}`);
      console.log(`  Record: ${JSON.stringify(discrepancy.record)}`);
      console.log(`  Local: ${discrepancy.localTransaction ? JSON.stringify(discrepancy.localTransaction) : 'N/A'}`);
      console.log('');
    }

    // Gửi thông báo đến hệ thống cảnh báo
    if (process.env.SLACK_WEBHOOK_URL && results.discrepancies.length > 0) {
      try {
        const axios = require('axios');
        
        await axios.post(process.env.SLACK_WEBHOOK_URL, {
          text: `⚠️ Reconciliation Discrepancies Found\n${results.discrepancies.length} issues detected in payment reconciliation`
        });
      } catch (error) {
        console.error('Failed to send reconciliation alert to Slack:', error);
      }
    }
  }

  /**
   * Thực hiện đối soát định kỳ
   */
  async runScheduledReconciliation(): Promise<void> {
    console.log('Starting scheduled reconciliation...');

    try {
      // Trong thực tế, bạn sẽ tải file CSV từ VNPay về
      // hoặc nhận file từ hệ thống nội bộ
      const csvFilePath = process.env.VNPAY_RECONCILIATION_FILE_PATH || '/tmp/vnpay_recon.csv';
      
      const results = await this.processVNPayReconciliation(csvFilePath);
      
      console.log(`Reconciliation completed: ${results.matched} matched, ${results.unmatched} unmatched`);
      
      await this.reportDiscrepancies(results);
    } catch (error) {
      console.error('Error during scheduled reconciliation:', error);
      
      // Gửi cảnh báo nếu có lỗi
      if (process.env.SLACK_WEBHOOK_URL) {
        try {
          const axios = require('axios');
          
          await axios.post(process.env.SLACK_WEBHOOK_URL, {
            text: `❌ Reconciliation Error\n${error.message}`
          });
        } catch (alertError) {
          console.error('Failed to send reconciliation error alert:', alertError);
        }
      }
    }
  }
}