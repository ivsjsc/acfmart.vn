import React, { useState } from 'react';
import { Calendar, MapPin, Clock, FileText, Users, Shield, CreditCard, Truck, Smartphone } from 'lucide-react';

const DevelopmentPlan = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Timeline data for the development plan
  const timelineData = [
    {
      phase: "Giai đoạn 0: Pháp lý & Chuẩn bị",
      duration: "1-2 tháng",
      startDate: "Hiện tại",
      endDate: "2-3 tháng tới",
      color: "bg-blue-500",
      details: [
        "Đăng ký sàn TMĐT với Bộ Công Thương (3-4 tuần)",
        "Đánh giá tác động DLCN (NĐ 13/2023) (2-3 tuần)",
        "Soạn Quy chế hoạt động sàn (2 tuần)",
        "Soạn Điều khoản sử dụng + Chính sách bảo mật (1 tuần)",
        "Nộp hồ sơ VNeID → Trung tâm RAR (C06) (2-4 tuần)"
      ]
    },
    {
      phase: "Giai đoạn 1: MVP Production",
      duration: "2-3 tháng",
      startDate: "1-2 tháng tới",
      endDate: "4-5 tháng tới",
      color: "bg-green-500",
      details: [
        "Tách biệt Customer App / Seller Center / Admin Portal (3-4 tuần)",
        "Tích hợp VNPay sandbox (thanh toán + Escrow) (2-3 tuần)",
        "Tích hợp GHN API (vận chuyển) (1-2 tuần)",
        "Hoàn thiện core features (3-4 tuần)",
        "Deploy Cloud Functions (2 tuần)",
        "Security audit + Firestore rules (1 tuần)",
        "UAT với đối tác thanh toán + vận chuyển (2 tuần)"
      ]
    },
    {
      phase: "Giai đoạn 2: Nâng cao",
      duration: "2-3 tháng",
      startDate: "4-5 tháng tới",
      endDate: "7-8 tháng tới",
      color: "bg-purple-500",
      details: [
        "Tích hợp VNeID (sau khi được C06 phê duyệt) (4-8 tuần)",
        "Tích hợp thêm MoMo, ZaloPay (2-3 tuần)",
        "Tích hợp thêm Viettel Post, GHTK (1-2 tuần)",
        "Ký HĐ Escrow trực tiếp với ngân hàng (4-8 tuần)",
        "QR Code thực cho sản phẩm (2 tuần)",
        "AI phát hiện hàng giả (Gemini) (3-4 tuần)",
        "Mobile App (React Native) (6-8 tuần)"
      ]
    },
    {
      phase: "Giai đoạn 3: Mở rộng",
      duration: "3-6 tháng",
      startDate: "7-8 tháng tới",
      endDate: "12-14 tháng tới",
      color: "bg-yellow-500",
      details: [
        "Hợp tác SICPA (tem chống giả quốc tế)",
        "Kết nối API cơ quan nhà nước (Cục QLTT, Hải quan)",
        "Blockchain traceability",
        "Mở rộng khu vực (Đông Nam Á)",
        "Hệ thống hóa đơn điện tử"
      ]
    }
  ];

  // Key features data
  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Chống hàng giả",
      description: "Hệ thống xác thực sản phẩm bằng QR code và AI Gemini"
    },
    {
      icon: <CreditCard className="w-8 h-8" />,
      title: "Thanh toán Escrow",
      description: "Mô hình giữ tiền trung gian an toàn cho người mua và người bán"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Xác thực VNeID",
      description: "Tích hợp hệ thống định danh điện tử quốc gia"
    },
    {
      icon: <Truck className="w-8 h-8" />,
      title: "Vận chuyển",
      description: "Tích hợp API các đơn vị vận chuyển lớn"
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: "Di động",
      description: "Ứng dụng di động cho cả người mua và người bán"
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Pháp lý",
      description: "Tuân thủ đầy đủ quy định pháp luật Việt Nam"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Kế hoạch phát triển ACF E-commerce
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Chiến lược phát triển toàn diện cho nền tảng thương mại điện tử chống hàng giả, 
              tích hợp xác thực VNeID và mô hình thanh toán escrow an toàn
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center text-center transition-all duration-300 hover:shadow-lg"
              >
                <div className="bg-blue-100 p-3 rounded-full mb-4 text-blue-600">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Tabs Navigation */}
          <div className="flex border-b border-gray-200 mb-8">
            <button
              className={`py-3 px-6 font-medium text-sm rounded-t-lg ${
                activeTab === 'overview'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('overview')}
            >
              Tổng quan
            </button>
            <button
              className={`py-3 px-6 font-medium text-sm rounded-t-lg ${
                activeTab === 'timeline'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('timeline')}
            >
              Lịch trình
            </button>
            <button
              className={`py-3 px-6 font-medium text-sm rounded-t-lg ${
                activeTab === 'legal'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('legal')}
            >
              Yêu cầu pháp lý
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Tổng quan dự án</h2>
              <div className="prose max-w-none">
                <p className="mb-4">
                  Dự án ACF E-commerce là một nền tảng thương mại điện tử tập trung vào việc ngăn chặn 
                  hàng giả thông qua công nghệ xác thực tiên tiến và hệ thống quản lý minh bạch.
                </p>
                
                <h3 className="text-xl font-semibold mt-6 mb-3">Kiến trúc hệ sinh thái</h3>
                <p className="mb-4">
                  Hệ thống được thiết kế theo mô hình tách biệt các ứng dụng người dùng:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>Ứng dụng khách hàng (Web + Mobile)</li>
                  <li>Trung tâm người bán (Web)</li>
                  <li>Cổng quản trị nội bộ (Web)</li>
                  <li>Bảng điều khiển kiểm duyệt (Web)</li>
                  <li>Ứng dụng vận chuyển (Mobile)</li>
                </ul>
                
                <p className="mb-4">
                  Các dịch vụ chia sẻ bao gồm: Cơ sở dữ liệu Firestore, Dịch vụ Escrow, Xác thực VNeID, 
                  Dịch vụ chống hàng giả (QR/AI), Cổng thanh toán, Dịch vụ vận chuyển, và Hệ thống phân tích.
                </p>
                
                <div className="bg-blue-50 p-4 rounded-lg mt-6">
                  <h4 className="font-semibold text-blue-800 mb-2">Mục tiêu dài hạn</h4>
                  <p>
                    Phát triển thành hệ sinh thái thương mại điện tử đáng tin cậy nhất tại Việt Nam, 
                    nơi người tiêu dùng có thể mua sắm an tâm nhờ các công nghệ xác thực tiên tiến 
                    và hệ thống đảm bảo chất lượng sản phẩm minh bạch.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-8">
              {timelineData.map((item, index) => (
                <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className={`${item.color} text-white p-4`}>
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-bold">{item.phase}</h2>
                      <span className="bg-white bg-opacity-30 px-3 py-1 rounded-full text-sm">
                        {item.duration}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex flex-wrap gap-4 mb-4 text-sm">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                        <span>{item.startDate} → {item.endDate}</span>
                      </div>
                    </div>
                    
                    <h3 className="font-semibold text-gray-800 mb-3">Chi tiết công việc:</h3>
                    <ul className="space-y-2">
                      {item.details.map((detail, idx) => (
                        <li key={idx} className="flex items-start">
                          <div className="bg-gray-200 rounded-full p-1 mt-1 mr-3">
                            <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                          </div>
                          <span className="text-gray-700">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'legal' && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Yêu cầu pháp lý</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Đăng ký sàn thương mại điện tử</h3>
                  <p className="text-gray-600">
                    Cần đăng ký với Bộ Công Thương thông qua cổng dịch vụ công. Thời gian xử lý khoảng 12-15 ngày làm việc.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Tuân thủ bảo vệ dữ liệu cá nhân</h3>
                  <p className="text-gray-600">
                    Tuân thủ Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân, bao gồm đánh giá tác động, 
                    cơ chế đồng ý người dùng và lưu trữ dữ liệu tại Việt Nam.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Xác thực VNeID</h3>
                  <p className="text-gray-600">
                    Hợp tác với Trung tâm RAR (Cục C06) để tích hợp xác thực định danh điện tử quốc gia.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Mô hình thanh toán Escrow</h3>
                  <p className="text-gray-600">
                    Thiết lập tài khoản ký quỹ với ngân hàng đối tác để đảm bảo an toàn cho giao dịch.
                  </p>
                </div>
                
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                  <h4 className="font-semibold text-yellow-800 mb-1">Lưu ý quan trọng</h4>
                  <p className="text-yellow-700">
                    Việc tuân thủ đầy đủ các yêu cầu pháp lý là điều kiện tiên quyết để vận hành 
                    nền tảng thương mại điện tử tại Việt Nam. Cần phối hợp chặt chẽ với các chuyên 
                    gia pháp lý trong suốt quá trình triển khai.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg p-8 text-center text-white mt-12">
            <h2 className="text-2xl font-bold mb-4">Sẵn sàng để bắt đầu?</h2>
            <p className="mb-6 max-w-2xl mx-auto">
              Chúng tôi đang tích cực triển khai kế hoạch phát triển này để mang đến một nền tảng 
              thương mại điện tử an toàn và đáng tin cậy cho người tiêu dùng Việt Nam.
            </p>
            <button className="bg-white text-blue-600 font-semibold py-3 px-6 rounded-lg hover:bg-blue-50 transition-colors">
              Liên hệ để biết thêm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevelopmentPlan;