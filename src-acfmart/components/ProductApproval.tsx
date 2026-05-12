import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, CheckCircle, XCircle, Clock, AlertCircle, Package, Star, TrendingUp, Users, ShoppingCart, Download, BarChart3, Calendar, DollarSign, Tag, Image, Edit, Trash2 } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  category: string;
  brand: string;
  images: string[];
  stock: number;
  sold: number;
  rating: number;
  reviews: number;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'active' | 'inactive';
  submittedAt: string;
  approvedAt?: string;
  rejectionReason?: string;
  shopId: string;
  shopName: string;
  shopEmail: string;
  shopPhone: string;
  tags: string[];
  specifications: Record<string, string>;
  shipping: {
    weight: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
    freeShipping: boolean;
  };
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  adminNotes?: string[];
}

const ProductApproval: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterShop, setFilterShop] = useState<string>('all');

  // Mock data
  useEffect(() => {
    const mockProducts: Product[] = [
      {
        id: '1',
        name: 'iPhone 15 Pro Max 256GB',
        description: 'iPhone 15 Pro Max với chip A17 Pro, camera 48MP, titan cấp 5',
        price: 32990000,
        originalPrice: 36990000,
        category: 'Điện thoại',
        brand: 'Apple',
        images: ['https://via.placeholder.com/300x300'],
        stock: 50,
        sold: 15,
        rating: 4.8,
        reviews: 120,
        status: 'pending',
        submittedAt: '2024-01-15T10:30:00Z',
        shopId: 'shop-1',
        shopName: 'TechStore Pro',
        shopEmail: 'techstore@example.com',
        shopPhone: '0912345678',
        tags: ['iphone', 'apple', 'pro', 'smartphone'],
        specifications: {
          'Màn hình': '6.7 inch Super Retina XDR',
          'Chip': 'A17 Pro',
          'Camera': '48MP + 12MP + 12MP',
          'Pin': '4423 mAh'
        },
        shipping: {
          weight: 221,
          dimensions: { length: 159.9, width: 76.7, height: 8.25 },
          freeShipping: true
        },
        seo: {
          title: 'iPhone 15 Pro Max 256GB Chính Hãng',
          description: 'Mua iPhone 15 Pro Max giá tốt nhất',
          keywords: ['iphone 15 pro max', 'apple', 'điện thoại']
        }
      },
      {
        id: '2',
        name: 'Samsung Galaxy S24 Ultra 5G',
        description: 'Samsung Galaxy S24 Ultra với S Pen, camera 200MP, màn hình Dynamic AMOLED 2X',
        price: 28990000,
        originalPrice: 32990000,
        category: 'Điện thoại',
        brand: 'Samsung',
        images: ['https://via.placeholder.com/300x300'],
        stock: 30,
        sold: 8,
        rating: 4.7,
        reviews: 85,
        status: 'approved',
        submittedAt: '2024-01-14T14:20:00Z',
        approvedAt: '2024-01-16T09:00:00Z',
        shopId: 'shop-1',
        shopName: 'TechStore Pro',
        shopEmail: 'techstore@example.com',
        shopPhone: '0912345678',
        tags: ['samsung', 'galaxy', 'ultra', 'android'],
        specifications: {
          'Màn hình': '6.8 inch Dynamic AMOLED 2X',
          'Chip': 'Snapdragon 8 Gen 3',
          'Camera': '200MP + 50MP + 12MP + 10MP',
          'Pin': '5000 mAh'
        },
        shipping: {
          weight: 234,
          dimensions: { length: 162.3, width: 79.0, height: 8.6 },
          freeShipping: false
        },
        seo: {
          title: 'Samsung Galaxy S24 Ultra 5G Chính Hãng',
          description: 'Mua Samsung Galaxy S24 Ultra giá tốt',
          keywords: ['samsung s24 ultra', 'android', 'điện thoại']
        }
      },
      {
        id: '3',
        name: 'MacBook Air M2 13inch 2023',
        description: 'MacBook Air M2 13inch với chip Apple M2, RAM 8GB, SSD 256GB',
        price: 27990000,
        originalPrice: 31990000,
        category: 'Laptop',
        brand: 'Apple',
        images: ['https://via.placeholder.com/300x300'],
        stock: 20,
        sold: 5,
        rating: 4.9,
        reviews: 45,
        status: 'rejected',
        submittedAt: '2024-01-13T16:45:00Z',
        rejectionReason: 'Giá quá cao so với thị trường, cần điều chỉnh giá',
        shopId: 'shop-2',
        shopName: 'Apple Store VN',
        shopEmail: 'applestore@example.com',
        shopPhone: '0987654321',
        tags: ['macbook', 'apple', 'laptop', 'm2'],
        specifications: {
          'Màn hình': '13.6 inch Liquid Retina',
          'Chip': 'Apple M2',
          'RAM': '8GB',
          'SSD': '256GB'
        },
        shipping: {
          weight: 1240,
          dimensions: { length: 304.1, width: 215.0, height: 11.3 },
          freeShipping: true
        },
        seo: {
          title: 'MacBook Air M2 13inch 2023',
          description: 'Mua MacBook Air M2 giá tốt',
          keywords: ['macbook air', 'apple', 'laptop']
        }
      },
      {
        id: '4',
        name: 'AirPods Pro 2nd Gen',
        description: 'AirPods Pro thế hệ 2 với chip H2, ANC 2x, Adaptive Audio',
        price: 6990000,
        originalPrice: 7990000,
        category: 'Tai nghe',
        brand: 'Apple',
        images: ['https://via.placeholder.com/300x300'],
        stock: 100,
        sold: 45,
        rating: 4.6,
        reviews: 200,
        status: 'active',
        submittedAt: '2024-01-12T11:00:00Z',
        approvedAt: '2024-01-13T10:00:00Z',
        shopId: 'shop-3',
        shopName: 'Gadget World',
        shopEmail: 'gadget@example.com',
        shopPhone: '0978123456',
        tags: ['airpods', 'apple', 'tai nghe', 'wireless'],
        specifications: {
          'Chip': 'H2',
          'ANC': 'Active Noise Cancellation 2x',
          'Thời gian pin': '6 giờ (ANC bật)',
          'Case sạc': '30 giờ tổng cộng'
        },
        shipping: {
          weight: 50.8,
          dimensions: { length: 45.2, width: 60.9, height: 21.7 },
          freeShipping: true
        },
        seo: {
          title: 'AirPods Pro 2nd Gen Chính Hãng',
          description: 'Mua AirPods Pro 2 giá tốt nhất',
          keywords: ['airpods pro 2', 'apple', 'tai nghe không dây']
        }
      }
    ];
    setProducts(mockProducts);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Edit className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'active': return <Package className="w-4 h-4" />;
      case 'inactive': return <AlertCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Bản nháp';
      case 'pending': return 'Chờ duyệt';
      case 'approved': return 'Đã duyệt';
      case 'rejected': return 'Đã từ chối';
      case 'active': return 'Đang bán';
      case 'inactive': return 'Ngừng bán';
      default: return status;
    }
  };

  const handleApprove = async () => {
    if (!selectedProduct) return;

    setProducts(prev => prev.map(p => 
      p.id === selectedProduct.id 
        ? { 
            ...p, 
            status: 'approved' as const,
            approvedAt: new Date().toISOString(),
            adminNotes: [...(p.adminNotes || []), `Đã duyệt bởi admin: ${approvalNotes}`]
          } 
        : p
    ));
    
    // Send approval email to shop
    console.log(`Approval email sent to ${selectedProduct.shopEmail}`);
    
    setShowApprovalModal(false);
    setApprovalNotes('');
  };

  const handleReject = async () => {
    if (!selectedProduct || !rejectReason.trim()) return;

    setProducts(prev => prev.map(p => 
      p.id === selectedProduct.id 
        ? { 
            ...p, 
            status: 'rejected' as const,
            rejectionReason: rejectReason,
            adminNotes: [...(p.adminNotes || []), `Đã từ chối: ${rejectReason}`]
          } 
        : p
    ));
    
    // Send rejection email to shop
    console.log(`Rejection email sent to ${selectedProduct.shopEmail}`);
    
    setShowRejectModal(false);
    setRejectReason('');
  };

  const handleActivateProduct = (productId: string) => {
    setProducts(prev => prev.map(p => 
      p.id === productId 
        ? { ...p, status: 'active' as const }
        : p
    ));
  };

  const handleDeactivateProduct = (productId: string) => {
    setProducts(prev => prev.map(p => 
      p.id === productId 
        ? { ...p, status: 'inactive' as const }
        : p
    ));
  };

  const filteredProducts = products.filter(product => {
    const matchesStatus = filterStatus === 'all' || product.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    const matchesShop = filterShop === 'all' || product.shopName === filterShop;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesCategory && matchesShop && matchesSearch;
  });

  const categories = [...new Set(products.map(p => p.category))];
  const shops = [...new Set(products.map(p => p.shopName))];

  const stats = {
    total: products.length,
    pending: products.filter(p => p.status === 'pending').length,
    approved: products.filter(p => p.status === 'approved').length,
    active: products.filter(p => p.status === 'active').length,
    rejected: products.filter(p => p.status === 'rejected').length,
    totalValue: products.reduce((sum, p) => sum + (p.price * p.stock), 0)
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Duyệt Sản phẩm</h1>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <Download className="w-4 h-4" />
                Xuất báo cáo
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <BarChart3 className="w-4 h-4" />
                Thống kê
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">Tổng sản phẩm</p>
                  <p className="text-2xl font-bold text-blue-700">{stats.total}</p>
                </div>
                <Package className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600">Chờ duyệt</p>
                  <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600">Đã duyệt</p>
                  <p className="text-2xl font-bold text-green-700">{stats.approved}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600">Đang bán</p>
                  <p className="text-2xl font-bold text-purple-700">{stats.active}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600">Đã từ chối</p>
                  <p className="text-2xl font-bold text-red-700">{stats.rejected}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>

            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600">Giá trị tồn kho</p>
                  <p className="text-2xl font-bold text-orange-700">
                    {(stats.totalValue / 1000000000).toFixed(1)}B
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ duyệt</option>
              <option value="approved">Đã duyệt</option>
              <option value="active">Đang bán</option>
              <option value="rejected">Đã từ chối</option>
            </select>

            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">Tất cả danh mục</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterShop}
              onChange={(e) => setFilterShop(e.target.value)}
            >
              <option value="all">Tất cả cửa hàng</option>
              {shops.map(shop => (
                <option key={shop} value={shop}>{shop}</option>
              ))}
            </select>

            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4" />
              Bộ lọc nâng cao
            </button>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sản phẩm</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cửa hàng</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tồn kho</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đã bán</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đánh giá</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày gửi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Image className="w-6 h-6 text-gray-400" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.brand} • {product.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{product.shopName}</div>
                        <div className="text-sm text-gray-500">{product.shopEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{(product.price / 1000000).toFixed(1)}M</div>
                        {product.originalPrice > product.price && (
                          <div className="text-sm text-gray-500 line-through">
                            {(product.originalPrice / 1000000).toFixed(1)}M
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{product.stock}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{product.sold}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-900">{product.rating}</span>
                        <span className="text-sm text-gray-500">({product.reviews})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {new Date(product.submittedAt).toLocaleDateString('vi-VN')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(product.status)}`}>
                        {getStatusIcon(product.status)}
                        {getStatusText(product.status)}
                      </div>
                      {product.rejectionReason && (
                        <div className="text-xs text-red-600 mt-1 max-w-xs truncate" title={product.rejectionReason}>
                          {product.rejectionReason}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedProduct(product);
                            setShowDetails(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {product.status === 'pending' && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedProduct(product);
                                setShowApprovalModal(true);
                              }}
                              className="text-green-600 hover:text-green-900 transition-colors"
                              title="Duyệt sản phẩm"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedProduct(product);
                                setShowRejectModal(true);
                              }}
                              className="text-red-600 hover:text-red-900 transition-colors"
                              title="Từ chối sản phẩm"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {product.status === 'approved' && (
                          <button
                            onClick={() => handleActivateProduct(product.id)}
                            className="text-purple-600 hover:text-purple-900 transition-colors"
                            title="Kích hoạt bán"
                          >
                            <Package className="w-4 h-4" />
                          </button>
                        )}
                        {product.status === 'active' && (
                          <button
                            onClick={() => handleDeactivateProduct(product.id)}
                            className="text-gray-600 hover:text-gray-900 transition-colors"
                            title="Ngừng bán"
                          >
                            <AlertCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Product Details Modal */}
        {showDetails && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto m-4">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Chi tiết sản phẩm #{selectedProduct.id}</h2>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Product Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="md:col-span-1">
                    <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                      <Image className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{selectedProduct.name}</h3>
                    <div className="flex items-center gap-2 mb-4">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-900">{selectedProduct.rating}</span>
                      <span className="text-sm text-gray-500">({selectedProduct.reviews} đánh giá)</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Giá bán:</span>
                        <span className="font-bold text-red-600">{(selectedProduct.price / 1000000).toFixed(1)}M</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Giá gốc:</span>
                        <span className="font-medium">{(selectedProduct.originalPrice / 1000000).toFixed(1)}M</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tồn kho:</span>
                        <span className="font-medium">{selectedProduct.stock}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Đã bán:</span>
                        <span className="font-medium">{selectedProduct.sold}</span>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-6">
                    {/* Shop Info */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Thông tin cửa hàng</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Tên cửa hàng</p>
                            <p className="font-medium">{selectedProduct.shopName}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Email</p>
                            <p className="font-medium">{selectedProduct.shopEmail}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">SĐT</p>
                            <p className="font-medium">{selectedProduct.shopPhone}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Shop ID</p>
                            <p className="font-medium">{selectedProduct.shopId}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Product Details */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Chi tiết sản phẩm</h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-600">Mô tả</p>
                          <p className="text-gray-900">{selectedProduct.description}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Thông số kỹ thuật</p>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            {Object.entries(selectedProduct.specifications).map(([key, value]) => (
                              <div key={key} className="flex justify-between py-1 border-b">
                                <span className="text-gray-600">{key}:</span>
                                <span className="font-medium">{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Tags</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {selectedProduct.tags.map((tag, index) => (
                              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status & Timeline */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Trạng thái</h4>
                    <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border ${getStatusColor(selectedProduct.status)}`}>
                      {getStatusIcon(selectedProduct.status)}
                      {getStatusText(selectedProduct.status)}
                    </div>
                    {selectedProduct.rejectionReason && (
                      <div className="mt-3 p-3 bg-red-50 rounded-lg">
                        <p className="text-sm text-red-800">
                          <strong>Lý do từ chối:</strong> {selectedProduct.rejectionReason}
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Timeline</h4>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <Calendar className="w-3 h-3 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">Gửi duyệt</div>
                          <div className="text-xs text-gray-500">
                            {new Date(selectedProduct.submittedAt).toLocaleString('vi-VN')}
                          </div>
                        </div>
                      </div>
                      {selectedProduct.approvedAt && (
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-3 h-3 text-green-600" />
                          </div>
                          <div>
                            <div className="font-medium text-sm">Đã duyệt</div>
                            <div className="text-xs text-gray-500">
                              {new Date(selectedProduct.approvedAt).toLocaleString('vi-VN')}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {selectedProduct.status === 'pending' && (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setSelectedProduct(selectedProduct);
                        setShowApprovalModal(true);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Duyệt sản phẩm
                    </button>
                    <button
                      onClick={() => {
                        setSelectedProduct(selectedProduct);
                        setShowRejectModal(true);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Từ chối sản phẩm
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Approval Modal */}
        {showApprovalModal && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-md w-full m-4">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Duyệt sản phẩm</h2>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Sản phẩm:</p>
                  <p className="font-medium">{selectedProduct.name}</p>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Cửa hàng:</p>
                  <p className="font-medium">{selectedProduct.shopName}</p>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi chú duyệt
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Nhập ghi chú cho việc duyệt sản phẩm..."
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleApprove}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Xác nhận duyệt
                  </button>
                  <button
                    onClick={() => setShowApprovalModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-md w-full m-4">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Từ chối sản phẩm</h2>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Sản phẩm:</p>
                  <p className="font-medium">{selectedProduct.name}</p>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lý do từ chối
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Nhập lý do từ chối sản phẩm này..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleReject}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Xác nhận từ chối
                  </button>
                  <button
                    onClick={() => {
                      setShowRejectModal(false);
                      setRejectReason('');
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductApproval;
