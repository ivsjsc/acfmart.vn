const { 
  TransactionBaseService,
  MedusaError,
} = require("@medusajs/utils")
const { EntityManager } = require("typeorm")

class EscrowService extends TransactionBaseService {
  constructor(
    { manager, eventBusService, antiCounterfeitService },
    options
  ) {
    super(arguments[0])
    this.manager_ = manager
    this.eventBus_ = eventBusService
    this.antiCounterfeitService = antiCounterfeitService
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
      release_conditions: ["delivery_confirmed", "authenticity_verified"],
      expected_delivery_date: this.calculateExpectedDeliveryDate()
    }
    
    // Store in DB (implementation would depend on the actual DB schema)
    // await manager.insert(EscrowEntity, escrowRecord)
    
    // Emit event for notification
    await this.eventBus_.emit("escrow.created", {
      escrow_id: escrowRecord.id,
      order_id: orderId,
      amount: amount,
      status: "held",
      expected_delivery_date: escrowRecord.expected_delivery_date
    })
    
    return escrowRecord
  }

  async releasePayment(escrowId, releaseAmount, releasedById, conditionsMet = []) {
    const manager = this.manager_
    
    // Check if all required conditions are met
    const escrowRecord = await this.getEscrowStatus(escrowId)
    
    if (!escrowRecord) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Escrow record with ID ${escrowId} not found`
      )
    }
    
    // Verify conditions are met
    const requiredConditions = escrowRecord.release_conditions || []
    const fulfilledConditions = conditionsMet || []
    
    const unmetConditions = requiredConditions.filter(condition => !fulfilledConditions.includes(condition))
    
    if (unmetConditions.length > 0) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Cannot release payment. Unmet conditions: ${unmetConditions.join(', ')}`
      )
    }
    
    // Update escrow record to released status
    const updatedEscrowRecord = {
      id: escrowId,
      status: "released",
      released_amount: releaseAmount,
      released_by: releasedById,
      released_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      release_conditions_met: fulfilledConditions
    }
    
    // Update in DB (implementation would depend on the actual DB schema)
    // await manager.update(EscrowEntity, { id: escrowId }, {
    //   status: "released",
    //   released_amount: releaseAmount,
    //   released_by: releasedById,
    //   release_conditions_met: fulfilledConditions,
    //   released_at: new Date(),
    //   updated_at: new Date()
    // })
    
    // Emit event for notification
    await this.eventBus_.emit("escrow.released", {
      escrow_id: escrowId,
      release_amount: releaseAmount,
      released_by: releasedById,
      release_conditions_met: fulfilledConditions
    })
    
    return updatedEscrowRecord
  }

  async releasePaymentOnVerification(escrowId, buyerId, qrCodes) {
    // Verify each QR code in the order
    let allVerified = true;
    const verificationResults = [];
    
    for (const qrCode of qrCodes) {
      try {
        const verification = await this.antiCounterfeitService.verifyProduct(qrCode);
        verificationResults.push(verification);
        if (!verification.isValid) {
          allVerified = false;
        }
      } catch (error) {
        allVerified = false;
        verificationResults.push({
          qrCode,
          error: error.message
        });
      }
    }
    
    if (!allVerified) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Cannot release payment. One or more products failed authenticity verification."
      )
    }
    
    // Release the payment with authenticity verification condition met
    return await this.releasePayment(escrowId, null, buyerId, ["delivery_confirmed", "authenticity_verified"]);
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
      release_conditions: ["delivery_confirmed", "authenticity_verified"],
      release_conditions_met: [],
      can_release: false,
      can_refund: true,
      expected_delivery_date: this.calculateExpectedDeliveryDate(),
      days_until_auto_release: 7  // Auto-release after 7 days if conditions are met
    }
  }

  calculateExpectedDeliveryDate() {
    // Calculate expected delivery date (typically 3-7 days from today)
    const date = new Date();
    date.setDate(date.getDate() + 5); // 5 days as average
    return date.toISOString();
  }

  async initiateDispute(escrowId, initiatorId, disputeReason, evidence) {
    const manager = this.manager_
    
    // Validate dispute
    if (!disputeReason || !evidence) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Dispute must include a reason and evidence"
      )
    }
    
    // Update escrow status to disputed
    const disputeRecord = {
      id: `dispute_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      escrow_id: escrowId,
      initiator_id: initiatorId,
      dispute_reason: disputeReason,
      evidence: evidence,
      status: "under_review",
      initiated_at: new Date().toISOString(),
      resolved_at: null
    }
    
    // Store dispute in DB (implementation would depend on the actual DB schema)
    // await manager.insert(DisputeEntity, disputeRecord)
    
    // Update escrow status
    // await manager.update(EscrowEntity, { id: escrowId }, {
    //   status: "disputed",
    //   updated_at: new Date()
    // })
    
    // Emit events
    await this.eventBus_.emit("escrow.disputed", {
      escrow_id: escrowId,
      dispute_id: disputeRecord.id,
      dispute_reason: disputeReason,
      initiator_id: initiatorId
    })
    
    return disputeRecord
  }

  async resolveDispute(disputeId, resolverId, resolution, resolvedAmount) {
    const manager = this.manager_
    
    // Update dispute status
    const disputeResolution = {
      id: disputeId,
      status: "resolved",
      resolved_by: resolverId,
      resolution: resolution,  // "in_favor_of_buyer", "in_favor_of_seller", "compromise"
      resolved_amount: resolvedAmount,
      resolved_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    // Update in DB (implementation would depend on the actual DB schema)
    // await manager.update(DisputeEntity, { id: disputeId }, {
    //   status: "resolved",
    //   resolved_by: resolverId,
    //   resolution: resolution,
    //   resolved_amount: resolvedAmount,
    //   resolved_at: new Date(),
    //   updated_at: new Date()
    // })
    
    // Emit event
    await this.eventBus_.emit("dispute.resolved", {
      dispute_id: disputeId,
      resolution: resolution,
      resolved_amount: resolvedAmount,
      resolved_by: resolverId
    })
    
    return disputeResolution
  }
}

module.exports = EscrowService