import React, { useState, useEffect } from 'react';
import './App.css';

// Import shared components from the storefront
const ProductVerification = React.lazy(() => import('../../../storefront/src/components/ProductVerification'));
const EscrowPayment = React.lazy(() => import('../../../storefront/src/components/EscrowPayment'));

const SellerCenter: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [shopInfo, setShopInfo] = useState<any>(null);

  useEffect(() => {
    // Check if user is logged in (from localStorage or session)
    const loggedIn = localStorage.getItem('seller_logged_in');
    if (loggedIn === 'true') {
      setIsLoggedIn(true);
      // Load shop info
      setShopInfo({
        name: 'Sample Shop',
        id: 'SHOP-001',
        status: 'verified',
        rating: 4.8,
        salesCount: 1250,
      });
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would connect to authentication service
    localStorage.setItem('seller_logged_in', 'true');
    setIsLoggedIn(true);
    
    // Set shop info
    setShopInfo({
      name: 'Sample Shop',
      id: 'SHOP-001',
      status: 'verified',
      rating: 4.8,
      salesCount: 1250,
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('seller_logged_in');
    setIsLoggedIn(false);
    setShopInfo(null);
  };

  // Render different views based on login status
  const renderView = () => {
    if (!isLoggedIn) {
      return (
        <div className="login-container">
          <h2>Seller Center - ACF Platform</h2>
          <form onSubmit={handleLogin} className="login-form">
            <div className="input-group">
              <label htmlFor="email">Business Email</label>
              <input 
                type="email" 
                id="email" 
                placeholder="Enter your business email" 
                required 
              />
            </div>
            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input 
                type="password" 
                id="password" 
                placeholder="Enter your password" 
                required 
              />
            </div>
            <div className="input-group">
              <label htmlFor="vneid">VNeID Verification</label>
              <button type="button" className="vneid-btn">
                Verify with VNeID
              </button>
            </div>
            <button type="submit" className="login-btn">
              Login to Seller Center
            </button>
          </form>
          
          <div className="registration-link">
            <p>Don't have an account? <a href="#">Register your business</a></p>
          </div>
          
          <div className="requirements-note">
            <h3>Requirements to Sell on ACF Platform:</h3>
            <ul>
              <li>Valid business registration</li>
              <li>VNeID authentication</li>
              <li>Product certification</li>
              <li>Compliance with Vietnamese e-commerce laws</li>
            </ul>
          </div>
        </div>
      );
    }

    return (
      <div className="main-view">
        <header className="app-header">
          <div className="header-left">
            <h1>Seller Center - {shopInfo?.name}</h1>
            <div className="shop-status">
              <span className={`status ${shopInfo?.status}`}>
                {shopInfo?.status === 'verified' ? '✅ Verified Seller' : '⏳ Pending Verification'}
              </span>
            </div>
          </div>
          <div className="header-right">
            <div className="shop-stats">
              <div className="stat">
                <span className="value">{shopInfo?.rating}</span>
                <span className="label">Rating</span>
              </div>
              <div className="stat">
                <span className="value">{shopInfo?.salesCount}</span>
                <span className="label">Sales</span>
              </div>
            </div>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </header>
        
        <main className="app-main">
          <div className="dashboard-grid">
            {/* Product Management */}
            <div className="dashboard-card">
              <h3>📦 Product Management</h3>
              <div className="card-actions">
                <button className="action-btn primary">Add New Product</button>
                <button className="action-btn secondary">Manage Products</button>
                <button className="action-btn secondary">Bulk Upload</button>
              </div>
            </div>
            
            {/* Order Management */}
            <div className="dashboard-card">
              <h3>🛒 Order Management</h3>
              <div className="card-actions">
                <button className="action-btn primary">View Orders</button>
                <button className="action-btn secondary">Process Shipments</button>
                <button className="action-btn secondary">Returns & Refunds</button>
              </div>
              <EscrowPayment 
                orderId="ORD-001" 
                amount={1500000} 
                currency="VND" 
                buyerId="BUY-001" 
                sellerId={shopInfo?.id} 
              />
            </div>
            
            {/* Financial Overview */}
            <div className="dashboard-card">
              <h3>💰 Financial Overview</h3>
              <div className="financial-data">
                <div className="finance-item">
                  <span className="label">Total Sales (30 days)</span>
                  <span className="value">45,200,000 ₫</span>
                </div>
                <div className="finance-item">
                  <span className="label">Pending Settlement</span>
                  <span className="value">12,500,000 ₫</span>
                </div>
                <div className="finance-item">
                  <span className="label">Platform Fees</span>
                  <span className="value">2,260,000 ₫</span>
                </div>
                <div className="finance-item">
                  <span className="label">Available Balance</span>
                  <span className="value">32,700,000 ₫</span>
                </div>
              </div>
            </div>
            
            {/* Anti-Counterfeit Tools */}
            <div className="dashboard-card">
              <h3>🔒 Anti-Counterfeit Tools</h3>
              <div className="card-actions">
                <button className="action-btn primary">Generate QR Codes</button>
                <button className="action-btn secondary">Verify Products</button>
                <button className="action-btn secondary">View Certificates</button>
              </div>
              <ProductVerification productId="prod-123" />
            </div>
            
            {/* Shop Settings */}
            <div className="dashboard-card">
              <h3>⚙️ Shop Settings</h3>
              <div className="card-actions">
                <button className="action-btn secondary">Profile & Policies</button>
                <button className="action-btn secondary">Shipping Options</button>
                <button className="action-btn secondary">Payment Methods</button>
              </div>
            </div>
            
            {/* Analytics */}
            <div className="dashboard-card">
              <h3>📊 Analytics & Reports</h3>
              <div className="card-actions">
                <button className="action-btn secondary">Sales Reports</button>
                <button className="action-btn secondary">Traffic Analysis</button>
                <button className="action-btn secondary">Customer Insights</button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  };

  return (
    <div className="seller-center-app">
      {renderView()}
    </div>
  );
};

export default SellerCenter;