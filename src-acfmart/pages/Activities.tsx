import React from 'react';
import { Calendar, Users, Award, ShieldCheck, Target, TrendingUp } from 'lucide-react';

export function Activities() {
  const activities = [
    {
      icon: Calendar,
      title: "Sự kiện kiểm tra chất lượng",
      date: "15/12/2024",
      description: "Chương trình kiểm tra chất lượng sản phẩm điện tử cuối năm",
      participants: "500+ doanh nghiệp"
    },
    {
      icon: ShieldCheck,
      title: "Đào tạo chống hàng giả",
      date: "08/12/2024",
      description: "Khóa đào tạo nhận biết hàng giả cho người tiêu dùng",
      participants: "1.000+ người tham gia"
    },
    {
      icon: Award,
      title: "Vinh danh doanh nghiệp chính hãng",
      date: "01/12/2024",
      description: "Lễ vinh danh các doanh nghiệp đạt chứng nhận ACF",
      participants: "200 doanh nghiệp"
    },
    {
      icon: Target,
      title: "Chiến dịch truy quét hàng giả",
      date: "20/11/2024",
      description: "Chiến dịch phối hợp với cơ quan chức năng truy quét hàng giả",
      participants: "50+ vụ việc xử lý"
    },
    {
      icon: TrendingUp,
      title: "Hội thảo phát triển bền vững",
      date: "10/11/2024",
      description: "Hội thảo về phát triển thị trường chính hãng bền vững",
      participants: "300+ chuyên gia"
    },
    {
      icon: Users,
      title: "Ngày hội người tiêu dùng thông thái",
      date: "25/10/2024",
      description: "Sự kiện giáo dục người tiêu dùng về sản phẩm chính hãng",
      participants: "2.000+ người tham gia"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Hoạt động Trung tâm</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Cập nhật các hoạt động, sự kiện và chương trình mà Trung tâm Kỹ thuật Chống hàng giả ACF đã và đang triển khai
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity, index) => {
            const Icon = activity.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <Icon className="w-6 h-6 text-red-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{activity.title}</h3>
                    <p className="text-sm text-red-600 font-medium mb-2">{activity.date}</p>
                    <p className="text-gray-600 mb-3">{activity.description}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="w-4 h-4 mr-1" />
                      {activity.participants}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 bg-red-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Tham gia hoạt động cùng chúng tôi</h2>
          <p className="text-gray-600 mb-6">
            Hãy theo dõi và tham gia các hoạt động của Trung tâm ACF để cùng xây dựng thị trường chính hãng minh bạch và bền vững.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-3 rounded-lg transition-colors">
              Đăng ký tham gia
            </button>
            <button className="bg-white hover:bg-gray-50 text-red-600 border border-red-600 font-medium px-6 py-3 rounded-lg transition-colors">
              Xem lịch sự kiện
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
