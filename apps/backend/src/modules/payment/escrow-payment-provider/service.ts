import { 
  CartService,
  OrderService,
  PaymentProcessorError,
  PaymentProcessorSessionResponse,
  PaymentSessionData,
  TransactionBaseService,
  Logger
} from "@medusajs/medusa";
import { EntityManager } from "@medusajs/medusa/dist/interfaces";
import { ISessionService } from "@medusajs/types";
import { DataSource } from "typeorm";
import { PaymentCollection, PaymentSession } from "@medusajs/medusa/dist/models";

export interface EscrowPaymentSessionData extends PaymentSessionData {
  transaction_id: string;
  payment_url?: string;
  expires_at?: Date;
  provider_reference?: string;
}

class EscrowPaymentService extends TransactionBaseService {
  protected manager_: EntityManager;
  protected transactionManager_: EntityManager;
  protected readonly logger_: Logger;

  constructor(container) {
    super(container);
    this.logger_ = container.logger;
  }

  async init(): Promise<void> {
    this.logger_.info("Initializing Escrow Payment Service.");
  }

  async createSession(
    paymentSessionData: PaymentSession,
    order_id: string
  ): Promise<EscrowPaymentSessionData> {
    try {
      // Create a hold on the payment
      const paymentService = this.container_[PaymentService];
      const result = await paymentService.holdPayment({
        order_id: order_id,
        amount: paymentSessionData.amount,
        currency: paymentSessionData.currency_code,
        payment_method: paymentSessionData.provider_id as any, // Assuming provider_id maps to payment method
        buyer_phone: "temp-phone", // Should come from customer data
        redirect_url: process.env.REDIRECT_URL || "http://localhost:8000"
      });

      return {
        transaction_id: result.transaction_id,
        payment_url: result.payment_url,
        expires_at: result.expires_at,
        provider_reference: result.transaction_id
      };
    } catch (error) {
      this.logger_.error(`Error creating escrow payment session: ${(error as Error).message}`);
      throw new PaymentProcessorError(
        "CREATE_SESSION_ERROR",
        `Failed to create escrow payment session: ${(error as Error).message}`
      );
    }
  }

  async refreshSession(
    paymentSessionData: EscrowPaymentSessionData,
    order_id: string
  ): Promise<EscrowPaymentSessionData> {
    try {
      // Check the current status of the transaction
      const paymentService = this.container_[PaymentService];
      const status = await paymentService.getPaymentStatus(paymentSessionData.transaction_id);

      if (status.status === "pending") {
        // If still pending, return the same session data
        return paymentSessionData;
      } else if (status.status === "held") {
        // Payment has been made and funds are held in escrow
        return {
          ...paymentSessionData,
          provider_reference: paymentSessionData.transaction_id
        };
      } else {
        // Handle other states as needed
        return paymentSessionData;
      }
    } catch (error) {
      this.logger_.error(`Error refreshing escrow payment session: ${(error as Error).message}`);
      throw new PaymentProcessorError(
        "REFRESH_SESSION_ERROR",
        `Failed to refresh escrow payment session: ${(error as Error).message}`
      );
    }
  }

  async updateSession(
    paymentSessionData: EscrowPaymentSessionData,
    update: Partial<PaymentSessionData>
  ): Promise<EscrowPaymentSessionData> {
    try {
      // For escrow, we typically don't allow updates to the payment amount
      // after the initial creation, so we'll just return the current data
      return paymentSessionData;
    } catch (error) {
      this.logger_.error(`Error updating escrow payment session: ${(error as Error).message}`);
      throw new PaymentProcessorError(
        "UPDATE_SESSION_ERROR",
        `Failed to update escrow payment session: ${(error as Error).message}`
      );
    }
  }

  async authorizePayment(
    paymentSessionData: EscrowPaymentSessionData,
    context: { customer_id: string; email: string; order_id: string }
  ): Promise<PaymentProcessorSessionResponse> {
    try {
      // In escrow, authorization means the payment has been made
      // and funds are held in escrow pending fulfillment
      const paymentService = this.container_[PaymentService];
      const status = await paymentService.getPaymentStatus(paymentSessionData.transaction_id);

      if (status.status === "held") {
        return {
          status: "authorized",
          data: {
            ...paymentSessionData,
            provider_reference: paymentSessionData.transaction_id
          }
        };
      } else if (status.status === "pending") {
        // Return pending status to indicate waiting for payment
        return {
          status: "pending",
          data: paymentSessionData
        };
      } else {
        return {
          status: "error",
          data: {
            ...paymentSessionData,
            error: `Payment status is ${status.status}`
          }
        };
      }
    } catch (error) {
      this.logger_.error(`Error authorizing escrow payment: ${(error as Error).message}`);
      return {
        status: "error",
        data: {
          ...paymentSessionData,
          error: `Authorization error: ${(error as Error).message}`
        }
      };
    }
  }

  async cancelPayment(
    paymentSessionData: EscrowPaymentSessionData
  ): Promise<EscrowPaymentSessionData> {
    try {
      // Cancel means releasing funds back to customer
      const paymentService = this.container_[PaymentService];
      const result = await paymentService.refundPayment({
        transaction_id: paymentSessionData.transaction_id,
        reason: "cancelled",
        refund_amount: paymentSessionData.amount // Assuming amount is available in session data
      });

      return {
        ...paymentSessionData,
        status: result.status
      };
    } catch (error) {
      this.logger_.error(`Error cancelling escrow payment: ${(error as Error).message}`);
      throw new PaymentProcessorError(
        "CANCEL_PAYMENT_ERROR",
        `Failed to cancel escrow payment: ${(error as Error).message}`
      );
    }
  }

  async capturePayment(
    paymentSessionData: EscrowPaymentSessionData
  ): Promise<EscrowPaymentSessionData> {
    try {
      // In escrow, capture means releasing funds to merchant
      // This happens automatically when delivery is confirmed
      // For this implementation, we'll call our releasePayment method
      const paymentService = this.container_[PaymentService];
      const result = await paymentService.releasePayment({
        transaction_id: paymentSessionData.transaction_id
      });

      return {
        ...paymentSessionData,
        status: result.status
      };
    } catch (error) {
      this.logger_.error(`Error capturing escrow payment: ${(error as Error).message}`);
      throw new PaymentProcessorError(
        "CAPTURE_PAYMENT_ERROR",
        `Failed to capture escrow payment: ${(error as Error).message}`
      );
    }
  }

  async refundPayment(
    paymentSessionData: EscrowPaymentSessionData,
    refundAmount: number
  ): Promise<EscrowPaymentSessionData> {
    try {
      // Refund means returning money to customer
      const paymentService = this.container_[PaymentService];
      const result = await paymentService.refundPayment({
        transaction_id: paymentSessionData.transaction_id,
        reason: "refunded",
        refund_amount: refundAmount
      });

      return {
        ...paymentSessionData,
        status: result.status
      };
    } catch (error) {
      this.logger_.error(`Error refunding escrow payment: ${(error as Error).message}`);
      throw new PaymentProcessorError(
        "REFUND_PAYMENT_ERROR",
        `Failed to refund escrow payment: ${(error as Error).message}`
      );
    }
  }

  async getPaymentStatus(
    paymentSessionData: EscrowPaymentSessionData
  ): Promise<'authorized' | 'pending' | 'requires_more' | 'error' | 'cancelled'> {
    try {
      const paymentService = this.container_[PaymentService];
      const status = await paymentService.getPaymentStatus(paymentSessionData.transaction_id);

      switch (status.status) {
        case "held":
          return "authorized";
        case "pending":
          return "pending";
        case "failed":
        case "expired":
          return "error";
        case "released":
          return "authorized"; // Funds released to merchant
        case "refunded":
          return "cancelled";
        default:
          return "pending";
      }
    } catch (error) {
      this.logger_.error(`Error getting payment status: ${(error as Error).message}`);
      return "error";
    }
  }
}

export default EscrowPaymentService;