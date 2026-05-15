import { PaymentService } from '../src/services/PaymentService';
import { TransactionModel, EscrowLedgerModel } from '../src/models/Transaction';
import { Pool } from 'pg';

// Mock the database connection
jest.mock('../src/models/Transaction', () => ({
  TransactionModel: {
    create: jest.fn(),
    findById: jest.fn(),
    updateStatus: jest.fn(),
    updateStatusAndRelease: jest.fn(),
    getIdempotencyResult: jest.fn(),
  },
  EscrowLedgerModel: {
    create: jest.fn(),
  },
}));

// Mock the axios module for PSP calls
jest.mock('axios');
import axios from 'axios';

describe('PaymentService', () => {
  let paymentService: PaymentService;
  const mockClient = {
    query: jest.fn(),
    release: jest.fn(),
  };

  beforeEach(() => {
    paymentService = new PaymentService();
    jest.clearAllMocks();
    
    // Mock the pool connection
    jest.spyOn(require('pg').Pool.prototype, 'connect')
      .mockResolvedValue(mockClient);
  });

  describe('holdPayment', () => {
    it('should create a pending transaction and return payment URL', async () => {
      const mockTransaction = {
        id: 1,
        transaction_id: 'txn_test123',
        order_id: 'order_123',
        amount: 100000,
        currency: 'VND',
        payment_method: 'vnpay',
        status: 'PENDING',
        buyer_phone: '+84123456789',
        redirect_url: 'https://example.com/redirect',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      };

      (TransactionModel.create as jest.Mock).mockResolvedValue(mockTransaction);
      (axios.post as jest.Mock).mockResolvedValue({
        data: {
          payUrl: 'https://test-momo.vn/pay',
        },
      });

      const result = await paymentService.holdPayment({
        order_id: 'order_123',
        amount: 100000,
        currency: 'VND',
        payment_method: 'momowallet',
        buyer_phone: '+84123456789',
        redirect_url: 'https://example.com/redirect',
      });

      expect(TransactionModel.create).toHaveBeenCalledWith(
        expect.anything(), // client
        expect.objectContaining({
          order_id: 'order_123',
          amount: 100000,
          currency: 'VND',
          payment_method: 'momowallet',
          status: 'PENDING',
        })
      );

      expect(result).toEqual({
        transaction_id: 'txn_test123',
        status: 'PENDING',
        payment_url: 'https://test-momo.vn/pay',
        expires_at: expect.any(Date),
      });
    });

    it('should throw an error if payment method is unsupported', async () => {
      await expect(
        paymentService.holdPayment({
          order_id: 'order_123',
          amount: 100000,
          currency: 'VND',
          payment_method: 'paypal' as any, // Invalid payment method
          buyer_phone: '+84123456789',
          redirect_url: 'https://example.com/redirect',
        })
      ).rejects.toThrow('Unsupported payment method: paypal');
    });
  });

  describe('releasePayment', () => {
    it('should release a held payment', async () => {
      const mockTransaction = {
        id: 1,
        transaction_id: 'txn_test123',
        order_id: 'order_123',
        amount: 100000,
        status: 'HELD',
        buyer_phone: '+84123456789',
        redirect_url: 'https://example.com/redirect',
        created_at: new Date(),
        updated_at: new Date(),
      };

      (TransactionModel.findById as jest.Mock).mockResolvedValue(mockTransaction);
      (TransactionModel.updateStatusAndRelease as jest.Mock).mockResolvedValue({
        ...mockTransaction,
        status: 'RELEASED',
      });
      (EscrowLedgerModel.create as jest.Mock).mockResolvedValue({
        id: 1,
        transaction_id: 'txn_test123',
        action: 'release',
        amount: 100000,
        balance_before: 100000,
        balance_after: 0,
        notes: 'Released funds to merchant after delivery confirmation',
        created_at: new Date(),
      });

      const result = await paymentService.releasePayment({
        transaction_id: 'txn_test123',
      });

      expect(TransactionModel.findById).toHaveBeenCalledWith(
        expect.anything(), // client
        'txn_test123'
      );

      expect(TransactionModel.updateStatusAndRelease).toHaveBeenCalledWith(
        expect.anything(), // client
        'txn_test123',
        'RELEASED',
        undefined
      );

      expect(EscrowLedgerModel.create).toHaveBeenCalledWith(
        expect.anything(), // client
        expect.objectContaining({
          transaction_id: 'txn_test123',
          action: 'release',
          amount: 100000,
          notes: 'Released funds to merchant after delivery confirmation',
        })
      );

      expect(result).toEqual({
        status: 'RELEASED',
        released_at: expect.any(Date),
        amount: 100000,
      });
    });

    it('should throw an error if transaction is not found', async () => {
      (TransactionModel.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        paymentService.releasePayment({
          transaction_id: 'nonexistent',
        })
      ).rejects.toThrow('Transaction with ID nonexistent not found');
    });

    it('should throw an error if transaction is not in HELD status', async () => {
      const mockTransaction = {
        id: 1,
        transaction_id: 'txn_test123',
        order_id: 'order_123',
        amount: 100000,
        status: 'PENDING', // Not HELD
        buyer_phone: '+84123456789',
        redirect_url: 'https://example.com/redirect',
        created_at: new Date(),
        updated_at: new Date(),
      };

      (TransactionModel.findById as jest.Mock).mockResolvedValue(mockTransaction);

      await expect(
        paymentService.releasePayment({
          transaction_id: 'txn_test123',
        })
      ).rejects.toThrow('Cannot release transaction with status PENDING. Expected HELD.');
    });
  });

  describe('refundPayment', () => {
    it('should refund a held payment', async () => {
      const mockTransaction = {
        id: 1,
        transaction_id: 'txn_test123',
        order_id: 'order_123',
        amount: 100000,
        status: 'HELD',
        buyer_phone: '+84123456789',
        redirect_url: 'https://example.com/redirect',
        created_at: new Date(),
        updated_at: new Date(),
      };

      (TransactionModel.findById as jest.Mock).mockResolvedValue(mockTransaction);
      (TransactionModel.updateStatus as jest.Mock).mockResolvedValue({
        ...mockTransaction,
        status: 'REFUNDED',
      });
      (EscrowLedgerModel.create as jest.Mock).mockResolvedValue({
        id: 1,
        transaction_id: 'txn_test123',
        action: 'refund',
        amount: 100000,
        balance_before: 100000,
        balance_after: 0,
        notes: 'Refund issued: buyer_cancel',
        created_at: new Date(),
      });

      const result = await paymentService.refundPayment({
        transaction_id: 'txn_test123',
        reason: 'buyer_cancel',
        refund_amount: 100000,
      });

      expect(TransactionModel.findById).toHaveBeenCalledWith(
        expect.anything(), // client
        'txn_test123'
      );

      expect(TransactionModel.updateStatus).toHaveBeenCalledWith(
        expect.anything(), // client
        'txn_test123',
        'REFUNDED'
      );

      expect(EscrowLedgerModel.create).toHaveBeenCalledWith(
        expect.anything(), // client
        expect.objectContaining({
          transaction_id: 'txn_test123',
          action: 'refund',
          amount: 100000,
          notes: 'Refund issued: buyer_cancel',
        })
      );

      expect(result).toEqual({
        status: 'REFUNDED',
        refund_transaction_id: expect.stringMatching(/^ref_/),
      });
    });
  });

  describe('getPaymentStatus', () => {
    it('should return payment status', async () => {
      const mockTransaction = {
        id: 1,
        transaction_id: 'txn_test123',
        order_id: 'order_123',
        amount: 100000,
        status: 'HELD',
        buyer_phone: '+84123456789',
        redirect_url: 'https://example.com/redirect',
        created_at: new Date(),
        updated_at: new Date(),
      };

      (TransactionModel.findById as jest.Mock).mockResolvedValue(mockTransaction);

      const result = await paymentService.getPaymentStatus('txn_test123');

      expect(TransactionModel.findById).toHaveBeenCalledWith(
        expect.anything(), // client
        'txn_test123'
      );

      expect(result).toEqual({
        status: 'HELD',
        amount: 100000,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
        psp_reference: undefined,
        error_message: undefined,
      });
    });
  });
});