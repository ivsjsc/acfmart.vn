'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';

const mockProducts = [
  { id: '1', image: '/product1.jpg', name: 'Tai nghe Bluetooth Sony WH-1000XM5', sku: 'SNY-WH1000', category: 'Điện tử', price: 7990000, stock: 45, sold: 156, status: 'APPROVED' },
  { id: '2', image: '/product2.jpg', name: 'Đồng hồ Apple Watch Series 9', sku: 'APL-AW9', category: 'Điện tử', price: 11990000, stock: 12, sold: 89, status: 'APPROVED' },
  { id: '3', image: '/product3.jpg', name: 'Giày Nike Air Max 270', sku: 'NK-AM270', category: 'Thời trang', price: 3290000, stock: 0, sold: 234, status: 'OUT_OF_STOCK' },
  { id: '4', image: '/product4.jpg', name: 'Túi xách Louis Vuitton chính hãng', sku: 'LV-BAG01', category: 'Thời trang', price: 45000000, stock: 3, sold: 7, status: 'PENDING_APPROVAL' },
  { id: '5', image: '/product5.jpg', name: 'Kính mắt Ray-Ban Aviator', sku: 'RB-AVI01', category: 'Phụ kiện', price: 2890000, stock: 28, sold: 45, status: 'APPROVED' },
  { id: '6', image: '/product6.jpg', name: 'Kem dưỡng da Innisfree', sku: 'INF-CREAM', category: 'Làm đẹp', price: 450000, stock: 120, sold: 312, status: 'APPROVED' },
  { id: '7', image: '/product7.jpg', name: 'Máy tính Dell XPS 15', sku: 'DELL-XPS15', category: 'Điện tử', price: 32000000, stock: 8, sold: 23, status: 'REJECTED' },
  { id: '8', image: '/product8.jpg', name: 'Áo thun Uniqlo Dry-EX', sku: 'UNI-DREX', category: 'Thời trang', price: 299000, stock: 200, sold: 567, status: 'APPROVED' },
];

const statusConfig: Record<string, { label: string; className: string }> = {
  APPROVED: { label: 'Đang bán', className: 'bg-green-100 text-green-700' },
  PENDING_APPROVAL: { label: 'Chờ duyệt', className: 'bg-yellow-100 text-yellow-700' },
  REJECTED: { label: 'Từ chối', className: 'bg-red-100 text-red-700' },
  OUT_OF_STOCK: { label: 'Hết hàng', className: 'bg-gray-100 text-gray-600' },
  DRAFT: { label: 'Nháp', className: 'bg-blue-100 text-blue-700' },
};

export default function SellerProductsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = mockProducts.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: mockProducts.length,
    selling: mockProducts.filter(p => p.status === 'APPROVED').length,
    outOfStock: mockProducts.filter(p => p.status === 'OUT_OF_STOCK').length,
    pending: mockProducts.filter(p => p.status === 'PENDING_APPROVAL').length,
  };

  const filterButtons = [
    { key: 'ALL', label: 'Tất cả' },
    { key: 'APPROVED', label: 'Đang bán' },
    { key: 'PENDING_APPROVAL', label: 'Chờ duyệt' },
    { key: 'REJECTED', label: 'Từ chối' },
    { key: 'OUT_OF_STOCK', label: 'Hết hàng' },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sản phẩm của tôi</h1>
          <p className="text-gray-500 text-sm mt-1">Quản lý tất cả sản phẩm trong shop của bạn</p>
        </div>
        <Link
          href="/seller/products/new"
          className="flex items-center gap-2 bg-[#E31937] hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Thêm sản phẩm
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Tổng sản phẩm', value: stats.total, color: 'text-gray-900' },
          { label: 'Đang bán', value: stats.selling, color: 'text-green-600' },
          { label: 'Hết hàng', value: stats.outOfStock, color: 'text-red-600' },
          { label: 'Chờ duyệt', value: stats.pending, color: 'text-yellow-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters + Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm theo tên sản phẩm, SKU..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {filterButtons.map((btn) => (
              <button
                key={btn.key}
                onClick={() => setStatusFilter(btn.key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === btn.key
                    ? 'bg-[#E31937] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Sản phẩm</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Danh mục</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase px-4 py-3">Giá</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase px-4 py-3">Tồn kho</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase px-4 py-3">Đã bán</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Trạng thái</th>
                <th className="text-center text-xs font-medium text-gray-500 uppercase px-4 py-3">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs font-medium shrink-0">
                        IMG
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 line-clamp-1 max-w-[200px]">{product.name}</p>
                        <p className="text-xs text-gray-400">SKU: {product.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{product.category}</td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                    {product.price.toLocaleString('vi-VN')}đ
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`text-sm font-medium ${
                      product.stock === 0 ? 'text-red-600' : product.stock < 10 ? 'text-yellow-600' : 'text-gray-900'
                    }`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-600">{product.sold}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusConfig[product.status]?.className}`}>
                      {statusConfig[product.status]?.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="py-12 text-center text-gray-400">
              <p className="text-lg font-medium">Không tìm thấy sản phẩm</p>
              <p className="text-sm mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
