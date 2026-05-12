import React, { useState } from 'react';
import { Card, Col, Row, Statistic, Button, Table, Tag, Modal, Form, Input, Select } from 'antd';
import { User, ShoppingBag, ShoppingCart, DollarSign, FileText, Trophy, Calendar, Filter, Search } from 'lucide-react';
import { Column } from '@ant-design/plots';
import { useStore } from '../store';

const Dashboard: React.FC = () => {
  const { user, role } = useStore();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for recent orders
  const recentOrdersData = [
    { id: 'ORD-2026-001', customer: 'Nguyễn Văn A', product: 'iPhone 13 Pro', amount: 25000000, status: 'completed', date: '2026-05-01' },
    { id: 'ORD-2026-002', customer: 'Trần Thị B', product: 'MacBook Air M2', amount: 32000000, status: 'shipped', date: '2026-05-02' },
    { id: 'ORD-2026-003', customer: 'Lê Văn C', product: 'AirPods Pro', amount: 5500000, status: 'processing', date: '2026-05-03' },
    { id: 'ORD-2026-004', customer: 'Phạm Thị D', product: 'iPad Pro 12.9"', amount: 18500000, status: 'delivered', date: '2026-05-04' },
    { id: 'ORD-2026-005', customer: 'Hoàng Văn E', product: 'Apple Watch Series 7', amount: 12000000, status: 'pending', date: '2026-05-05' },
  ];

  // Mock data for sales chart
  const salesData = [
    { month: 'Tháng 1', revenue: 120000000, orders: 42 },
    { month: 'Tháng 2', revenue: 180000000, orders: 58 },
    { month: 'Tháng 3', revenue: 150000000, orders: 50 },
    { month: 'Tháng 4', revenue: 210000000, orders: 72 },
    { month: 'Tháng 5', revenue: 270000000, orders: 89 },
  ];

  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customer',
      key: 'customer',
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'product',
      key: 'product',
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (text: number) => (
        <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(text)}</span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'default';
        if (status === 'completed') color = 'green';
        if (status === 'shipped') color = 'blue';
        if (status === 'processing') color = 'orange';
        if (status === 'pending') color = 'gray';
        if (status === 'delivered') color = 'cyan';

        return <Tag color={color}>{status === 'completed' ? 'Hoàn thành' : status === 'shipped' ? 'Đã giao' : status === 'processing' ? 'Đang xử lý' : status === 'pending' ? 'Chờ xử lý' : 'Đã giao'}</Tag>;
      },
    },
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
    },
  ];

  const config = {
    data: salesData,
    xField: 'month',
    yField: 'revenue',
    label: {
      position: 'top',
      style: {
        fill: '#FFFFFF',
        fontSize: 14,
      },
    },
    xAxis: {
      label: {
        autoRotate: false,
      },
    },
    smooth: true,
    height: 400,
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Bảng điều khiển</h1>
        <p className="text-gray-600">Chào mừng bạn quay trở lại, {user?.displayName || user?.email || 'Người dùng'}!</p>
      </div>

      {/* Stats Cards */}
      <Row gutter={[24, 24]} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title={
                <div className="flex items-center">
                  <User className="text-blue-500 mr-2" />
                  <span>Khách hàng</span>
                </div>
              }
              value={1289}
              prefix={<User />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title={
                <div className="flex items-center">
                  <ShoppingBag className="text-purple-500 mr-2" />
                  <span>Sản phẩm</span>
                </div>
              }
              value={568}
              prefix={<ShoppingBag />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title={
                <div className="flex items-center">
                  <ShoppingCart className="text-green-500 mr-2" />
                  <span>Đơn hàng</span>
                </div>
              }
              value={123}
              prefix={<ShoppingCart />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title={
                <div className="flex items-center">
                  <DollarSign className="text-red-500 mr-2" />
                  <span>Doanh thu</span>
                </div>
              }
              value={270000000}
              precision={0}
              prefix={<DollarSign />}
              valueStyle={{ color: '#3f8600' }}
              formatter={(value: number) => (
                <span>
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)}
                </span>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts and Recent Orders */}
      <Row gutter={[24, 24]}>
        <Col span={16}>
          <Card 
            title={
              <div className="flex items-center">
                <FileText className="text-indigo-500 mr-2" />
                <span>Biểu đồ doanh thu</span>
              </div>
            }
            extra={
              <Button icon={<Filter />} className="flex items-center">
                Lọc
              </Button>
            }
          >
            <Column {...config} />
          </Card>
        </Col>
        <Col span={8}>
          <Card 
            title={
              <div className="flex items-center">
                <Trophy className="text-yellow-500 mr-2" />
                <span>Đơn hàng gần đây</span>
              </div>
            }
            extra={
              <Button icon={<Search />} className="flex items-center">
                Tìm kiếm
              </Button>
            }
          >
            <Table 
              dataSource={recentOrdersData} 
              columns={columns} 
              rowKey="id" 
              pagination={{ pageSize: 5 }} 
              scroll={{ y: 400 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;