import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Tag, message, Tabs } from 'antd';
import { BellOutlined, CheckCircleOutlined, ClockCircleOutlined, UserOutlined } from '@ant-design/icons';
import { SellerApplication } from '../types/sellerTypes';
import { zaloNotificationService } from '../services/zaloNotificationService';
import { SellerApplicationService } from '../services/sellerApplicationService';

const { TabPane } = Tabs;

// Mock data for demonstration
const mockApplications: SellerApplication[] = [
  {
    id: '1',
    applicationId: 'TK-20260510-A1B2C3D4',
    fullName: 'Nguyễn Văn A',
    email: 'seller1@example.com',
    phone: '0912345678',
    address: '123 Đường ABC, Quận HCM1, TP.HCM',
    shopName: 'Cửa Hàng Chính Hãng',
    shopDescription: 'Chuyên cung cấp sản phẩm chính hãng',
    shopCategory: 'Điện tử & Điện lạnh',
    taxCode: '123456789',
    bankName: 'Ngân hàng TMCP Á Châu',
    bankAccount: '123456789',
    status: 'pending',
    submittedAt: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(), // 25 hours ago
    updatedAt: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
    googleEmail: 'seller1@example.com',
    applicationVersion: 1,
  },
  {
    id: '2',
    applicationId: 'TK-20260509-E5F6G7H8',
    fullName: 'Trần Thị B',
    email: 'seller2@example.com',
    phone: '0987654321',
    address: '456 Đường XYZ, Quận PN, TP.HCM',
    shopName: 'Thế Giới Sản Phẩm',
    shopDescription: 'Chuyên cung cấp hàng tiêu dùng chính hãng',
    shopCategory: 'Hàng tiêu dùng',
    taxCode: '987654321',
    bankName: 'Ngân hàng Vietcombank',
    bankAccount: '987654321',
    status: 'approved',
    submittedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // 48 hours ago
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    reviewedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    reviewedBy: 'Admin',
    googleEmail: 'seller2@example.com',
    applicationVersion: 1,
  },
  {
    id: '3',
    applicationId: 'TK-20260508-I9J0K1L2',
    fullName: 'Lê Văn C',
    email: 'seller3@example.com',
    phone: '0123456789',
    address: '789 Đường PQR, Quận BT, TP.HCM',
    shopName: 'Siêu Thị Nhỏ',
    shopDescription: 'Cửa hàng bán lẻ đa ngành',
    shopCategory: 'Thời trang',
    taxCode: '456789123',
    bankName: 'Ngân hàng Techcombank',
    bankAccount: '456789123',
    status: 'rejected',
    submittedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    reviewedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    reviewedBy: 'Admin',
    rejectionReason: 'Giấy tờ không hợp lệ',
    googleEmail: 'seller3@example.com',
    applicationVersion: 1,
  },
];

const SellerNotificationDashboard: React.FC = () => {
  const [applications, setApplications] = useState<SellerApplication[]>(mockApplications);
  const [loading, setLoading] = useState(false);

  // Columns for the table
  const columns = [
    {
      title: 'Mã Hồ Sơ',
      dataIndex: 'applicationId',
      key: 'applicationId',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Tên Shop',
      dataIndex: 'shopName',
      key: 'shopName',
    },
    {
      title: 'Loại',
      dataIndex: 'businessLicense',
      key: 'entityType',
      render: (license: string) => (
        <Tag color={license ? 'blue' : 'green'}>
          {license ? 'Tổ chức' : 'Cá nhân'}
        </Tag>
      ),
    },
    {
      title: 'Ngành',
      dataIndex: 'shopCategory',
      key: 'shopCategory',
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'default';
        let text = status;
        
        switch(status) {
          case 'pending':
            color = 'orange';
            text = 'Chờ duyệt';
            break;
          case 'approved':
            color = 'green';
            text = 'Đã duyệt';
            break;
          case 'rejected':
            color = 'red';
            text = 'Từ chối';
            break;
          case 'reviewing':
            color = 'blue';
            text = 'Đang xét duyệt';
            break;
          default:
            color = 'default';
        }
        
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Thời Gian Gửi',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      render: (date: string) => new Date(date).toLocaleString('vi-VN'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: SellerApplication) => (
        <Space size="middle">
          <Button 
            type="primary" 
            disabled={record.status !== 'pending'}
            onClick={() => handleApprove(record)}
          >
            Duyệt
          </Button>
          <Button 
            danger 
            disabled={record.status !== 'pending'}
            onClick={() => handleReject(record)}
          >
            Từ Chối
          </Button>
        </Space>
      ),
    },
  ];

  const handleApprove = async (application: SellerApplication) => {
    setLoading(true);
    try {
      // Update the application status to approved
      const updatedApplication = { ...application, status: 'approved' as const, reviewedAt: new Date().toISOString(), reviewedBy: 'Admin' };
      const updatedApplications = applications.map(app => 
        app.id === application.id ? updatedApplication : app
      );
      setApplications(updatedApplications);
      
      // Handle the approval in the service
      await SellerApplicationService.handleApplicationApproval(updatedApplication);
      
      message.success(`Hồ sơ ${application.applicationId} đã được duyệt`);
    } catch (error) {
      console.error('Error approving application:', error);
      message.error('Có lỗi xảy ra khi duyệt hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (application: SellerApplication) => {
    setLoading(true);
    try {
      // Update the application status to rejected
      const updatedApplication = { ...application, status: 'rejected' as const, reviewedAt: new Date().toISOString(), reviewedBy: 'Admin', rejectionReason: 'Không đạt tiêu chí' };
      const updatedApplications = applications.map(app => 
        app.id === application.id ? updatedApplication : app
      );
      setApplications(updatedApplications);
      
      // Handle the rejection in the service
      await SellerApplicationService.handleApplicationRejection(updatedApplication);
      
      message.success(`Hồ sơ ${application.applicationId} đã bị từ chối`);
    } catch (error) {
      console.error('Error rejecting application:', error);
      message.error('Có lỗi xảy ra khi từ chối hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckSLAViolations = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would call the actual SLA checking function
      // For demo purposes, we'll just simulate the check
      await SellerApplicationService.checkSLAViolations();
      message.success('Kiểm tra SLA hoàn tất');
    } catch (error) {
      console.error('Error checking SLA violations:', error);
      message.error('Có lỗi xảy ra khi kiểm tra SLA');
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = async () => {
    setLoading(true);
    try {
      // Create a sample application for testing
      const testApplication = mockApplications[0];
      
      // Send a test notification
      const result = await zaloNotificationService.notifyNewSellerApplication(testApplication);
      
      console.log('Test notification result:', result);
      message.success('Thông báo thử nghiệm đã được gửi');
    } catch (error) {
      console.error('Error sending test notification:', error);
      message.error('Có lỗi xảy ra khi gửi thông báo thử nghiệm');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="seller-notification-dashboard">
      <Card title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <BellOutlined style={{ marginRight: 8 }} />
          <span>Bảng Điều Khiển Thông Báo Zalo</span>
        </div>
      }>
        <Tabs defaultActiveKey="1">
          <TabPane tab="Danh Sách Hồ Sơ" key="1">
            <Table 
              dataSource={applications} 
              columns={columns} 
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 5 }}
            />
          </TabPane>
          
          <TabPane tab="Tính Năng Hệ Thống" key="2">
            <Card title="Quản Lý Thông Báo">
              <Space size="large" wrap>
                <Button 
                  type="primary" 
                  icon={<CheckCircleOutlined />}
                  onClick={handleTestNotification}
                  loading={loading}
                >
                  Gửi Thông Báo Thử Nghiệm
                </Button>
                
                <Button 
                  type="default" 
                  icon={<ClockCircleOutlined />}
                  onClick={handleCheckSLAViolations}
                  loading={loading}
                >
                  Kiểm Tra SLA Vi Phạm
                </Button>
                
                <Button 
                  type="dashed" 
                  icon={<UserOutlined />}
                  onClick={() => {
                    // Simulate adding a new application
                    const newApplication = {
                      ...mockApplications[0],
                      id: `${Date.now()}`,
                      applicationId: `TK-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
                      submittedAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                      status: 'pending' as const
                    };
                    
                    setApplications([newApplication, ...applications]);
                    message.success('Thêm hồ sơ mẫu thành công');
                  }}
                >
                  Thêm Hồ Sơ Mẫu
                </Button>
              </Space>
              
              <div style={{ marginTop: 24 }}>
                <h3>Hướng Dẫn Sử Dụng:</h3>
                <ul>
                  <li><strong>Gửi Thông Báo Thử Nghiệm</strong>: Gửi một thông báo mẫu đến các moderator qua Zalo</li>
                  <li><strong>Kiểm Tra SLA Vi Phạm</strong>: Kiểm tra các hồ sơ quá hạn xử lý (trên 24h chưa xử lý)</li>
                  <li><strong>Thêm Hồ Sơ Mẫu</strong>: Thêm một hồ sơ mẫu để kiểm tra quy trình</li>
                  <li><strong>Duyệt/Từ Chối</strong>: Thực hiện hành động với hồ sơ đang chờ xử lý</li>
                </ul>
              </div>
            </Card>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default SellerNotificationDashboard;