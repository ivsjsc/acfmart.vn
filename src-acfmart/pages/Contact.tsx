import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, MessageCircle, Send, Facebook, Twitter, Youtube, Linkedin } from 'lucide-react';

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Handle form submission here
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Liên hệ</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy liên hệ với Trung tâm ACF theo thông tin dưới đây.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Thông tin liên hệ</h2>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <Phone className="w-5 h-5 text-red-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Điện thoại</h3>
                    <p className="text-gray-600">Tổng đài Chống hàng giả: <span className="text-red-600 font-bold">1900.066.689</span></p>
                    <p className="text-gray-600">Hotline: <span className="text-yellow-600 font-bold">097.173.6789</span></p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Email</h3>
                    <p className="text-gray-600">trungtamacf@gmail.com</p>
                    <p className="text-gray-600">info@acf.org.vn</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Địa chỉ</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="font-semibold text-gray-700">Trụ sở chính (Miền Bắc)</p>
                        <p className="text-gray-600 text-sm">
                          59A Phố Quan Hoa, Phường Quan Hoa<br />
                          Quận Cầu Giấy, Hà Nội
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-700">Văn phòng Miền Nam</p>
                        <p className="text-gray-600 text-sm">
                          Số 360 Lạc Long Quân, Phường 5<br />
                          Quận 11, TP Hồ Chí Minh
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-700">Văn phòng Miền Tây</p>
                        <p className="text-gray-600 text-sm">
                          Số 75 Huỳnh Cương, Phường Ninh Kiều<br />
                          TP Cần Thơ
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-700">Văn phòng Đồng Nai</p>
                        <p className="text-gray-600 text-sm">
                          QL51B, Xã Long Thành<br />
                          Tỉnh Đồng Nai<br />
                          ĐT: 0901.422.227
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Clock className="w-5 h-5 text-purple-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Giờ làm việc</h3>
                    <p className="text-gray-600">Thứ 2 - Thứ 6: 8:00 - 17:30</p>
                    <p className="text-gray-600">Thứ 7: 8:00 - 12:00</p>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-medium text-gray-900 mb-4">Mạng xã hội</h3>
                <div className="flex space-x-3">
                  <a href="#" className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors">
                    <Facebook className="w-5 h-5" />
                  </a>
                  <a href="#" className="w-10 h-10 bg-sky-500 rounded-full flex items-center justify-center text-white hover:bg-sky-600 transition-colors">
                    <Twitter className="w-5 h-5" />
                  </a>
                  <a href="#" className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white hover:bg-red-700 transition-colors">
                    <Youtube className="w-5 h-5" />
                  </a>
                  <a href="#" className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center text-white hover:bg-blue-800 transition-colors">
                    <Linkedin className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Gửi tin nhắn cho chúng tôi</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Họ và tên *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Nhập họ và tên của bạn"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="09xxxxxxxx"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Chủ đề *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="">Chọn chủ đề</option>
                      <option value="complaint">Khiếu nại hàng giả</option>
                      <option value="consultation">Tư vấn chứng nhận</option>
                      <option value="cooperation">Hợp tác</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Nội dung tin nhắn *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Nhập nội dung tin nhắn của bạn..."
                  />
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Các trường có dấu * là bắt buộc
                  </p>
                  <button
                    type="submit"
                    className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Gửi tin nhắn
                  </button>
                </div>
              </form>
            </div>

            {/* FAQ Section */}
            <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Câu hỏi thường gặp</h2>
              
              <div className="space-y-4">
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="font-medium text-gray-900 mb-2">Làm thế nào để báo cáo hàng giả?</h3>
                  <p className="text-gray-600 text-sm">
                    Bạn có thể gọi Tổng đài Chống hàng giả <span className="text-red-600 font-bold">1900.066.689</span> hoặc gửi email đến trungtamacf@gmail.com để báo cáo các sản phẩm nghi ngờ là hàng giả.
                  </p>
                </div>

                <div className="border-b border-gray-200 pb-4">
                  <h3 className="font-medium text-gray-900 mb-2">Thời gian xử lý khiếu nại là bao lâu?</h3>
                  <p className="text-gray-600 text-sm">
                    Chúng tôi cam kết xử lý các khiếu nại trong vòng 5-7 ngày làm việc kể từ khi nhận được thông tin.
                  </p>
                </div>

                <div className="pb-4">
                  <h3 className="font-medium text-gray-900 mb-2">Làm thế nào để được chứng nhận ACF?</h3>
                  <p className="text-gray-600 text-sm">
                    Doanh nghiệp cần đăng ký và trải qua quá trình đánh giá chất lượng theo tiêu chuẩn của ACF. Vui lòng liên hệ phòng kinh doanh để được tư vấn chi tiết.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
