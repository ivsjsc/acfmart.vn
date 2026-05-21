'use client';
import { useState } from 'react';
import { Plus, Edit, Trash2, X, ChevronDown, ChevronRight } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  productCount: number;
  expanded: boolean;
  children: Omit<Category, 'children' | 'expanded'>[];
}

interface Brand {
  id: string;
  name: string;
  logo: string;
  productCount: number;
}

const initialCategories: Category[] = [
  {
    id: '1', name: 'Điện tử', slug: 'dien-tu', icon: '📱', productCount: 1240, expanded: false,
    children: [
      { id: '1-1', name: 'Điện thoại', slug: 'dien-thoai', icon: '📱', productCount: 456 },
      { id: '1-2', name: 'Laptop & PC', slug: 'laptop-pc', icon: '💻', productCount: 234 },
      { id: '1-3', name: 'Tai nghe', slug: 'tai-nghe', icon: '🎧', productCount: 189 },
      { id: '1-4', name: 'Đồng hồ thông minh', slug: 'dong-ho-thong-minh', icon: '⌚', productCount: 98 },
    ],
  },
  {
    id: '2', name: 'Thời trang', slug: 'thoi-trang', icon: '👕', productCount: 3450, expanded: false,
    children: [
      { id: '2-1', name: 'Áo', slug: 'ao', icon: '👕', productCount: 890 },
      { id: '2-2', name: 'Quần', slug: 'quan', icon: '👖', productCount: 567 },
      { id: '2-3', name: 'Giày dép', slug: 'giay-dep', icon: '👟', productCount: 678 },
    ],
  },
  {
    id: '3', name: 'Làm đẹp', slug: 'lam-dep', icon: '💄', productCount: 890, expanded: false, children: [],
  },
  {
    id: '4', name: 'Nhà cửa', slug: 'nha-cua', icon: '🏠', productCount: 567, expanded: false, children: [],
  },
  {
    id: '5', name: 'Thể thao', slug: 'the-thao', icon: '⚽', productCount: 345, expanded: false, children: [],
  },
];

const initialBrands: Brand[] = [
  { id: '1', name: 'Sony', logo: 'S', productCount: 145 },
  { id: '2', name: 'Apple', logo: '🍎', productCount: 234 },
  { id: '3', name: 'Nike', logo: '✓', productCount: 389 },
  { id: '4', name: 'Samsung', logo: 'S', productCount: 201 },
  { id: '5', name: 'Ray-Ban', logo: 'R', productCount: 67 },
  { id: '6', name: 'Innisfree', logo: 'I', productCount: 98 },
  { id: '7', name: 'Uniqlo', logo: 'U', productCount: 567 },
  { id: '8', name: 'Dell', logo: 'D', productCount: 89 },
  { id: '9', name: 'LG', logo: 'L', productCount: 112 },
  { id: '10', name: 'Adidas', logo: 'A', productCount: 278 },
];

type ActiveTab = 'categories' | 'brands';

interface ModalState {
  open: boolean;
  mode: 'add' | 'edit';
  type: ActiveTab;
  data: { name: string; slug: string; icon: string; parent: string };
}

export default function AdminCategoriesPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('categories');
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [brands] = useState<Brand[]>(initialBrands);
  const [modal, setModal] = useState<ModalState>({
    open: false, mode: 'add', type: 'categories',
    data: { name: '', slug: '', icon: '', parent: '' },
  });

  const toggleExpand = (id: string) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, expanded: !c.expanded } : c));
  };

  const autoSlug = (name: string) =>
    name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const openModal = (mode: 'add' | 'edit', type: ActiveTab, prefill?: Partial<ModalState['data']>) => {
    setModal({ open: true, mode, type, data: { name: '', slug: '', icon: '📦', parent: '', ...prefill } });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Danh mục & Thương hiệu</h1>
          <p className="text-gray-500 text-sm mt-1">Quản lý cây danh mục và thương hiệu sản phẩm</p>
        </div>
        <button
          onClick={() => openModal('add', activeTab)}
          className="flex items-center gap-2 bg-[#E31937] hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          {activeTab === 'categories' ? 'Thêm danh mục' : 'Thêm thương hiệu'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {(['categories', 'brands'] as ActiveTab[]).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {tab === 'categories' ? 'Danh mục' : 'Thương hiệu'}
          </button>
        ))}
      </div>

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 grid grid-cols-[1fr_80px_100px] text-xs font-medium text-gray-500 uppercase">
            <span>Danh mục</span>
            <span className="text-right">Sản phẩm</span>
            <span className="text-center">Thao tác</span>
          </div>
          <div className="divide-y divide-gray-100">
            {categories.map(cat => (
              <div key={cat.id}>
                {/* Parent row */}
                <div className="grid grid-cols-[1fr_80px_100px] items-center px-5 py-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    {cat.children.length > 0 && (
                      <button onClick={() => toggleExpand(cat.id)} className="text-gray-400 hover:text-gray-600 transition-colors">
                        {cat.expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                    )}
                    {cat.children.length === 0 && <div className="w-4" />}
                    <span className="text-lg">{cat.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{cat.name}</p>
                      <p className="text-xs text-gray-400">/{cat.slug}</p>
                    </div>
                  </div>
                  <p className="text-right text-sm text-gray-600">{cat.productCount.toLocaleString()}</p>
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => openModal('add', 'categories', { parent: cat.id })}
                      className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors" title="Thêm danh mục con">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => openModal('edit', 'categories', { name: cat.name, slug: cat.slug, icon: cat.icon })}
                      className="p-1.5 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded transition-colors">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Children */}
                {cat.expanded && cat.children.map(child => (
                  <div key={child.id} className="grid grid-cols-[1fr_80px_100px] items-center px-5 py-2.5 bg-gray-50/50 hover:bg-gray-50 transition-colors border-t border-gray-50">
                    <div className="flex items-center gap-3 pl-7">
                      <div className="w-1 h-1 bg-gray-300 rounded-full" />
                      <span>{child.icon}</span>
                      <div>
                        <p className="text-sm text-gray-700">{child.name}</p>
                        <p className="text-xs text-gray-400">/{child.slug}</p>
                      </div>
                    </div>
                    <p className="text-right text-sm text-gray-500">{child.productCount.toLocaleString()}</p>
                    <div className="flex items-center justify-center gap-1">
                      <button className="p-1.5 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded transition-colors">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Brands Tab */}
      {activeTab === 'brands' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {brands.map(brand => (
            <div key={brand.id} className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-2xl font-bold text-gray-400 mx-auto mb-3">
                {brand.logo}
              </div>
              <p className="text-sm font-semibold text-gray-900">{brand.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{brand.productCount} sản phẩm</p>
              <div className="flex gap-1.5 justify-center mt-3">
                <button className="p-1.5 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded transition-colors">
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
          <button onClick={() => openModal('add', 'brands')}
            className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center text-gray-400 hover:border-red-300 hover:text-red-500 transition-colors min-h-[140px]">
            <Plus className="w-8 h-8 mb-2" />
            <span className="text-sm font-medium">Thêm thương hiệu</span>
          </button>
        </div>
      )}

      {/* Modal */}
      {modal.open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                {modal.mode === 'add' ? 'Thêm' : 'Sửa'} {modal.type === 'categories' ? 'danh mục' : 'thương hiệu'}
              </h2>
              <button onClick={() => setModal(m => ({ ...m, open: false }))} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {modal.type === 'categories' ? 'Tên danh mục' : 'Tên thương hiệu'} <span className="text-red-500">*</span>
                </label>
                <input
                  value={modal.data.name}
                  onChange={e => setModal(m => ({ ...m, data: { ...m.data, name: e.target.value, slug: autoSlug(e.target.value) } }))}
                  placeholder="Nhập tên..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug (tự động)</label>
                <input value={modal.data.slug} readOnly
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500" />
              </div>
              {modal.type === 'categories' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Icon (emoji)</label>
                    <input
                      value={modal.data.icon}
                      onChange={e => setModal(m => ({ ...m, data: { ...m.data, icon: e.target.value } }))}
                      placeholder="📦"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục cha</label>
                    <select
                      value={modal.data.parent}
                      onChange={e => setModal(m => ({ ...m, data: { ...m.data, parent: e.target.value } }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="">Danh mục gốc</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </>
              )}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setModal(m => ({ ...m, open: false }))}
                  className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                  Hủy
                </button>
                <button onClick={() => setModal(m => ({ ...m, open: false }))}
                  className="flex-1 py-2.5 bg-[#E31937] hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors">
                  {modal.mode === 'add' ? 'Thêm' : 'Cập nhật'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
