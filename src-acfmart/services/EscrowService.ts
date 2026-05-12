export interface EscrowTransaction {
  id: string;
  orderId: string;
  customerId: string;
  shopId: string;
  amount: number;
  status: 'held' | 'released' | 'disputed' | 'refunded';
  holdDate: Date;
  releaseDate?: Date;
  disputeReason?: string;
  autoReleaseDate: Date; // 7 days after delivery
}

export interface Dispute {
  id: string;
  escrowTransactionId: string;
  customerId: string;
  shopId: string;
  reason: string;
  description: string;
  evidence: string[];
  status: 'pending' | 'investigating' | 'resolved_customer' | 'resolved_shop' | 'cancelled';
  createdAt: Date;
  resolvedAt?: Date;
  resolution?: string;
}

class EscrowService {
  private escrowTransactions: Map<string, EscrowTransaction> = new Map();
  private disputes: Map<string, Dispute> = new Map();

  // Hold money when order is paid
  holdPayment(orderId: string, customerId: string, shopId: string, amount: number): EscrowTransaction {
    const transaction: EscrowTransaction = {
      id: `escrow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      orderId,
      customerId,
      shopId,
      amount,
      status: 'held',
      holdDate: new Date(),
      autoReleaseDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    };

    this.escrowTransactions.set(transaction.id, transaction);
    console.log(`💰 Escrow: Held ${amount.toLocaleString('vi-VN')} ₫ for order ${orderId}`);
    
    return transaction;
  }

  // Release money to shop after confirmation
  releasePayment(escrowTransactionId: string): boolean {
    const transaction = this.escrowTransactions.get(escrowTransactionId);
    if (!transaction || transaction.status !== 'held') {
      return false;
    }

    transaction.status = 'released';
    transaction.releaseDate = new Date();
    
    console.log(`💰 Escrow: Released ${transaction.amount.toLocaleString('vi-VN')} ₫ to shop ${transaction.shopId}`);
    console.log(`📧 Email: Payment released notification sent to shop and customer`);
    
    return true;
  }

  // Create dispute
  createDispute(
    escrowTransactionId: string, 
    customerId: string, 
    shopId: string, 
    reason: string, 
    description: string
  ): Dispute {
    const dispute: Dispute = {
      id: `dispute_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      escrowTransactionId,
      customerId,
      shopId,
      reason,
      description,
      evidence: [],
      status: 'pending',
      createdAt: new Date()
    };

    this.disputes.set(dispute.id, dispute);
    
    // Update transaction status
    const transaction = this.escrowTransactions.get(escrowTransactionId);
    if (transaction) {
      transaction.status = 'disputed';
    }

    console.log(`⚠️ Dispute created: ${reason} for order ${dispute.escrowTransactionId}`);
    console.log(`📧 Email: Dispute notification sent to ACF admin, shop, and customer`);
    
    return dispute;
  }

  // Resolve dispute in favor of customer (refund)
  resolveDisputeForCustomer(disputeId: string, resolution: string): boolean {
    const dispute = this.disputes.get(disputeId);
    if (!dispute) return false;

    dispute.status = 'resolved_customer';
    dispute.resolvedAt = new Date();
    dispute.resolution = resolution;

    // Refund money to customer
    const transaction = this.escrowTransactions.get(dispute.escrowTransactionId);
    if (transaction) {
      transaction.status = 'refunded';
      transaction.releaseDate = new Date();
      
      console.log(`💰 Refund: ${transaction.amount.toLocaleString('vi-VN')} ₫ refunded to customer ${transaction.customerId}`);
      console.log(`📧 Email: Refund notification sent to customer and shop`);
    }

    console.log(`✅ Dispute resolved in favor of customer: ${disputeId}`);
    return true;
  }

  // Resolve dispute in favor of shop (release payment)
  resolveDisputeForShop(disputeId: string, resolution: string): boolean {
    const dispute = this.disputes.get(disputeId);
    if (!dispute) return false;

    dispute.status = 'resolved_shop';
    dispute.resolvedAt = new Date();
    dispute.resolution = resolution;

    // Release money to shop
    const transaction = this.escrowTransactions.get(dispute.escrowTransactionId);
    if (transaction) {
      transaction.status = 'released';
      transaction.releaseDate = new Date();
      
      console.log(`💰 Payment released: ${transaction.amount.toLocaleString('vi-VN')} ₫ released to shop ${transaction.shopId}`);
      console.log(`📧 Email: Payment release notification sent to shop and customer`);
    }

    console.log(`✅ Dispute resolved in favor of shop: ${disputeId}`);
    return true;
  }

  // Auto-release after 7 days if no dispute
  checkAutoRelease(): string[] {
    const now = new Date();
    const releasedTransactions: string[] = [];

    for (const [id, transaction] of this.escrowTransactions) {
      if (transaction.status === 'held' && now >= transaction.autoReleaseDate) {
        this.releasePayment(id);
        releasedTransactions.push(id);
        console.log(`⏰ Auto-release: Payment for order ${transaction.orderId} automatically released after 7 days`);
      }
    }

    return releasedTransactions;
  }

  // Get transaction by order ID
  getTransactionByOrderId(orderId: string): EscrowTransaction | undefined {
    for (const transaction of this.escrowTransactions.values()) {
      if (transaction.orderId === orderId) {
        return transaction;
      }
    }
    return undefined;
  }

  // Get all transactions for a customer
  getCustomerTransactions(customerId: string): EscrowTransaction[] {
    return Array.from(this.escrowTransactions.values())
      .filter(transaction => transaction.customerId === customerId);
  }

  // Get all transactions for a shop
  getShopTransactions(shopId: string): EscrowTransaction[] {
    return Array.from(this.escrowTransactions.values())
      .filter(transaction => transaction.shopId === shopId);
  }

  // Get all disputes
  getDisputes(): Dispute[] {
    return Array.from(this.disputes.values());
  }

  // Get disputes for customer
  getCustomerDisputes(customerId: string): Dispute[] {
    return Array.from(this.disputes.values())
      .filter(dispute => dispute.customerId === customerId);
  }

  // Get disputes for shop
  getShopDisputes(shopId: string): Dispute[] {
    return Array.from(this.disputes.values())
      .filter(dispute => dispute.shopId === shopId);
  }

  // Get escrow statistics
  getEscrowStats() {
    const transactions = Array.from(this.escrowTransactions.values());
    const disputes = Array.from(this.disputes.values());

    return {
      totalHeld: transactions
        .filter(t => t.status === 'held')
        .reduce((sum, t) => sum + t.amount, 0),
      totalReleased: transactions
        .filter(t => t.status === 'released')
        .reduce((sum, t) => sum + t.amount, 0),
      totalRefunded: transactions
        .filter(t => t.status === 'refunded')
        .reduce((sum, t) => sum + t.amount, 0),
      activeTransactions: transactions.filter(t => t.status === 'held').length,
      pendingDisputes: disputes.filter(d => d.status === 'pending' || d.status === 'investigating').length,
      totalTransactions: transactions.length,
      totalDisputes: disputes.length
    };
  }
}

// Export singleton instance
export const escrowService = new EscrowService();

// Helper functions for integration
export const createEscrowPayment = (orderId: string, customerId: string, shopId: string, amount: number) => {
  return escrowService.holdPayment(orderId, customerId, shopId, amount);
};

export const releaseEscrowPayment = (orderId: string) => {
  const transaction = escrowService.getTransactionByOrderId(orderId);
  if (transaction) {
    return escrowService.releasePayment(transaction.id);
  }
  return false;
};

export const createPaymentDispute = (orderId: string, customerId: string, shopId: string, reason: string, description: string) => {
  const transaction = escrowService.getTransactionByOrderId(orderId);
  if (transaction) {
    return escrowService.createDispute(transaction.id, customerId, shopId, reason, description);
  }
  return null;
};

export const getEscrowStatus = (orderId: string) => {
  return escrowService.getTransactionByOrderId(orderId);
};
