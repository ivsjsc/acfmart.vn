import React, { useState, useEffect } from 'react';
import './App.css';

// Import shared components from the storefront
const EscrowPayment = React.lazy(() => import('../../../storefront/src/components/EscrowPayment'));

const AdminPortal: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminInfo, setAdminInfo] = useState<any>(null);

  useEffect(() => {
    // Check if user is logged in (from localStorage or session)
    const loggedIn = localStorage.getItem('admin_logged_in');
    if (loggedIn === 'true') {
      setIsLoggedIn(true);
      // Load admin info
      setAdminInfo({
        name: 'Admin User',
        role: 'Super Admin',
        lastLogin: new Date().toISOString(),
      });
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would connect to authentication service
    // Check if credentials are valid (for demo purposes, accept any non-empty values)
    const username = (e.target as any).username.value;
    const password = (e.target as any).password.value;
    
    if (username && password) {
      localStorage.setItem('admin_logged_in', 'true');
      setIsLoggedIn(true);
      
      // Set admin info
      setAdminInfo({
        name: username,
        role: 'Super Admin',
        lastLogin: new Date().toISOString(),
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_logged_in');
    setIsLoggedIn(false);
    setAdminInfo(null);
  };

  // Render different views based on login status
  const renderView = () => {
    if (!isLoggedIn) {
      return (
        <div className="login-container">
          <h2>Admin Portal - ACF Platform</h2>
          <form onSubmit={handleLogin} className="login-form">
            <div className="input-group">
              <label htmlFor="username">Username</label>
              <input 
                type="text" 
                id="username" 
                name="username"
                placeholder="Enter your admin username" 
                required 
              />
            </div>
            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input 
                type="password" 
                id="password" 
                name="password"
                placeholder="Enter your password" 
                required 
              />
            </div>
            <div className="input-group">
              <label htmlFor="two-factor">Two-Factor Authentication</label>
              <input 
                type="text" 
                id="two-factor" 
                name="twoFactor"
                placeholder="Enter 2FA code" 
                required 
              />
            </div>
            <button type="submit" className="login-btn">
              Login to Admin Portal
            </button>
          </form>
          
          <div className="security-note">
            <p><strong>Security Notice:</strong> This portal is restricted to authorized personnel only. All activities are logged and monitored.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="main-view">
        <header className="app-header">
          <div className="header-left">
            <h1>Admin Portal - ACF Platform</h1>
            <div className="admin-info">
              <span>Welcome, {adminInfo?.name} ({adminInfo?.role})</span>
            </div>
          </div>
          <div className="header-right">
            <div className="last-login">
              <span>Last login: {new Date(adminInfo?.lastLogin).toLocaleString()}</span>
            </div>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </header>
        
        <main className="app-main">
          <div className="dashboard-grid">
            {/* Platform Analytics */}
            <div className="dashboard-card">
              <h3>📊 Platform Analytics</h3>
              <div className="analytics-grid">
                <div className="metric-card">
                  <h4>Total Users</h4>
                  <p className="metric-value">12,458</p>
                </div>
                <div className="metric-card">
                  <h4>Total Sellers</h4>
                  <p className="metric-value">1,245</p>
                </div>
                <div className="metric-card">
                  <h4>Monthly Revenue</h4>
                  <p className="metric-value">2.4B ₫</p>
                </div>
                <div className="metric-card">
                  <h4>Active Orders</h4>
                  <p className="metric-value">3,876</p>
                </div>
              </div>
            </div>
            
            {/* User Management */}
            <div className="dashboard-card">
              <h3>👥 User Management</h3>
              <div className="card-actions">
                <button className="action-btn primary">View All Users</button>
                <button className="action-btn secondary">Manage Sellers</button>
                <button className="action-btn secondary">Moderators</button>
                <button className="action-btn secondary">Ban/Unban Users</button>
              </div>
            </div>
            
            {/* Payment Processing */}
            <div className="dashboard-card">
              <h3>💳 Payment Processing</h3>
              <div className="card-actions">
                <button className="action-btn primary">Escrow Management</button>
                <button className="action-btn secondary">Payment Gateways</button>
                <button className="action-btn secondary">Transaction History</button>
                <button className="action-btn secondary">Disputes</button>
              </div>
              <EscrowPayment 
                orderId="ORD-001" 
                amount={1500000} 
                currency="VND" 
                buyerId="BUY-001" 
                sellerId="SELL-001" 
              />
            </div>
            
            {/* Compliance */}
            <div className="dashboard-card">
              <h3>🛡️ Compliance</h3>
              <div className="card-actions">
                <button className="action-btn primary">Regulatory Reports</button>
                <button className="action-btn secondary">Legal Documents</button>
                <button className="action-btn secondary">Policy Management</button>
                <button className="action-btn secondary">Audit Logs</button>
              </div>
            </div>
            
            {/* Product Management */}
            <div className="dashboard-card">
              <h3>📦 Product Management</h3>
              <div className="card-actions">
                <button className="action-btn primary">Approve Products</button>
                <button className="action-btn secondary">Counterfeit Reports</button>
                <button className="action-btn secondary">Category Management</button>
                <button className="action-btn secondary">Certificates</button>
              </div>
            </div>
            
            {/* System Configuration */}
            <div className="dashboard-card">
              <h3>⚙️ System Configuration</h3>
              <div className="card-actions">
                <button className="action-btn primary">Feature Flags</button>
                <button className="action-btn secondary">Settings</button>
                <button className="action-btn secondary">Integrations</button>
                <button className="action-btn secondary">Maintenance</button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  };

  return (
    <div className="admin-portal-app">
      {renderView()}
    </div>
  );
};

export default AdminPortal;