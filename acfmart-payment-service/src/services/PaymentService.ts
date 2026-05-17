import { v4 as uuidv4 } from "uuid";
import { withTransaction } from "../utils/db";
import { config } from "../utils/config";
import { logger } from "../utils/logger";
import {
  TransactionModel,
  TransactionStatus,
} from "../models/Transaction";
import { EscrowLedgerModel } from "../models/EscrowLedger";
import { WebhookLogModel } from "../models/WebhookLog";
import { PaymentGatewayFactory } from "../gateways/PaymentGatewayFactory";
import type {
  Currency,
  PaymentProvider,
  VerifyWebhookInput,
} from "../gateways/IPaymentGateway";
import { AppError, ConflictError, NotFoundError } from "../middleware/errorHandler";

export interface InitPaymentInput {
  order_id: string;
  amount: number;
  currency: Currency;
  provider: PaymentProvider;
  buyer_id?: string;
  seller_id?: string;
  buyer_phone?: string;
  buyer_email?: string;
  buyer_name?: string;
  description: string;
  return_url: string;
  client_ip?: string;
  idempotency_key?: string;
  metadata?: Record<string, unknown>;
}

export interface InitPaymentOutput {
  transaction_id: string;
  status: TransactionStatus;
  provider: PaymentProvider;
  payment_url?: string;
  payment_token?: string;
  qr_code?: string;
  expires_at?: Date;
}

/**
 * PaymentService - Business logic chính.
 *
 * Trách nhiệm:
 *  - createPayment: tạo transaction PENDING + gọi gateway tạo URL/token thanh toán.
 *  - processWebhook: xác thực + cập nhật transaction + ghi escrow_ledger.
 *  - getTransaction: tra cứu.
 *  - refundTransaction: gọi gateway refund + ghi escrow_ledger.
 *
 * Mọi mutation chạy trong `withTransaction` để đảm bảo ACID. Gateway calls
 * tách khỏi DB transaction để tránh giữ connection khi đang call ngoại bộ.
 */
export class PaymentService {
  async createPayment(input: InitPaymentInput): Promise<InitPaymentOutput> {
    const transactionId = `txn_${uuidv4().replace(/-/g, "")}`;
    const expiresAt = new Date(
      Date.now() + config.ESCROW_HOLD_DURATION_HOURS * 60 * 60 * 1000
    );

    // Bước 1: Lưu transaction PENDING vào DB (atomic)
    const tx = await withTransaction(async (client) => {
      // Idempotency check DB-level - dù Redis miss vẫn không double-create
      if (input.idempotency_key) {
        const existing = await TransactionModel.findByIdempotencyKey(
          client,
          input.idempotency_key
        );
        if (existing) {
          logger.info(
            { idempotencyKey: input.idempotency_key, txId: existing.transaction_id },
            "Replay - return existing transaction"
          );
          return existing;
        }
      }

      return TransactionModel.create(client, {
        transaction_id: transactionId,
        order_id: input.order_id,
        seller_id: input.seller_id,
        buyer_id: input.buyer_id,
        amount: input.amount,
        currency: input.currency,
        payment_method: input.provider,
        provider: input.provider,
        status: TransactionStatus.PENDING,
        buyer_phone: input.buyer_phone,
        buyer_email: input.buyer_email,
        redirect_url: input.return_url,
        expires_at: expiresAt,
        idempotency_key: input.idempotency_key,
        metadata: input.metadata,
      });
    });

    // Nếu là replay -> trả luôn payment_url cũ
    if (tx.transaction_id !== transactionId) {
      return {
        transaction_id: tx.transaction_id,
        status: tx.status,
        provider: tx.provider,
        payment_url: tx.payment_url ?? undefined,
        expires_at: tx.expires_at ?? undefined,
      };
    }

    // Bước 2: Gọi gateway tạo URL (ngoài DB transaction)
    const gateway = PaymentGatewayFactory.getGateway(input.provider);
    const ipnUrl = `${config.PUBLIC_BASE_URL}/api/v1/webhooks/${input.provider}`;

    try {
      const result = await gateway.createPayment({
        transactionId,
        orderId: input.order_id,
        amount: input.amount,
        currency: input.currency,
        description: input.description,
        buyerEmail: input.buyer_email,
        buyerPhone: input.buyer_phone,
        buyerName: input.buyer_name,
        returnUrl: input.return_url,
        ipnUrl,
        clientIp: input.client_ip,
        metadata: input.metadata,
      });

      // Bước 3: Cập nhật payment_url + provider_tx_id
      await withTransaction(async (client) => {
        await client.query(
          `UPDATE transactions
             SET payment_url = $1, provider_tx_id = $2
           WHERE transaction_id = $3`,
          [result.paymentUrl ?? null, result.providerTxId ?? null, transactionId]
        );
      });

      return {
        transaction_id: transactionId,
        status: TransactionStatus.PENDING,
        provider: input.provider,
        payment_url: result.paymentUrl,
        payment_token: result.paymentToken,
        qr_code: result.qrCode,
        expires_at: result.expiresAt ?? expiresAt,
      };
    } catch (err) {
      // Rollback transaction về FAILED nếu gateway từ chối
      logger.error({ err, transactionId }, "Gateway createPayment failed");
      await withTransaction(async (client) => {
        await TransactionModel.updateStatus(client, transactionId, TransactionStatus.FAILED, {
          error_code: "GATEWAY_INIT_FAILED",
          error_message: (err as Error).message,
        });
      });
      throw new AppError(
        "GATEWAY_INIT_FAILED",
        `Không thể khởi tạo thanh toán: ${(err as Error).message}`,
        502
      );
    }
  }

  async processWebhook(
    provider: PaymentProvider,
    input: VerifyWebhookInput,
    remoteIp?: string
  ): Promise<{ accepted: boolean; transactionId?: string }> {
    const gateway = PaymentGatewayFactory.getGateway(provider);
    const verified = await gateway.verifyWebhook(input);

    // Log mọi webhook ngay cả khi invalid signature - phục vụ forensics
    await WebhookLogModel.log({
      provider,
      transaction_id: verified.orderId ?? null,
      event_type: verified.status,
      signature: String(input.headers["stripe-signature"] ?? input.headers["x-signature"] ?? ""),
      signature_valid: verified.valid,
      status: verified.status,
      remote_ip: remoteIp,
      headers: input.headers as Record<string, unknown>,
      payload: verified.rawPayload,
    });

    if (!verified.valid) {
      logger.warn(
        { provider, errorCode: verified.errorCode, message: verified.errorMessage },
        "Webhook signature invalid"
      );
      return { accepted: false };
    }

    if (!verified.orderId) {
      logger.warn({ provider }, "Webhook missing transaction reference");
      return { accepted: false };
    }

    // ACID: update transaction + ghi escrow_ledger trong 1 tx
    await withTransaction(async (client) => {
      const tx = await TransactionModel.findById(client, verified.orderId!);
      if (!tx) {
        logger.warn(
          { provider, orderId: verified.orderId },
          "Webhook tham chiếu transaction không tồn tại"
        );
        return;
      }

      // Đã xử lý rồi -> idempotent skip (PSP retry)
      if (tx.status === TransactionStatus.HELD || tx.status === TransactionStatus.RELEASED) {
        logger.info(
          { txId: tx.transaction_id, status: tx.status },
          "Webhook idempotent skip - transaction đã xử lý"
        );
        return;
      }

      // Map normalized status → internal status
      if (verified.status === "succeeded") {
        const balance = Number(tx.amount);
        await TransactionModel.updateStatus(client, tx.transaction_id, TransactionStatus.HELD, {
          provider_tx_id: verified.providerTxId,
        });
        await EscrowLedgerModel.create(client, {
          transaction_id: tx.transaction_id,
          seller_id: tx.seller_id,
          action: "hold",
          amount: balance,
          balance_before: 0,
          balance_after: balance,
          notes: `Giữ ${balance} ${tx.currency} từ ${provider}`,
        });
      } else if (verified.status === "failed" || verified.status === "cancelled") {
        await TransactionModel.updateStatus(client, tx.transaction_id, TransactionStatus.FAILED, {
          error_code: verified.errorCode,
          error_message: verified.errorMessage,
        });
      } else if (verified.status === "expired") {
        await TransactionModel.updateStatus(client, tx.transaction_id, TransactionStatus.EXPIRED, {
          error_message: "Hết hạn thanh toán",
        });
      } else if (verified.status === "refunded") {
        await TransactionModel.updateStatus(client, tx.transaction_id, TransactionStatus.REFUNDED, {
          refunded_at: new Date(),
        });
        await EscrowLedgerModel.create(client, {
          transaction_id: tx.transaction_id,
          seller_id: tx.seller_id,
          action: "refund",
          amount: Number(tx.amount),
          balance_before: Number(tx.amount),
          balance_after: 0,
          notes: "Refund từ webhook gateway",
        });
      }
    });

    return { accepted: true, transactionId: verified.orderId };
  }

  async getTransaction(transactionId: string) {
    return withTransaction(async (client) => {
      const tx = await TransactionModel.findById(client, transactionId);
      if (!tx) throw new NotFoundError("Transaction", transactionId);
      return tx;
    });
  }

  /**
   * Release escrow → seller. Chỉ gọi từ:
   *  - GHN/GHTK delivered webhook
   *  - Buyer confirm "đã nhận hàng"
   *  - Admin manual release
   *  - Cron auto-release sau ESCROW_AUTO_RELEASE_AFTER_DAYS ngày
   */
  async releaseEscrow(transactionId: string, releaseReason: string): Promise<void> {
    await withTransaction(async (client) => {
      const tx = await TransactionModel.findById(client, transactionId);
      if (!tx) throw new NotFoundError("Transaction", transactionId);
      if (tx.status !== TransactionStatus.HELD) {
        throw new ConflictError(
          `Không thể release transaction status=${tx.status}. Yêu cầu HELD.`
        );
      }

      // Tính phí: commission + payment gateway fee
      const gross = Number(tx.amount);
      const commission = gross * config.PLATFORM_COMMISSION_RATE;
      const gatewayFee = gross * config.PAYMENT_GATEWAY_FEE_RATE;
      const net = gross - commission - gatewayFee;

      await TransactionModel.updateStatus(client, transactionId, TransactionStatus.RELEASED, {
        released_at: new Date(),
        metadata: { release_reason: releaseReason, commission, gateway_fee: gatewayFee, net_amount: net },
      });

      // Ghi 3 entry vào ledger: release gross + 2 fee
      await EscrowLedgerModel.create(client, {
        transaction_id: transactionId,
        seller_id: tx.seller_id,
        action: "release",
        amount: net,
        balance_before: gross,
        balance_after: 0,
        released_at: new Date(),
        notes: `Release net ${net} sau khi trừ phí`,
        metadata: { gross, commission, gateway_fee: gatewayFee },
      });

      await EscrowLedgerModel.create(client, {
        transaction_id: transactionId,
        seller_id: tx.seller_id,
        action: "fee",
        amount: commission,
        balance_before: gross,
        balance_after: gross - commission,
        notes: "Phí hoa hồng nền tảng",
        metadata: { fee_type: "commission", rate: config.PLATFORM_COMMISSION_RATE },
      });

      await EscrowLedgerModel.create(client, {
        transaction_id: transactionId,
        seller_id: tx.seller_id,
        action: "fee",
        amount: gatewayFee,
        balance_before: gross - commission,
        balance_after: net,
        notes: "Phí cổng thanh toán",
        metadata: { fee_type: "payment_gateway", rate: config.PAYMENT_GATEWAY_FEE_RATE },
      });
    });
  }

  async refundTransaction(
    transactionId: string,
    reason: string,
    refundAmount?: number
  ): Promise<{ refundId: string }> {
    const tx = await this.getTransaction(transactionId);
    if (tx.status !== TransactionStatus.HELD && tx.status !== TransactionStatus.RELEASED) {
      throw new ConflictError(
        `Không thể refund transaction status=${tx.status}. Yêu cầu HELD hoặc RELEASED.`
      );
    }

    const amount = refundAmount ?? Number(tx.amount);
    if (amount > Number(tx.amount)) {
      throw new ConflictError("Refund amount vượt quá số tiền giao dịch");
    }

    const gateway = PaymentGatewayFactory.getGateway(tx.provider);
    const refundResult = await gateway.refund({
      transactionId: tx.transaction_id,
      providerTxId: tx.provider_tx_id ?? "",
      amount,
      currency: tx.currency as Currency,
      reason,
    });

    await withTransaction(async (client) => {
      await TransactionModel.updateStatus(client, transactionId, TransactionStatus.REFUNDED, {
        refunded_at: new Date(),
        metadata: { refund_reason: reason, refund_id: refundResult.refundId },
      });

      await EscrowLedgerModel.create(client, {
        transaction_id: transactionId,
        seller_id: tx.seller_id,
        action: "refund",
        amount,
        balance_before: Number(tx.amount),
        balance_after: Number(tx.amount) - amount,
        notes: `Refund ${amount} - lý do: ${reason}`,
        metadata: { refund_id: refundResult.refundId, provider_status: refundResult.status },
      });
    });

    return { refundId: refundResult.refundId };
  }
}

export const paymentService = new PaymentService();
