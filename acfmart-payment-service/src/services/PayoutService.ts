import { v4 as uuidv4 } from "uuid";
import { withTransaction } from "../utils/db";
import { logger } from "../utils/logger";
import { EscrowLedgerModel } from "../models/EscrowLedger";
import { PayoutRequestModel, PayoutStatus } from "../models/PayoutRequest";
import { ConflictError, NotFoundError } from "../middleware/errorHandler";

export interface RequestPayoutInput {
  seller_id: string;
  amount: number;
  currency?: string;
  bank_name: string;
  bank_account_number: string;
  bank_account_holder: string;
  metadata?: Record<string, unknown>;
}

/**
 * PayoutService - Quản lý yêu cầu rút tiền của seller.
 *
 * Flow:
 *  1. Seller request payout với amount + bank info.
 *  2. Server check available balance (sum của escrow_ledger).
 *  3. Tạo payout_requests với status `pending` + ghi `adjust` entry để
 *     giữ chỗ (giảm available balance ngay tránh double-request).
 *  4. Admin/scheduled job approve → đổi status `approved` rồi `processing`.
 *  5. Khi ngân hàng confirm transfer → status `paid` + transaction_ref.
 *  6. Nếu fail → status `failed`, ghi entry adjust ngược chiều để hoàn balance.
 */
export class PayoutService {
  async requestPayout(input: RequestPayoutInput): Promise<{ payout_id: string }> {
    if (input.amount <= 0) {
      throw new ConflictError("Số tiền payout phải dương");
    }

    const payoutId = `payout_${uuidv4().replace(/-/g, "")}`;

    return withTransaction(async (client) => {
      // Lock dòng escrow của seller (FOR UPDATE) tránh race condition khi 2
      // request payout cùng lúc cả hai đều thấy đủ balance.
      await client.query("SELECT 1 FROM escrow_ledger WHERE seller_id = $1 FOR UPDATE", [
        input.seller_id,
      ]);

      const available = await EscrowLedgerModel.computeAvailableBalance(client, input.seller_id);
      if (input.amount > available) {
        throw new ConflictError(
          `Số dư khả dụng (${available}) không đủ để rút ${input.amount}`
        );
      }

      const payout = await PayoutRequestModel.create(client, {
        payout_id: payoutId,
        seller_id: input.seller_id,
        amount: input.amount,
        currency: input.currency,
        bank_name: input.bank_name,
        bank_account_number: input.bank_account_number,
        bank_account_holder: input.bank_account_holder,
        metadata: input.metadata,
      });

      // Ghi `adjust` âm để giữ chỗ - balance available giảm ngay
      await EscrowLedgerModel.create(client, {
        transaction_id: payout.payout_id, // dùng payout_id làm reference
        seller_id: input.seller_id,
        action: "adjust",
        amount: -input.amount,
        balance_before: available,
        balance_after: available - input.amount,
        notes: `Giữ chỗ cho payout ${payoutId}`,
        metadata: { payout_id: payoutId, kind: "payout_hold" },
      });

      logger.info({ payoutId, sellerId: input.seller_id, amount: input.amount }, "Payout requested");
      return { payout_id: payoutId };
    });
  }

  async approvePayout(payoutId: string, approvedBy: string): Promise<void> {
    await withTransaction(async (client) => {
      const payout = await PayoutRequestModel.findById(client, payoutId);
      if (!payout) throw new NotFoundError("Payout", payoutId);
      if (payout.status !== "pending") {
        throw new ConflictError(`Payout đã ở status ${payout.status}, không thể approve`);
      }
      await PayoutRequestModel.updateStatus(client, payoutId, "approved", { approved_by: approvedBy });
    });
  }

  async markPaid(payoutId: string, transactionRef: string): Promise<void> {
    await withTransaction(async (client) => {
      const payout = await PayoutRequestModel.findById(client, payoutId);
      if (!payout) throw new NotFoundError("Payout", payoutId);
      if (!["approved", "processing"].includes(payout.status)) {
        throw new ConflictError(`Payout phải ở approved/processing, hiện tại ${payout.status}`);
      }
      await PayoutRequestModel.updateStatus(client, payoutId, "paid", {
        transaction_ref: transactionRef,
      });
    });
  }

  async rejectPayout(payoutId: string, reason: string): Promise<void> {
    await withTransaction(async (client) => {
      const payout = await PayoutRequestModel.findById(client, payoutId);
      if (!payout) throw new NotFoundError("Payout", payoutId);
      if (payout.status === "paid") {
        throw new ConflictError("Payout đã paid, không thể reject");
      }
      await PayoutRequestModel.updateStatus(client, payoutId, "rejected", { rejected_reason: reason });

      // Hoàn balance đã giữ
      const available = await EscrowLedgerModel.computeAvailableBalance(client, payout.seller_id);
      await EscrowLedgerModel.create(client, {
        transaction_id: payout.payout_id,
        seller_id: payout.seller_id,
        action: "adjust",
        amount: Number(payout.amount),
        balance_before: available,
        balance_after: available + Number(payout.amount),
        notes: `Hoàn balance do reject payout ${payoutId}: ${reason}`,
        metadata: { payout_id: payoutId, kind: "payout_release" },
      });
    });
  }

  async getPayout(payoutId: string) {
    return withTransaction(async (client) => {
      const payout = await PayoutRequestModel.findById(client, payoutId);
      if (!payout) throw new NotFoundError("Payout", payoutId);
      return payout;
    });
  }

  async listForSeller(sellerId: string, status?: PayoutStatus, limit = 50) {
    return withTransaction(async (client) => {
      return PayoutRequestModel.listBySeller(client, sellerId, status, limit);
    });
  }

  async getAvailableBalance(sellerId: string): Promise<number> {
    return withTransaction(async (client) => {
      return EscrowLedgerModel.computeAvailableBalance(client, sellerId);
    });
  }
}

export const payoutService = new PayoutService();
