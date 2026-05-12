import React from 'react';
import { Layout, Menu, Dropdown, Avatar, Button, Badge } from 'antd';
import { UserOutlined, ShoppingOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const BasicLayout: React.FC = () => {
  const { getCartCount } = useCart();
  const cartCount = getCartCount();
  
  const menu = (
    <Menu>
      <Menu.Item key="1">
        <Link to="/profile">Thông tin tài khoản</Link>
      </Menu.Item>
      <Menu.Item key="2">
        <Link to="/logout">Đăng xuất</Link>
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout>
      <Layout.Header style={{ background: '#fff', padding: '0 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', height: '64px', gap: '16px' }}>
          <Link to="/cart">
            <Badge count={cartCount} showZero={false}>
              <Button type="link" icon={<ShoppingOutlined />} style={{ display: 'flex', alignItems: 'center' }} />
            </Badge>
          </Link>
          <Dropdown menu={{ items: [
            {
              key: '1',
              label: <Link to="/profile">Thông tin tài khoản</Link>
            },
            {
              key: '2',
              label: <Link to="/logout">Đăng xuất</Link>
            }
          ]}}>
            <Avatar style={{ cursor: 'pointer' }} icon={<UserOutlined />} />
          </Dropdown>
        </div>
      </Layout.Header>

      <Layout.Content>
        {/* 页面内容 */}
      </Layout.Content>
    </Layout>
  );
};

export default BasicLayout;