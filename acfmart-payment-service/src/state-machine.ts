export enum EscrowState {
  PENDING = 'pending',
  HELD = 'held',
  RELEASE_APPROVED = 'release_approved',
  RELEASED = 'released',
  REFUNDED = 'refunded',
  EXPIRED = 'expired',
  FAILED = 'failed',
}

export interface EscrowContext {
  orderId: string;
  amount: number;
  currency: string;
  status: EscrowState;
  releaseConditionsMet: boolean;
  refundRequested: boolean;
  expirationTime: Date;
  webhookVerified: boolean;
}

export class EscrowStateMachine {
  private context: EscrowContext;

  constructor(context: EscrowContext) {
    this.context = context;
  }

  public getCurrentState(): EscrowState {
    return this.context.status;
  }

  public getContext(): EscrowContext {
    return this.context;
  }

  public transitionTo(state: EscrowState, additionalContext?: Partial<EscrowContext>): void {
    this.context = { ...this.context, ...additionalContext, status: state };
  }

  public canTransitionTo(targetState: EscrowState): boolean {
    const currentState = this.context.status;
    
    const transitions: Record<EscrowState, EscrowState[]> = {
      [EscrowState.PENDING]: [EscrowState.HELD, EscrowState.FAILED],
      [EscrowState.HELD]: [EscrowState.RELEASE_APPROVED, EscrowState.REFUNDED, EscrowState.EXPIRED],
      [EscrowState.RELEASE_APPROVED]: [EscrowState.RELEASED],
      [EscrowState.RELEASED]: [],
      [EscrowState.REFUNDED]: [],
      [EscrowState.EXPIRED]: [EscrowState.REFUNDED],
      [EscrowState.FAILED]: [],
    };

    return transitions[currentState].includes(targetState);
  }

  public processEvent(event: string): EscrowState {
    switch (event) {
      case 'PAYMENT_RECEIVED':
        if (this.canTransitionTo(EscrowState.HELD)) {
          this.transitionTo(EscrowState.HELD);
        }
        break;
        
      case 'DELIVERY_CONFIRMED':
        if (this.canTransitionTo(EscrowState.RELEASE_APPROVED)) {
          this.transitionTo(EscrowState.RELEASE_APPROVED);
        }
        break;
        
      case 'RELEASE_TRIGGERED':
        if (this.canTransitionTo(EscrowState.RELEASED)) {
          this.transitionTo(EscrowState.RELEASED);
        }
        break;
        
      case 'REFUND_REQUESTED':
        if (this.canTransitionTo(EscrowState.REFUNDED)) {
          this.transitionTo(EscrowState.REFUNDED);
        }
        break;
        
      case 'EXPIRED':
        if (this.canTransitionTo(EscrowState.EXPIRED)) {
          this.transitionTo(EscrowState.EXPIRED);
        }
        break;
        
      case 'FAILED':
        if (this.canTransitionTo(EscrowState.FAILED)) {
          this.transitionTo(EscrowState.FAILED);
        }
        break;
        
      default:
        console.warn(`Unknown event: ${event}`);
        break;
    }
    
    return this.getCurrentState();
  }

  public evaluateState(): EscrowState {
    // Check if escrow has expired
    if (new Date() > this.context.expirationTime) {
      return EscrowState.EXPIRED;
    }

    // Check if conditions for release are met
    if (this.context.releaseConditionsMet && this.context.webhookVerified) {
      return EscrowState.RELEASE_APPROVED;
    }

    // Check if refund was requested
    if (this.context.refundRequested) {
      return EscrowState.REFUNDED;
    }

    // Otherwise return current state
    return this.context.status;
  }

  public static createInitialState(orderId: string, amount: number, currency: string): EscrowStateMachine {
    const expirationTime = new Date();
    expirationTime.setDate(expirationTime.getDate() + 30); // 30 days expiry
    
    const context: EscrowContext = {
      orderId,
      amount,
      currency,
      status: EscrowState.PENDING,
      releaseConditionsMet: false,
      refundRequested: false,
      expirationTime,
      webhookVerified: false,
    };

    return new EscrowStateMachine(context);
  }

  public static createFromContext(context: EscrowContext): EscrowStateMachine {
    return new EscrowStateMachine(context);
  }
}