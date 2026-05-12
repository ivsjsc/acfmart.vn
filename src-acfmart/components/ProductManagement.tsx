import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye, Star, Package, Clock, CheckCircle, XCircle, AlertCircle, Upload, Image, DollarSign, Tag, Calendar, ChevronDown, Download, BarChart3, TrendingUp, Users, ShoppingCart } from 'lucide-react';

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
}

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showProductDetails, setShowProductDetails] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    originalPrice: 0,
    category: '',
    brand: '',
    stock: 0,
    tags: [],
    specifications: {},
    shipping: {
      weight: 0,
      dimensions: { length: 0, width: 0, height: 0 },
      freeShipping: false
    },
    seo: {
      title: '',
      description: '',
      keywords: []
    }
  });

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
        status: 'approved',
        submittedAt: '2024-01-15T10:30:00Z',
        approvedAt: '2024-01-16T09:00:00Z',
        shopId: 'shop-1',
        shopName: 'TechStore Pro',
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
        status: 'pending',
        submittedAt: '2024-01-14T14:20:00Z',
        shopId: 'shop-1',
        shopName: 'TechStore Pro',
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
        rejectionReason: 'Giá quá cao so với thị trường',
        shopId: 'shop-1',
        shopName: 'TechStore Pro',
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

  const filteredProducts = products.filter(product => {
    const matchesStatus = filterStatus === 'all' || product.status === filterStatus;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleSaveProduct = () => {
    if (isEditing && selectedProduct) {
      setProducts(prev => prev.map(p => 
        p.id === selectedProduct.id 
          ? { ...p, ...formData, status: 'pending' as const, submittedAt: new Date().toISOString() }
          : p
      ));
    } else {
      const newProduct: Product = {
        id: Date.now().toString(),
        name: formData.name || '',
        description: formData.description || '',
        price: formData.price || 0,
        originalPrice: formData.originalPrice || 0,
        category: formData.category || '',
        brand: formData.brand || '',
        images: [],
        stock: formData.stock || 0,
        sold: 0,
        rating: 0,
        reviews: 0,
        status: 'draft',
        submittedAt: new Date().toISOString(),
        shopId: 'shop-1',
        shopName: 'TechStore Pro',
        tags: formData.tags || [],
        specifications: formData.specifications || {},
        shipping: formData.shipping || {
          weight: 0,
          dimensions: { length: 0, width: 0, height: 0 },
          freeShipping: false
        },
        seo: formData.seo || {
          title: '',
          description: '',
          keywords: []
        }
      };
      setProducts(prev => [...prev, newProduct]);
    }
    setShowProductModal(false);
    setIsEditing(false);
    setSelectedProduct(null);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setFormData(product);
    setIsEditing(true);
    setShowProductModal(true);
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      setProducts(prev => prev.filter(p => p.id !== productId));
    }
  };

  const handleSubmitForApproval = (productId: string) => {
    setProducts(prev => prev.map(p => 
      p.id === productId 
        ? { ...p, status: 'pending' as const, submittedAt: new Date().toISOString() }
        : p
    ));
  };

  const stats = {
    total: products.length,
    active: products.filter(p => p.status === 'active').length,
    pending: products.filter(p => p.status === 'pending').length,
    draft: products.filter(p => p.status === 'draft').length,
    sold: products.reduce((sum, p) => sum + p.sold, 0),
    revenue: products.reduce((sum, p) => sum + (p.sold * p.price), 0)
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Quản lý Sản phẩm</h1>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <Download className="w-4 h-4" />
                Xuất báo cáo
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setSelectedProduct(null);
                  setFormData({
                    name: '',
                    description: '',
                    price: 0,
                    originalPrice: 0,
                    category: '',
                    brand: '',
                    stock: 0,
                    tags: [],
                    specifications: {},
                    shipping: {
                      weight: 0,
                      dimensions: { length: 0, width: 0, height: 0 },
                      freeShipping: false
                    },
                    seo: {
                      title: '',
                      description: '',
                      keywords: []
                    }
                  });
                  setShowProductModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Thêm sản phẩm
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

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600">Đang bán</p>
                  <p className="text-2xl font-bold text-green-700">{stats.active}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
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

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Bản nháp</p>
                  <p className="text-2xl font-bold text-gray-700">{stats.draft}</p>
                </div>
                <Edit className="w-8 h-8 text-gray-600" />
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600">Đã bán</p>
                  <p className="text-2xl font-bold text-purple-700">{stats.sold}</p>
                </div>
                <ShoppingCart className="w-8 h-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600">Doanh thu</p>
                  <p className="text-2xl font-bold text-orange-700">
                    {(stats.revenue / 1000000).toFixed(1)}M
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <option value="draft">Bản nháp</option>
              <option value="pending">Chờ duyệt</option>
              <option value="approved">Đã duyệt</option>
              <option value="active">Đang bán</option>
              <option value="rejected">Đã từ chối</option>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tồn kho</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đã bán</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đánh giá</th>
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
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(product.status)}`}>
                        {getStatusIcon(product.status)}
                        {getStatusText(product.status)}
                      </div>
                      {product.rejectionReason && (
                        <div className="text-xs text-red-600 mt-1">{product.rejectionReason}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedProduct(product);
                            setShowProductDetails(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="text-green-600 hover:text-green-900 transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {product.status === 'draft' && (
                          <button
                            onClick={() => handleSubmitForApproval(product.id)}
                            className="text-yellow-600 hover:text-yellow-900 transition-colors"
                            title="Gửi duyệt"
                          >
                            <Upload className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Product Modal */}
        {showProductModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">
                    {isEditing ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
                  </h2>
                  <button
                    onClick={() => setShowProductModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tên sản phẩm</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nhập tên sản phẩm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Chọn danh mục</option>
                      <option value="Điện thoại">Điện thoại</option>
                      <option value="Laptop">Laptop</option>
                      <option value="Tablet">Tablet</option>
                      <option value="Đồng hồ">Đồng hồ</option>
                      <option value="Tai nghe">Tai nghe</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Thương hiệu</label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nhập thương hiệu"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tồn kho</label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Số lượng tồn kho"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Giá bán</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Giá bán (VNĐ)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Giá gốc</label>
                    <input
                      type="number"
                      value={formData.originalPrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: parseInt(e.target.value) || 0 }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Giá gốc (VNĐ)"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả sản phẩm</label>
                    <textarea
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Mô tả chi tiết sản phẩm"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                    <input
                      type="text"
                      value={formData.tags?.join(', ')}
                      onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value.split(',').map(tag => tag.trim()) }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Tags (phân cách bằng dấu phẩy)"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowProductModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSaveProduct}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {isEditing ? 'Cập nhật' : 'Lưu'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Product Details Modal */}
        {showProductDetails && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Chi tiết sản phẩm</h2>
                  <button
                    onClick={() => setShowProductDetails(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                      <Image className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{selectedProduct.name}</h3>
                    <div className="flex items-center gap-2 mb-4">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-900">{selectedProduct.rating}</span>
                      <span className="text-sm text-gray-500">({selectedProduct.reviews} đánh giá)</span>
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                      <div>
                        <span className="text-2xl font-bold text-red-600">
                          {(selectedProduct.price / 1000000).toFixed(1)}M
                        </span>
                        {selectedProduct.originalPrice > selectedProduct.price && (
                          <span className="text-sm text-gray-500 line-through ml-2">
                            {(selectedProduct.originalPrice / 1000000).toFixed(1)}M
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Thông tin cơ bản</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Thương hiệu:</span>
                            <span className="font-medium">{selectedProduct.brand}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Danh mục:</span>
                            <span className="font-medium">{selectedProduct.category}</span>
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

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Trạng thái</h4>
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedProduct.status)}`}>
                          {getStatusIcon(selectedProduct.status)}
                          {getStatusText(selectedProduct.status)}
                        </div>
                        {selectedProduct.rejectionReason && (
                          <div className="text-sm text-red-600 mt-2">{selectedProduct.rejectionReason}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-2">Mô tả sản phẩm</h4>
                  <p className="text-gray-600">{selectedProduct.description}</p>
                </div>

                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-2">Thông số kỹ thuật</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(selectedProduct.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">{key}:</span>
                        <span className="font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
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
        )}
      </div>
    </div>
  );
};

export default ProductManagement;
