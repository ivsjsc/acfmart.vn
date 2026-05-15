export enum EscrowState {
  INITIATED = 'INITIATED',
  PAYMENT_HELD = 'PAYMENT_HELD',
  ORDER_PLACED = 'ORDER_PLACED',
  SHIPMENT_CREATED = 'SHIPMENT_CREATED',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  RELEASE_APPROVED = 'RELEASE_APPROVED',
  FUNDS_RELEASED = 'FUNDS_RELEASED',
  DISPUTE_RAISED = 'DISPUTE_RAISED',
  DISPUTE_RESOLVED = 'DISPUTE_RESOLVED',
  REFUNDED = 'REFUNDED',
  COMPLETED = 'COMPLETED',
  EXPIRED = 'EXPIRED'
}

export enum EscrowEvent {
  PAYMENT_AUTHORIZED = 'PAYMENT_AUTHORIZED',
  PAYMENT_CAPTURED = 'PAYMENT_CAPTURED',
  ORDER_CONFIRMED = 'ORDER_CONFIRMED',
  SHIPMENT_INITIATED = 'SHIPMENT_INITIATED',
  SHIPMENT_DISPATCHED = 'SHIPMENT_DISPATCHED',
  SHIPMENT_IN_TRANSIT = 'SHIPMENT_IN_TRANSIT',
  SHIPMENT_DELIVERED = 'SHIPMENT_DELIVERED',
  RELEASE_APPROVED = 'RELEASE_APPROVED',
  FUNDS_RELEASED = 'FUNDS_RELEASED',
  DISPUTE_RAISED = 'DISPUTE_RAISED',
  DISPUTE_RESOLVED = 'DISPUTE_RESOLVED',
  REFUND_INITIATED = 'REFUND_INITIATED',
  REFUND_PROCESSED = 'REFUND_PROCESSED',
  EXPIRED = 'EXPIRED'
}

export interface EscrowTransition {
  from: EscrowState;
  event: EscrowEvent;
  to: EscrowState;
  guard?: (context: any) => boolean;
  action?: (context: any) => Promise<void> | void;
}

export class EscrowStateMachine {
  private transitions: EscrowTransition[];
  private currentState: EscrowState;

  constructor(initialState: EscrowState = EscrowState.INITIATED) {
    this.currentState = initialState;
    this.transitions = this.defineTransitions();
  }

  private defineTransitions(): EscrowTransition[] {
    return [
      // Initial to holding payment
      {
        from: EscrowState.INITIATED,
        event: EscrowEvent.PAYMENT_AUTHORIZED,
        to: EscrowState.PAYMENT_HELD,
        guard: (context: any) => !!context.paymentId && context.amount > 0
      },

      // Order placement
      {
        from: EscrowState.PAYMENT_HELD,
        event: EscrowEvent.ORDER_CONFIRMED,
        to: EscrowState.ORDER_PLACED
      },

      // Shipment creation
      {
        from: EscrowState.ORDER_PLACED,
        event: EscrowEvent.SHIPMENT_INITIATED,
        to: EscrowState.SHIPMENT_CREATED
      },

      // Shipment lifecycle
      {
        from: EscrowState.SHIPMENT_CREATED,
        event: EscrowEvent.SHIPMENT_DISPATCHED,
        to: EscrowState.IN_TRANSIT
      },
      {
        from: EscrowState.IN_TRANSIT,
        event: EscrowEvent.SHIPMENT_DELIVERED,
        to: EscrowState.DELIVERED
      },

      // Release approval process
      {
        from: EscrowState.DELIVERED,
        event: EscrowEvent.RELEASE_APPROVED,
        to: EscrowState.RELEASE_APPROVED
      },

      // Funds release
      {
        from: EscrowState.RELEASE_APPROVED,
        event: EscrowEvent.FUNDS_RELEASED,
        to: EscrowState.FUNDS_RELEASED
      },

      // Completion
      {
        from: EscrowState.FUNDS_RELEASED,
        event: EscrowEvent.PAYMENT_CAPTURED,
        to: EscrowState.COMPLETED
      },

      // Dispute handling
      {
        from: EscrowState.ORDER_PLACED,
        event: EscrowEvent.DISPUTE_RAISED,
        to: EscrowState.DISPUTE_RAISED
      },
      {
        from: EscrowState.IN_TRANSIT,
        event: EscrowEvent.DISPUTE_RAISED,
        to: EscrowState.DISPUTE_RAISED
      },
      {
        from: EscrowState.DELIVERED,
        event: EscrowEvent.DISPUTE_RAISED,
        to: EscrowState.DISPUTE_RAISED
      },
      {
        from: EscrowState.DISPUTE_RAISED,
        event: EscrowEvent.DISPUTE_RESOLVED,
        to: (context: any) => context.resolution === 'customer' ? EscrowState.REFUNDED : EscrowState.RELEASE_APPROVED
      },

      // Refund path
      {
        from: EscrowState.DISPUTE_RAISED,
        event: EscrowEvent.REFUND_PROCESSED,
        to: EscrowState.REFUNDED
      },
      {
        from: EscrowState.ORDER_PLACED,
        event: EscrowEvent.REFUND_INITIATED,
        to: EscrowState.REFUNDED
      },
      {
        from: EscrowState.IN_TRANSIT,
        event: EscrowEvent.REFUND_INITIATED,
        to: EscrowState.REFUNDED
      },

      // Expiration
      {
        from: EscrowState.PAYMENT_HELD,
        event: EscrowEvent.EXPIRED,
        to: EscrowState.EXPIRED
      }
    ];
  }

  public async trigger(event: EscrowEvent, context: any = {}): Promise<EscrowState> {
    const transition = this.transitions.find(t => 
      t.from === this.currentState && 
      t.event === event &&
      (!t.guard || t.guard(context))
    );

    if (!transition) {
      throw new Error(`Invalid transition: ${this.currentState} + ${event} -> ?`);
    }

    // Determine the target state (could be dynamic)
    const targetState = typeof transition.to === 'function' 
      ? transition.to(context) 
      : transition.to;

    // Execute any side effects
    if (transition.action) {
      await transition.action(context);
    }

    // Update the state
    this.currentState = targetState;
    return this.currentState;
  }

  public getCurrentState(): EscrowState {
    return this.currentState;
  }

  public canTrigger(event: EscrowEvent): boolean {
    return !!this.transitions.find(t => 
      t.from === this.currentState && 
      t.event === event &&
      (!t.guard || t.guard({}))
    );
  }
}

// Helper functions for common escrow operations
export class EscrowHelper {
  static async processDeliveryConfirmation(transactionId: string): Promise<EscrowState> {
    const stateMachine = new EscrowStateMachine();
    
    // In a real implementation, we'd fetch the current state from DB
    // For now, we'll assume it's in the delivered state
    stateMachine['currentState'] = EscrowState.DELIVERED;
    
    // Approve the release and release funds
    await stateMachine.trigger(EscrowEvent.RELEASE_APPROVED, { transactionId });
    await stateMachine.trigger(EscrowEvent.FUNDS_RELEASED, { transactionId });
    await stateMachine.trigger(EscrowEvent.PAYMENT_CAPTURED, { transactionId });
    
    return stateMachine.getCurrentState(); // Should be COMPLETED
  }

  static async processDispute(transactionId: string, resolution: 'customer' | 'merchant'): Promise<EscrowState> {
    const stateMachine = new EscrowStateMachine();
    
    // In a real implementation, we'd fetch the current state from DB
    stateMachine['currentState'] = EscrowState.DELIVERED; // Assume delivered state for dispute
    
    // Raise and resolve dispute
    await stateMachine.trigger(EscrowEvent.DISPUTE_RAISED, { 
      transactionId,
      reason: 'quality_issue' // Example reason
    });
    
    await stateMachine.trigger(EscrowEvent.DISPUTE_RESOLVED, { 
      transactionId,
      resolution 
    });
    
    if (resolution === 'customer') {
      await stateMachine.trigger(EscrowEvent.REFUND_PROCESSED, { transactionId });
    } else {
      await stateMachine.trigger(EscrowEvent.FUNDS_RELEASED, { transactionId });
    }
    
    return stateMachine.getCurrentState();
  }
}