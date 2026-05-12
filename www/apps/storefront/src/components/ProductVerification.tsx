import React, { useState, useEffect } from 'react';

interface ProductVerificationProps {
  productId: string;
}

interface VerificationResult {
  isValid: boolean;
  authenticity: string;
  details: string;
  timestamp: string;
}

const ProductVerification: React.FC<ProductVerificationProps> = ({ productId }) => {
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState('');

  // Simulate scanning a QR code
  useEffect(() => {
    // In a real app, this would come from a camera scan
    setQrCode(`ACF-${productId}-${Date.now()}`);
  }, [productId]);

  const handleVerify = async () => {
    setLoading(true);
    
    // Simulate API call to verify product authenticity
    setTimeout(() => {
      const result: VerificationResult = {
        isValid: true,
        authenticity: "Verified Authentic",
        details: "This product has been verified as authentic by ACF anti-counterfeit system. Manufactured by authorized producer on 2024-01-15.",
        timestamp: new Date().toISOString()
      };
      setVerificationResult(result);
      setLoading(false);
    }, 1500);
  };

  const handleReport = () => {
    alert("Report counterfeit functionality would be implemented here");
  };

  return (
    <div className="product-verification">
      <h3>Verify Product Authenticity</h3>
      <div className="qr-section">
        <div className="qr-placeholder">
          <div className="qr-pattern">
            <div className="qr-dot"></div>
            <div className="qr-dot"></div>
            <div className="qr-dot"></div>
            <div className="qr-dot"></div>
            <div className="qr-dot"></div>
            <div className="qr-dot"></div>
            <div className="qr-dot"></div>
          </div>
        </div>
        <p>QR Code: {qrCode.substring(0, 15)}...</p>
      </div>
      
      <div className="verification-controls">
        <button 
          onClick={handleVerify} 
          disabled={loading}
          className="verify-btn"
        >
          {loading ? 'Verifying...' : 'Scan & Verify'}
        </button>
        <button 
          onClick={handleReport} 
          className="report-btn"
        >
          Report Counterfeit
        </button>
      </div>
      
      {verificationResult && (
        <div className={`result-box ${verificationResult.isValid ? 'valid' : 'invalid'}`}>
          <h4>Verification Result</h4>
          <p><strong>Status:</strong> {verificationResult.authenticity}</p>
          <p><strong>Details:</strong> {verificationResult.details}</p>
          <p><small>Verified at: {new Date(verificationResult.timestamp).toLocaleString()}</small></p>
        </div>
      )}
    </div>
  );
};

export default ProductVerification;