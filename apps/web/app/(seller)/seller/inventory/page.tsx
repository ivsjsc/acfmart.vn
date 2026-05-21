'use client';
import { useState } from 'react';
import { AlertTriangle, Check, X, Edit2 } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  stock: number;
  maxStock: number;
  threshold: number;
  price: number;
}

const initialProducts: Product[] = [
  { id: '1', name: 'Tai nghe Sony WH-1000XM5', sku: 'SNY-WH1000', category: 'Điện tử', stock: 45, maxStock: 100, threshold: 10, price: 7990000 },
  { id: '2', name: 'Apple Watch Series 9', sku: 'APL-AW9', category: 'Điện tử', stock: 7, maxStock: 50, threshold: 10, price: 11990000 },
  { id: '3', name: 'Giày Nike Air Max 270', sku: 'NK-AM270', category: 'Thời trang', stock: 0, maxStock: 80, threshold: 10, price: 3290000 },
  { id: '4', name: 'Kính Ray-Ban Aviator', sku: 'RB-AVI01', category: 'Phụ kiện', stock: 28, maxStock: 60, threshold: 5, price: 2890000 },
  { id: '5', name: 'Kem Innisfree', sku: 'INF-CREAM', category: 'Làm đẹp', stock: 120, maxStock: 200, threshold: 20, price: 450000 },
  { id: '6', name: 'Máy tính Dell XPS 15', sku: 'DELL-XPS15', category: 'Điện tử', stock: 8, maxStock: 30, threshold: 5, price: 32000000 },
  { id: '7', name: 'Áo Uniqlo Dry-EX', sku: 'UNI-DREX', category: 'Thời trang', stock: 200, maxStock: 300, threshold: 30, price: 299000 },
  { id: '8', name: 'Túi xách Louis Vuitton', sku: 'LV-BAG01', category: 'Thời trang', stock: 3, maxStock: 20, threshold: 5, price: 45000000 },
];

type TabKey = 'ALL' | 'IN_STOCK' | 'LOW' | 'OUT';

export default function SellerInventoryPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [tab, setTab] = useState<TabKey>('ALL');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const lowCount = products.filter(p => p.stock > 0 && p.stock < p.threshold).length;
  const outCount = products.filter(p => p.stock === 0).length;

  const filtered = products.filter(p => {
    if (tab === 'IN_STOCK') return p.stock >= p.threshold;
    if (tab === 'LOW') return p.stock > 0 && p.stock < p.threshold;
    if (tab === 'OUT') return p.stock === 0;
    return true;
  });

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setEditValue(String(p.stock));
  };

  const saveEdit = (id: string) => {
    const val = parseInt(editValue, 10);
    if (!isNaN(val) && val >= 0) {
      setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: val } : p));
    }
    setEditingId(null);
  };

  const getStockColor = (stock: number, threshold: number) => {
    if (stock === 0) return 'bg-red-500';
    if (stock < threshold) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStockTextColor = (stock: number, threshold: number) => {
    if (stock === 0) return 'text-red-600';
    if (stock < threshold) return 'text-yellow-600';
    return 'text-gray-900';
  };

  const tabs: { key: TabKey; label: string; count?: number }[] = [
    { key: 'ALL', label: 'Tất cả', count: products.length },
    { key: 'IN_STOCK', label: 'Còn hàng', count: products.filter(p => p.stock >= p.threshold).length },
    { key: 'LOW', label: 'Sắp hết (<ngưỡng)', count: lowCount },
    { key: 'OUT', label: 'Hết hàng', count: outCount },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý tồn kho</h1>
        <p className="text-gray-500 text-sm mt-1">Theo dõi và cập nhật số lượng hàng hóa trong kho</p>
      </div>

      {/* Alert */}
      {(lowCount > 0 || outCount > 0) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-yellow-800">Cảnh báo tồn kho</p>
            <p className="text-sm text-yellow-700 mt-0.5">
              {lowCount > 0 && <span>{lowCount} sản phẩm sắp hết hàng</span>}
              {lowCount > 0 && outCount > 0 && <span> • </span>}
              {outCount > 0 && <span>{outCount} sản phẩm đã hết hàng</span>}
              . Hãy nhập hàng sớm để tránh mất đơn.
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.key ? 'bg-[#E31937] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {t.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Sản phẩm</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Danh mục</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase px-4 py-3">Giá</th>
                <th className="text-center text-xs font-medium text-gray-500 uppercase px-4 py-3">Tồn kho</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3 min-w-[180px]">Mức tồn</th>
                <th className="text-center text-xs font-medium text-gray-500 uppercase px-4 py-3">Ngưỡng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(product => {
                const pct = Math.min(100, (product.stock / product.maxStock) * 100);
                const barColor = getStockColor(product.stock, product.threshold);
                return (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1 max-w-[200px]">{product.name}</p>
                      <p className="text-xs text-gray-400">SKU: {product.sku}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{product.category}</td>
                    <td className="px-4 py-3 text-right text-sm text-gray-700">
                      {product.price.toLocaleString('vi-VN')}đ
                    </td>
                    <td className="px-4 py-3 text-center">
                      {editingId === product.id ? (
                        <div className="flex items-center justify-center gap-1">
                          <input
                            type="number"
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') saveEdit(product.id); if (e.key === 'Escape') setEditingId(null); }}
                            className="w-16 border border-blue-300 rounded px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-400"
                            autoFocus
                          />
                          <button onClick={() => saveEdit(product.id)} className="p-1 text-green-600 hover:bg-green-50 rounded">
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setEditingId(null)} className="p-1 text-gray-400 hover:bg-gray-100 rounded">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1.5 group">
                          <span className={`text-sm font-bold ${getStockTextColor(product.stock, product.threshold)}`}>
                            {product.stock}
                          </span>
                          <button
                            onClick={() => startEdit(product)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-blue-600 transition-opacity"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${barColor}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400 w-16 text-right shrink-0">
                          {product.stock}/{product.maxStock}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        ≤{product.threshold}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="py-10 text-center text-gray-400">
              <p className="font-medium">Không có sản phẩm nào trong danh mục này</p>
            </div>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-3">
        💡 Click vào số tồn kho để chỉnh sửa trực tiếp. Nhấn Enter để lưu, Esc để hủy.
      </p>
    </div>
  );
}
