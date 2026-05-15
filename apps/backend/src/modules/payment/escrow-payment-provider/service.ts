import { 
  CartService,
  OrderService,
  PaymentProcessorError,
  PaymentProcessorSessionResponse,
  PaymentSessionData,
  TransactionBaseService,
} from "@medusajs/medusa";
import { Emitter } from "@medusajs/medusa/dist/interfaces";
import axios from "axios";

import {
  IEventBusService,
  ISessionService,
} from "@medusajs/types";

import { EntityManager } from "typeorm";

import { Logger } from "@medusajs/medusa/dist/types";

type InjectedDependencies = {
  manager: EntityManager;
  eventBusService: IEventBusService;
  cartService: CartService;
  orderService: OrderService;
  logger: Logger;
};

type EscrowPaymentSessionData = {
  session_id: string;
  external_id: string;
  payment_url: string;
  status: string;
  data: Record<string, unknown>;
};

export default class EscrowPaymentService extends TransactionBaseService {
  static identifier = "escrow-payments";
  static registrationName = "escrow-payments";

  protected readonly eventBusService_: IEventBusService;
  protected readonly cartService_: CartService;
  protected readonly orderService_: OrderService;
  protected readonly logger_: Logger;

  constructor(
    { eventBusService, cartService, orderService, logger }: InjectedDependencies,
    options: Record<string, unknown>
  ) {
    super(arguments[0]);

    this.eventBusService_ = eventBusService;
    this.cartService_ = cartService;
    this.orderService_ = orderService;
    this.logger_ = logger;
  }

  async getPaymentStatus(
    paymentSessionData: PaymentSessionData
  ): Promise<"authorized" | "pending" | "requires_more" | "error" | "canceled"> {
    try {
      const { transaction_id } = paymentSessionData as unknown as EscrowPaymentSessionData;
      
      const response = await axios.get(`${process.env.PAYMENT_SERVICE_URL}/api/v1/payments/status/${transaction_id}`, {
        headers: {
          'Authorization': `Bearer ${process.env.PAYMENT_SERVICE_API_KEY}`
        }
      });

      const status = response.data.status;
      
      switch(status) {
        case 'HELD':
          return 'authorized';
        case 'PENDING':
          return 'pending';
        case 'FAILED':
        case 'REFUNDED':
          return 'error';
        case 'EXPIRED':
          return 'canceled';
        default:
          return 'pending';
      }
    } catch (error) {
      this.logger_.error(`Failed to get payment status: ${error.message}`);
      return 'error';
    }
  }

  async initiatePayment(
    context: any
  ): Promise<PaymentProcessorError | PaymentProcessorSessionResponse> {
    const { 
      amount, 
      resource_id, 
      customer, 
      currency_code,
      payment_session_id 
    } = context;

    try {
      // Call our external payment service to create a payment
      const response = await axios.post(
        `${process.env.PAYMENT_SERVICE_URL}/api/v1/payments/hold`,
        {
          order_id: resource_id,
          amount,
          currency: currency_code.toUpperCase(),
          payment_method: context.data?.payment_method || 'vnpay',
          buyer_phone: customer?.phone || 'N/A',
          redirect_url: `${process.env.FRONTEND_URL}/checkout/confirm`,
          idempotency_key: payment_session_id
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.PAYMENT_SERVICE_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        return {
          session_data: {
            transaction_id: response.data.transaction_id,
            status: response.data.status,
            payment_url: response.data.payment_url,
            expires_at: response.data.expires_at,
          } as unknown as PaymentSessionData,
        };
      } else {
        return {
          error: {
            error: "Payment initiation failed",
            code: "INIT_FAILED",
          },
        };
      }
    } catch (error) {
      this.logger_.error(`Failed to initiate payment: ${error.message}`);
      
      return {
        error: {
          error: error.message,
          code: "API_ERROR",
        },
      };
    }
  }

  async authorizePayment(
    paymentSessionData: PaymentSessionData,
    context: { 
      customer: any; 
      email: string; 
      resource_id: string; 
      authorized_amount: number; 
      payment_session_id: string; 
    }
  ): Promise<
    | {
        status: "authorized" | "pending" | "requires_more" | "error" | "canceled";
        data: PaymentSessionData;
      }
    | PaymentProcessorError
  > {
    try {
      // In escrow system, the authorization happens when the payment is held
      const status = await this.getPaymentStatus(paymentSessionData);
      
      return {
        status,
        data: paymentSessionData,
      };
    } catch (error) {
      this.logger_.error(`Failed to authorize payment: ${error.message}`);

      return {
        error: {
          error: error.message,
          code: "AUTH_ERROR",
        },
      };
    }
  }

  async cancelPayment(
    paymentSessionData: PaymentSessionData
  ): Promise<PaymentSessionData> {
    try {
      // In escrow system, we can refund the held payment
      const { transaction_id } = paymentSessionData as unknown as EscrowPaymentSessionData;
      
      await axios.post(
        `${process.env.PAYMENT_SERVICE_URL}/api/v1/payments/refund`,
        {
          transaction_id,
          reason: 'customer_cancel',
          refund_amount: paymentSessionData.amount // Assuming amount is in session data
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.PAYMENT_SERVICE_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return paymentSessionData;
    } catch (error) {
      this.logger_.error(`Failed to cancel payment: ${error.message}`);
      throw error;
    }
  }

  async capturePayment(
    paymentSessionData: PaymentSessionData
  ): Promise<PaymentSessionData> {
    try {
      // In escrow system, capturing means releasing funds to merchant after delivery
      const { transaction_id } = paymentSessionData as unknown as EscrowPaymentSessionData;
      
      const response = await axios.post(
        `${process.env.PAYMENT_SERVICE_URL}/api/v1/payments/release`,
        {
          transaction_id
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.PAYMENT_SERVICE_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        return {
          ...paymentSessionData,
          captured_at: new Date(),
          status: 'captured'
        } as unknown as PaymentSessionData;
      } else {
        throw new Error('Failed to capture payment');
      }
    } catch (error) {
      this.logger_.error(`Failed to capture payment: ${error.message}`);
      throw error;
    }
  }

  async refundPayment(
    paymentSessionData: PaymentSessionData,
    refundAmount: number
  ): Promise<PaymentSessionData> {
    try {
      const { transaction_id } = paymentSessionData as unknown as EscrowPaymentSessionData;
      
      await axios.post(
        `${process.env.PAYMENT_SERVICE_URL}/api/v1/payments/refund`,
        {
          transaction_id,
          reason: 'merchant_initiated',
          refund_amount: refundAmount
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.PAYMENT_SERVICE_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return paymentSessionData;
    } catch (error) {
      this.logger_.error(`Failed to refund payment: ${error.message}`);
      throw error;
    }
  }

  async deletePayment(
    paymentSessionData: PaymentSessionData
  ): Promise<void> {
    // In our escrow system, we just cancel the payment if it hasn't been completed yet
    try {
      await this.cancelPayment(paymentSessionData);
    } catch (error) {
      this.logger_.warn(`Failed to delete payment: ${error.message}`);
    }
  }

  async updatePayment(
    context: any
  ): Promise<PaymentProcessorError | PaymentProcessorSessionResponse> {
    // For escrow payments, updates usually mean refreshing the status
    const { payment_session_data } = context;

    return {
      session_data: payment_session_data,
    };
  }

  async updatePaymentData(
    sessionId: string,
    data: Record<string, unknown>
  ): Promise<PaymentSessionData> {
    // We don't typically update payment data in escrow system
    // since the payment is handled externally
    return data as unknown as PaymentSessionData;
  }
}