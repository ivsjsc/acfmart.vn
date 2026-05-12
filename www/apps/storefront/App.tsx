import React, { useState } from 'react';
import ProductVerification from './src/components/ProductVerification';
import EscrowPayment from './src/components/EscrowPayment';
import './App.css';

// Define role types
type UserRole = 'customer' | 'shop' | 'moderator' | 'carrier' | 'admin';

const App: React.FC = () => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    // In a real app, this would connect to authentication service
    setIsLoggedIn(true);
  };

  const handleRoleSelect = (role: UserRole) => {
    setUserRole(role);
  };

  const handleLogout = () => {
    setUserRole(null);
    setIsLoggedIn(false);
  };

  // Render different views based on role
  const renderView = () => {
    if (!isLoggedIn) {
      return (
        <div className="login-container">
          <h2>ACF Anti-Counterfeit E-commerce Platform</h2>
          <button onClick={handleLogin} className="login-btn">
            Login with VNeID
          </button>
          <div className="demo-note">
            <p><strong>Note:</strong> This is currently a demo application. In production, users will register with verified business information.</p>
          </div>
        </div>
      );
    }

    if (!userRole) {
      return (
        <div className="role-selection">
          <h2>Select Your Role</h2>
          <div className="role-buttons">
            <button onClick={() => handleRoleSelect('customer')} className="role-btn customer">
              🛒 Customer
            </button>
            <button onClick={() => handleRoleSelect('shop')} className="role-btn shop">
              🏪 Shop Owner
            </button>
            <button onClick={() => handleRoleSelect('moderator')} className="role-btn moderator">
              👮 Moderator
            </button>
            <button onClick={() => handleRoleSelect('carrier')} className="role-btn carrier">
              🚚 Carrier
            </button>
            <button onClick={() => handleRoleSelect('admin')} className="role-btn admin">
              ⚙️ Admin
            </button>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      );
    }

    return (
      <div className="main-view">
        <header className="app-header">
          <h1>ACF E-commerce Platform - {getRoleName(userRole)}</h1>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </header>
        
        <main className="app-main">
          {renderRoleSpecificContent()}
        </main>
      </div>
    );
  };

  const getRoleName = (role: UserRole) => {
    switch (role) {
      case 'customer': return 'Customer View';
      case 'shop': return 'Shop Owner View';
      case 'moderator': return 'Moderator View';
      case 'carrier': return 'Carrier View';
      case 'admin': return 'Admin View';
      default: return 'Dashboard';
    }
  };

  const renderRoleSpecificContent = () => {
    switch (userRole) {
      case 'customer':
        return (
          <div className="customer-content">
            <h2>Welcome, Customer!</h2>
            <div className="customer-actions">
              <div className="action-card">
                <h3>🛒 Browse Products</h3>
                <p>Discover authentic products with anti-counterfeit verification</p>
              </div>
              <div className="action-card">
                <h3>💳 My Orders</h3>
                <p>Track your purchases and delivery status</p>
                <EscrowPayment 
                  orderId="ORD-001" 
                  amount={1500000} 
                  currency="VND" 
                  buyerId="BUY-001" 
                  sellerId="SELL-001" 
                />
              </div>
              <div className="action-card">
                <h3>🔍 Verify Product</h3>
                <p>Scan QR codes to authenticate products</p>
                <ProductVerification productId="prod-123" />
              </div>
              <div className="action-card">
                <h3>⚠️ Report Counterfeit</h3>
                <p>Report suspicious products to moderators</p>
              </div>
            </div>
          </div>
        );
      
      case 'shop':
        return (
          <div className="shop-content">
            <h2>Shop Owner Dashboard</h2>
            <div className="shop-actions">
              <div className="action-card">
                <h3>📝 Manage Products</h3>
                <p>Add, update, or remove products from your store</p>
              </div>
              <div className="action-card">
                <h3>📦 Order Management</h3>
                <p>Process and track orders from customers</p>
                <EscrowPayment 
                  orderId="ORD-001" 
                  amount={1500000} 
                  currency="VND" 
                  buyerId="BUY-001" 
                  sellerId="SELL-001" 
                />
              </div>
              <div className="action-card">
                <h3>💰 Financial Overview</h3>
                <p>View sales reports and commission details</p>
              </div>
              <div className="action-card">
                <h3>⚙️ Store Settings</h3>
                <p>Configure your shop profile and policies</p>
              </div>
            </div>
          </div>
        );
      
      case 'moderator':
        return (
          <div className="moderator-content">
            <h2>Moderator Dashboard</h2>
            <div className="moderator-actions">
              <div className="action-card">
                <h3>📋 Product Approval</h3>
                <p>Review and approve new product listings</p>
              </div>
              <div className="action-card">
                <h3>⚠️ Violation Reports</h3>
                <p>Investigate counterfeit reports</p>
              </div>
              <div className="action-card">
                <h3>🏢 Merchant Verification</h3>
                <p>Verify seller credentials and documents</p>
              </div>
              <div className="action-card">
                <h3>📊 Analytics</h3>
                <p>Monitor platform health and compliance</p>
              </div>
            </div>
          </div>
        );
      
      case 'carrier':
        return (
          <div className="carrier-content">
            <h2>Carrier Dashboard</h2>
            <div className="carrier-actions">
              <div className="action-card">
                <h3>📦 Delivery Assignments</h3>
                <p>View and manage assigned deliveries</p>
              </div>
              <div className="action-card">
                <h3>📍 Track Shipments</h3>
                <p>Update delivery statuses in real-time</p>
              </div>
              <div className="action-card">
                <h3>✅ QR Verification</h3>
                <p>Verify products during delivery process</p>
              </div>
              <div className="action-card">
                <h3>📈 Performance Metrics</h3>
                <p>Review delivery statistics and ratings</p>
              </div>
            </div>
          </div>
        );
      
      case 'admin':
        return (
          <div className="admin-content">
            <h2>Admin Dashboard</h2>
            <div className="admin-actions">
              <div className="action-card">
                <h3>📊 Platform Analytics</h3>
                <p>View overall platform metrics and trends</p>
              </div>
              <div className="action-card">
                <h3>👥 User Management</h3>
                <p>Moderate users and accounts</p>
              </div>
              <div className="action-card">
                <h3>💳 Payment Processing</h3>
                <p>Monitor escrow and payment flows</p>
                <EscrowPayment 
                  orderId="ORD-001" 
                  amount={1500000} 
                  currency="VND" 
                  buyerId="BUY-001" 
                  sellerId="SELL-001" 
                />
              </div>
              <div className="action-card">
                <h3>🛡️ Compliance</h3>
                <p>Ensure regulatory compliance and reporting</p>
              </div>
            </div>
          </div>
        );
      
      default:
        return <div>Select a role to continue</div>;
    }
  };

  return (
    <div className="app">
      {renderView()}
    </div>
  );
};

export default App;