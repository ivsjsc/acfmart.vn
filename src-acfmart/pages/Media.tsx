import React, { useState } from 'react';
import { Play, Image, FileText, Calendar, Eye, Download, Share2, Search, Filter } from 'lucide-react';

export function Media() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const mediaItems = [
    {
      id: 1,
      type: 'video',
      title: "Phóng sự: Cuộc chiến chống hàng giả",
      thumbnail: "https://via.placeholder.com/400x225?text=Video+Thumbnail",
      duration: "15:30",
      date: "10/12/2024",
      views: "15.234",
      description: "Phóng sự đặc biệt về công tác chống hàng giả của Trung tâm ACF"
    },
    {
      id: 2,
      type: 'image',
      title: "Lễ vinh danh doanh nghiệp chính hãng 2024",
      thumbnail: "https://via.placeholder.com/400x300?text=Event+Photo",
      date: "01/12/2024",
      views: "8.567",
      description: "Hình ảnh từ lễ vinh danh các doanh nghiệp đạt chứng nhận ACF"
    },
    {
      id: 3,
      type: 'document',
      title: "Báo cáo hoạt động năm 2024",
      thumbnail: "https://via.placeholder.com/400x300?text=Document+Cover",
      date: "25/11/2024",
      views: "3.892",
      description: "Báo cáo tổng kết hoạt động chống hàng giả năm 2024"
    },
    {
      id: 4,
      type: 'video',
      title: "Hướng dẫn nhận biết hàng giả",
      thumbnail: "https://via.placeholder.com/400x225?text=Tutorial+Video",
      duration: "8:45",
      date: "15/11/2024",
      views: "22.156",
      description: "Video hướng dẫn người tiêu dùng nhận biết hàng giả cơ bản"
    },
    {
      id: 5,
      type: 'image',
      title: "Hoạt động kiểm tra chất lượng sản phẩm",
      thumbnail: "https://via.placeholder.com/400x300?text=Inspection+Photo",
      date: "10/11/2024",
      views: "6.234",
      description: "Hình ảnh quá trình kiểm tra chất lượng sản phẩm tại ACF"
    },
    {
      id: 6,
      type: 'video',
      title: "Tọa đàm: Xây dựng thị trường chính hãng",
      thumbnail: "https://via.placeholder.com/400x225?text=Seminar+Video",
      duration: "45:20",
      date: "05/11/2024",
      views: "9.876",
      description: "Tọa đàm chuyên đề về xây dựng thị trường chính hãng bền vững"
    }
  ];

  const tabs = [
    { id: 'all', label: 'Tất cả', icon: FileText },
    { id: 'video', label: 'Video', icon: Play },
    { id: 'image', label: 'Hình ảnh', icon: Image },
    { id: 'document', label: 'Tài liệu', icon: FileText }
  ];

  const filteredItems = mediaItems.filter(item => {
    const matchesTab = activeTab === 'all' || item.type === activeTab;
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
              <Play className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Media</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Thư viện hình ảnh, video và tài liệu về hoạt động của Trung tâm ACF
          </p>
        </div>

        {/* Tabs and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm media..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Media Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-48 object-cover"
                />
                {item.type === 'video' && (
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                      <Play className="w-8 h-8 text-purple-600 ml-1" />
                    </div>
                  </div>
                )}
                {item.type === 'video' && (
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                    {item.duration}
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    item.type === 'video' ? 'bg-red-600 text-white' :
                    item.type === 'image' ? 'bg-green-600 text-white' :
                    'bg-blue-600 text-white'
                  }`}>
                    {item.type === 'video' ? 'Video' :
                     item.type === 'image' ? 'Hình ảnh' : 'Tài liệu'}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{item.title}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {item.date}
                    </div>
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      {item.views}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="text-gray-400 hover:text-gray-600">
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button className="text-gray-400 hover:text-gray-600">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Statistics Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Play className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">156</div>
            <div className="text-gray-600">Video</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Image className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">1.234</div>
            <div className="text-gray-600">Hình ảnh</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">89</div>
            <div className="text-gray-600">Tài liệu</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Eye className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">2.5M</div>
            <div className="text-gray-600">Lượt xem</div>
          </div>
        </div>
      </div>
    </div>
  );
}
