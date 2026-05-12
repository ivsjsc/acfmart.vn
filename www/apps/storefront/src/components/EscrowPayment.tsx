import React, { useState } from 'react';

interface EscrowPaymentProps {
  orderId: string;
  amount: number;
  currency: string;
  buyerId: string;
  sellerId: string;
}

interface EscrowStatus {
  status: 'pending' | 'held' | 'released' | 'refunded';
  heldAmount: number;
  releasedAmount: number;
  refundedAmount: number;
  createdAt: string;
  updatedAt: string;
}

const EscrowPayment: React.FC<EscrowPaymentProps> = ({ 
  orderId, 
  amount, 
  currency, 
  buyerId, 
  sellerId 
}) => {
  const [escrowStatus, setEscrowStatus] = useState<EscrowStatus>({
    status: 'pending',
    heldAmount: 0,
    releasedAmount: 0,
    refundedAmount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  
  const [loading, setLoading] = useState(false);
  const [releaseConfirmation, setReleaseConfirmation] = useState(false);

  const handleHoldPayment = async () => {
    setLoading(true);
    
    // Simulate holding payment in escrow
    setTimeout(() => {
      setEscrowStatus(prev => ({
        ...prev,
        status: 'held',
        heldAmount: amount,
        updatedAt: new Date().toISOString()
      }));
      setLoading(false);
    }, 1500);
  };

  const handleReleasePayment = async () => {
    if (!releaseConfirmation) {
      setReleaseConfirmation(true);
      return;
    }
    
    setLoading(true);
    
    // Simulate releasing payment to seller
    setTimeout(() => {
      setEscrowStatus(prev => ({
        ...prev,
        status: 'released',
        releasedAmount: amount,
        updatedAt: new Date().toISOString()
      }));
      setLoading(false);
      setReleaseConfirmation(false);
    }, 1500);
  };

  const handleRefundPayment = async () => {
    setLoading(true);
    
    // Simulate refunding payment to buyer
    setTimeout(() => {
      setEscrowStatus(prev => ({
        ...prev,
        status: 'refunded',
        refundedAmount: amount,
        updatedAt: new Date().toISOString()
      }));
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="escrow-payment">
      <h3>Escrow Payment System</h3>
      <div className="payment-details">
        <p><strong>Order ID:</strong> {orderId}</p>
        <p><strong>Amount:</strong> {amount.toLocaleString()} {currency}</p>
        <p><strong>Buyer:</strong> {buyerId}</p>
        <p><strong>Seller:</strong> {sellerId}</p>
        <p><strong>Status:</strong> 
          <span className={`status ${escrowStatus.status}`}>
            {escrowStatus.status.charAt(0).toUpperCase() + escrowStatus.status.slice(1)}
          </span>
        </p>
      </div>

      <div className="escrow-actions">
        {escrowStatus.status === 'pending' && (
          <button 
            onClick={handleHoldPayment} 
            disabled={loading}
            className="action-btn hold"
          >
            {loading ? 'Processing...' : 'Hold Payment in Escrow'}
          </button>
        )}

        {escrowStatus.status === 'held' && (
          <>
            {!releaseConfirmation ? (
              <button 
                onClick={handleReleasePayment} 
                disabled={loading}
                className="action-btn release"
              >
                {loading ? 'Processing...' : 'Release Payment to Seller'}
              </button>
            ) : (
              <div className="confirmation-prompt">
                <p>Are you sure you want to release the payment?</p>
                <div className="confirmation-buttons">
                  <button 
                    onClick={handleReleasePayment} 
                    disabled={loading}
                    className="action-btn confirm"
                  >
                    Yes, Release
                  </button>
                  <button 
                    onClick={() => setReleaseConfirmation(false)}
                    className="action-btn cancel"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            
            <button 
              onClick={handleRefundPayment} 
              disabled={loading}
              className="action-btn refund"
            >
              Refund to Buyer
            </button>
          </>
        )}

        {(escrowStatus.status === 'released' || escrowStatus.status === 'refunded') && (
          <p>Payment has been processed. No further action required.</p>
        )}
      </div>
    </div>
  );
};

export default EscrowPayment;