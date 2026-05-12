import React from 'react';
import { Button } from '@/components/Button';
import { Logo } from '@/components/Logo';
import './HomeScreen.css';

const HomeScreen = () => {
  return (
    <div className="home-screen">
      <div className="header">
        <Logo />
        <div className="tagline">Vận hành bởi Quỹ Chống Hàng Giả Việt Nam</div>
      </div>
      
      <div className="main-content">
        <h1 className="title">
          <span className="primary">Mua sắm</span>
          <br />
          <span className="secondary">chính hãng</span>
          <br />
          <span className="highlight">an tâm 100%</span>
        </h1>
        
        <p className="description">
          Mọi sản phẩm trên ACFMart đều được xác thực qua mã QR và chứng nhận bởi Quỹ Chống Hàng Giả Việt Nam. Mua hàng – kiểm hàng – an tâm.
        </p>
        
        <div className="cta-buttons">
          <Button variant="primary" size="large">
            Bắt đầu mua sắm →
          </Button>
          <Button variant="secondary" size="large">
            <span className="icon">QR</span> Quét mã QR xác thực
          </Button>
        </div>
        
        <div className="features">
          <div className="feature-item">
            <span className="icon">🛡️</span>
            <span>Chống hàng giả</span>
          </div>
          <div className="feature-item">
            <span className="icon">🚚</span>
            <span>Giao 2-4 ngày</span>
          </div>
          <div className="feature-item">
            <span className="icon">🔄</span>
            <span>Đổi trả 7 ngày</span>
          </div>
        </div>
      </div>
      
      <div className="stats">
        <div className="stat-item">
          <div className="value">150,000+</div>
          <div className="label">Sản phẩm xác thực</div>
        </div>
        <div className="stat-item">
          <div className="value">2.5M+</div>
          <div className="label">Khách hàng tin dùng</div>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;