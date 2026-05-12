const { 
  TransactionBaseService,
  MedusaError,
} = require("@medusajs/utils")
const { EntityManager } = require("typeorm")

class EscrowService extends TransactionBaseService {
  constructor(
    { manager, eventBusService },
    options
  ) {
    super(arguments[0])
    this.manager_ = manager
    this.eventBus_ = eventBusService
    this.options_ = options || {}
  }

  async createEscrow(orderId, amount, currency, buyerId, sellerId, paymentMethod) {
    const manager = this.manager_
    
    // Create an escrow record
    const escrowRecord = {
      id: `escrow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      order_id: orderId,
      amount: amount,
      currency: currency,
      buyer_id: buyerId,
      seller_id: sellerId,
      payment_method: paymentMethod,
      status: "held",
      held_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    
    // Store in DB (implementation would depend on the actual DB schema)
    // await manager.insert(EscrowEntity, escrowRecord)
    
    // Emit event for notification
    await this.eventBus_.emit("escrow.created", {
      escrow_id: escrowRecord.id,
      order_id: orderId,
      amount: amount,
      status: "held"
    })
    
    return escrowRecord
  }

  async releasePayment(escrowId, releaseAmount, releasedById) {
    const manager = this.manager_
    
    // Update escrow record to released status
    const escrowRecord = {
      id: escrowId,
      status: "released",
      released_amount: releaseAmount,
      released_by: releasedById,
      released_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    
    // Update in DB (implementation would depend on the actual DB schema)
    // await manager.update(EscrowEntity, { id: escrowId }, {
    //   status: "released",
    //   released_amount: releaseAmount,
    //   released_by: releasedById,
    //   released_at: new Date(),
    //   updated_at: new Date()
    // })
    
    // Emit event for notification
    await this.eventBus_.emit("escrow.released", {
      escrow_id: escrowId,
      release_amount: releaseAmount,
      released_by: releasedById
    })
    
    return escrowRecord
  }

  async refundPayment(escrowId, refundAmount, refundedById, reason) {
    const manager = this.manager_
    
    // Update escrow record to refunded status
    const escrowRecord = {
      id: escrowId,
      status: "refunded",
      refunded_amount: refundAmount,
      refunded_by: refundedById,
      refund_reason: reason,
      refunded_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    
    // Update in DB (implementation would depend on the actual DB schema)
    // await manager.update(EscrowEntity, { id: escrowId }, {
    //   status: "refunded",
    //   refunded_amount: refundAmount,
    //   refunded_by: refundedById,
    //   refund_reason: reason,
    //   refunded_at: new Date(),
    //   updated_at: new Date()
    // })
    
    // Emit event for notification
    await this.eventBus_.emit("escrow.refunded", {
      escrow_id: escrowId,
      refund_amount: refundAmount,
      refunded_by: refundedById,
      reason: reason
    })
    
    return escrowRecord
  }

  async getEscrowStatus(escrowId) {
    // Retrieve escrow record from DB
    // const escrowRecord = await manager.findOne(EscrowEntity, {
    //   where: { id: escrowId }
    // })
    
    // For demo purposes, return a mock escrow status
    return {
      id: escrowId,
      status: "held",
      amount: 1500000,
      currency: "VND",
      buyer_id: "BUY-001",
      seller_id: "SELL-001",
      order_id: "ORD-001",
      held_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      can_release: true,
      can_refund: true
    }
  }
}

module.exports = EscrowService