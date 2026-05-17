import fs from "fs";
import axios from "axios";
import csv from "csv-parser";
import { pool } from "../utils/db";
import { logger } from "../utils/logger";
import { TransactionModel, TransactionStatus } from "../models/Transaction";

/**
 * ReconciliationService - Đối soát giao dịch với file CSV từ VNPay (T+1).
 *
 * Quy trình:
 *  - Tải hoặc nhận file recon từ VNPay (qua SFTP / merchant portal).
 *  - Parse từng dòng, đối chiếu với transactions table theo vnp_TxnRef.
 *  - Nếu mismatch: log + alert Slack + tự cập nhật status nếu rõ ràng.
 *
 * Chạy via cron job hàng ngày 02:00 (sau khi VNPay phát hành file recon).
 */

export interface VNPayReconRecord {
  vnp_TxnRef: string;
  vnp_TransactionNo: string;
  vnp_Amount: string;
  vnp_BankCode: string;
  vnp_PayDate: string;
  vnp_OrderInfo: string;
  vnp_TransactionStatus: string;
  vnp_Fee: string;
  vnp_NetAmount: string;
}

export interface ReconResult {
  matched: number;
  unmatched: number;
  discrepancies: Array<{
    record: VNPayReconRecord;
    issue: string;
    localTxId?: string;
  }>;
}

export class ReconciliationService {
  async processVNPayFile(filePath: string): Promise<ReconResult> {
    return new Promise((resolve, reject) => {
      const records: VNPayReconRecord[] = [];
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (data: Partial<VNPayReconRecord>) => {
          records.push({
            vnp_TxnRef: data.vnp_TxnRef ?? "",
            vnp_TransactionNo: data.vnp_TransactionNo ?? "",
            vnp_Amount: data.vnp_Amount ?? "0",
            vnp_BankCode: data.vnp_BankCode ?? "",
            vnp_PayDate: data.vnp_PayDate ?? "",
            vnp_OrderInfo: data.vnp_OrderInfo ?? "",
            vnp_TransactionStatus: data.vnp_TransactionStatus ?? "",
            vnp_Fee: data.vnp_Fee ?? "0",
            vnp_NetAmount: data.vnp_NetAmount ?? "0",
          });
        })
        .on("end", () => {
          this.reconcileRecords(records).then(resolve).catch(reject);
        })
        .on("error", reject);
    });
  }

  async reconcileRecords(records: VNPayReconRecord[]): Promise<ReconResult> {
    const client = await pool.connect();
    let matched = 0;
    let unmatched = 0;
    const discrepancies: ReconResult["discrepancies"] = [];

    try {
      for (const r of records) {
        const tx = await TransactionModel.findByOrderId(client, r.vnp_TxnRef);
        if (!tx) {
          unmatched++;
          discrepancies.push({ record: r, issue: "Local transaction not found" });
          continue;
        }

        matched++;
        const amountMatch = Math.round(Number(tx.amount)) === Math.round(Number(r.vnp_Amount) / 100);
        const expectedStatus = this.mapVNPayStatus(r.vnp_TransactionStatus);
        const statusMatch = tx.status === expectedStatus;

        if (!amountMatch || !statusMatch) {
          discrepancies.push({
            record: r,
            localTxId: tx.transaction_id,
            issue: `mismatch (amount=${amountMatch ? "OK" : "DIFF"}, status=${statusMatch ? "OK" : "DIFF"})`,
          });

          if (!statusMatch) {
            await TransactionModel.updateStatus(client, tx.transaction_id, expectedStatus, {
              metadata: { reconciliation: "vnpay_recon", recon_status: r.vnp_TransactionStatus },
            });
          }
        }
      }
    } finally {
      client.release();
    }

    return { matched, unmatched, discrepancies };
  }

  private mapVNPayStatus(vnpStatus: string): TransactionStatus {
    switch (vnpStatus) {
      case "00":
        return TransactionStatus.HELD;
      case "02":
        return TransactionStatus.PENDING;
      case "04":
        return TransactionStatus.REFUNDED;
      default:
        return TransactionStatus.FAILED;
    }
  }

  async reportDiscrepancies(result: ReconResult): Promise<void> {
    if (result.discrepancies.length === 0) {
      logger.info("Reconciliation - no discrepancies");
      return;
    }
    logger.warn(
      { count: result.discrepancies.length, sample: result.discrepancies.slice(0, 3) },
      "Reconciliation discrepancies"
    );

    if (process.env.SLACK_WEBHOOK_URL) {
      try {
        await axios.post(process.env.SLACK_WEBHOOK_URL, {
          text: `Reconciliation Discrepancies: ${result.discrepancies.length} issues. Matched=${result.matched}, Unmatched=${result.unmatched}`,
        });
      } catch (err) {
        logger.error({ err: (err as Error).message }, "Failed to alert reconciliation");
      }
    }
  }

  async runScheduledReconciliation(): Promise<void> {
    const csvFilePath = process.env.VNPAY_RECONCILIATION_FILE_PATH ?? "/tmp/vnpay_recon.csv";
    if (!fs.existsSync(csvFilePath)) {
      logger.warn({ csvFilePath }, "Reconciliation file không tồn tại, skip");
      return;
    }
    try {
      const result = await this.processVNPayFile(csvFilePath);
      logger.info({ matched: result.matched, unmatched: result.unmatched }, "Reconciliation done");
      await this.reportDiscrepancies(result);
    } catch (err) {
      logger.error({ err }, "Reconciliation job failed");
      if (process.env.SLACK_WEBHOOK_URL) {
        try {
          await axios.post(process.env.SLACK_WEBHOOK_URL, {
            text: `Reconciliation Error: ${(err as Error).message}`,
          });
        } catch {
          /* ignore */
        }
      }
    }
  }
}

export const reconciliationService = new ReconciliationService();
