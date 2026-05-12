import React, { useState } from 'react';
import { FileText, Download, Search, Filter, Calendar, Shield, Scale, BookOpen } from 'lucide-react';

export function Legal() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const legalDocuments = [
    {
      id: 1,
      title: "Nghị định 98/2020/NĐ-CP về bảo vệ quyền lợi người tiêu dùng",
      category: "Nghị định",
      date: "15/10/2020",
      effectiveDate: "01/01/2021",
      description: "Quy định về bảo vệ quyền lợi người tiêu dùng trong hoạt động thương mại",
      file: "ND98-2020.pdf"
    },
    {
      id: 2,
      title: "Luật Sở hữu trí tuệ 2005 (sửa đổi, bổ sung 2019)",
      category: "Luật",
      date: "29/11/2005",
      effectiveDate: "01/07/2006",
      description: "Quy định về quyền sở hữu trí tuệ, bảo vệ nhãn hiệu, chỉ dẫn địa lý",
      file: "LuongSHTT.pdf"
    },
    {
      id: 3,
      title: "Thông tư 23/2020/TT-BCT về quản lý hoạt động thương mại điện tử",
      category: "Thông tư",
      date: "05/10/2020",
      effectiveDate: "01/12/2020",
      description: "Quy định về quản lý hoạt động thương mại điện tử trên môi trường mạng",
      file: "TT23-2020.pdf"
    },
    {
      id: 4,
      title: "Luật Cạnh tranh 2018",
      category: "Luật",
      date: "12/06/2018",
      effectiveDate: "01/07/2019",
      description: "Quy định về các hành vi cạnh tranh bị cấm, kiểm soát tập trung kinh tế",
      file: "LuongCanhTranh.pdf"
    },
    {
      id: 5,
      title: "Nghị định 52/2013/NĐ-CP về thương mại điện tử",
      category: "Nghị định",
      date: "19/05/2013",
      effectiveDate: "01/07/2013",
      description: "Quy định chi tiết về thương mại điện tử và giao dịch điện tử",
      file: "ND52-2013.pdf"
    },
    {
      id: 6,
      title: "Thông tư 28/2015/TT-BCT về xác nhận chứng nhận xuất xứ hàng hóa",
      category: "Thông tư",
      date: "27/11/2015",
      effectiveDate: "15/01/2016",
      description: "Quy định về thủ tục xác nhận và cấp chứng nhận xuất xứ hàng hóa",
      file: "TT28-2015.pdf"
    }
  ];

  const categories = ['all', 'Luật', 'Nghị định', 'Thông tư', 'Quyết định'];

  const filteredDocuments = legalDocuments.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Scale className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Văn bản Pháp luật</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Tổng hợp các văn bản pháp luật liên quan đến chống hàng giả, bảo vệ người tiêu dùng và quản lý thương mại điện tử
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm văn bản..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'Tất cả' : cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Documents List */}
        <div className="grid grid-cols-1 gap-6">
          {filteredDocuments.map((doc) => (
            <div key={doc.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                      {doc.category}
                    </span>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      {doc.date}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{doc.title}</h3>
                  <p className="text-gray-600 mb-4">{doc.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      <strong>Hiệu lực:</strong> {doc.effectiveDate}
                    </div>
                    <button className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium">
                      <Download className="w-4 h-4" />
                      Tải xuống
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-blue-50 rounded-lg p-8">
          <div className="flex items-center mb-4">
            <BookOpen className="w-8 h-8 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Hướng dẫn sử dụng</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Tìm kiếm</h3>
              <p className="text-gray-600 text-sm">Sử dụng thanh tìm kiếm để nhanh chóng tìm văn bản theo tên hoặc nội dung</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Lọc theo loại</h3>
              <p className="text-gray-600 text-sm">Chọn loại văn bản (Luật, Nghị định, Thông tư) để lọc kết quả</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Tải xuống</h3>
              <p className="text-gray-600 text-sm">Nhấn vào nút tải xuống để nhận bản đầy đủ của văn bản</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
