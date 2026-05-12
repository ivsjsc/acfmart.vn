import React, { useMemo, useState } from 'react';
import { useStore, Product, ShopProfile } from '../store';
import ExportReportButton from '../components/ExportReportButton';
import {
  ArrowDown,
  ArrowUp,
  Award,
  BadgePercent,
  BarChart3,
  Banknote,
  Building,
  CreditCard,
  Edit3,
  FileText,
  Landmark,
  MessageCircle,
  MessageSquare,
  Package,
  Percent,
  Plus,
  PlusCircle,
  Save,
  Settings,
  Share2,
  Star,
  Store,
  Trash2,
  Truck,
  Users,
  Wallet
} from 'lucide-react';

type ShopTab = 'products' | 'orders' | 'finance' | 'marketing' | 'customers' | 'shipping' | 'settings';

const tabs: Array<{ id: ShopTab; label: string; icon: React.ElementType }> = [
  { id: 'products', label: 'Sản phẩm', icon: Package },
  { id: 'orders', label: 'Đơn hàng', icon: FileText },
  { id: 'finance', label: 'Tài chính', icon: BarChart3 },
  { id: 'marketing', label: 'Marketing', icon: BadgePercent },
  { id: 'customers', label: 'Khách hàng', icon: Users },
  { id: 'shipping', label: 'Vận chuyển', icon: Truck },
  { id: 'settings', label: 'Cài đặt shop', icon: Settings }
];

const emptyProductForm = {
  name: '',
  price: '',
  sku: '',
  stock: '',
  category: '',
  origin: 'domestic' as 'domestic' | 'imported',
  description: ''
};

const formatCurrency = (value: number) => value.toLocaleString('vi-VN') + ' ₫';

// Mock financial history data
const financialHistory = [
  { id: 1, type: 'deposit', description: 'Thanh toán đơn hàng #12345', amount: 2500000, date: '2026-05-10', status: 'completed' },
  { id: 2, type: 'withdrawal', description: 'Rút tiền về ngân hàng', amount: 1000000, date: '2026-05-09', status: 'completed' },
  { id: 3, type: 'transfer', description: 'Chuyển tiền ví ACF', amount: 500000, date: '2026-05-08', status: 'pending' },
];

export function ShopView() {
  const {
    products,
    user,
    orders,
    role,
    shopProfile,
    addProduct,
    updateProduct,
    deleteProduct,
    updateOrderStatus,
    updateShopProfile
  } = useStore();

  const myShopId = user?.uid || '';
  const [activeTab, setActiveTab] = useState<ShopTab>('products');
  const [productForm, setProductForm] = useState(emptyProductForm);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);
  const [profileForm, setProfileForm] = useState<Partial<ShopProfile>>(shopProfile || {});
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const myProducts = role === 'admin' ? products : products.filter(product => product.shopId === myShopId);
  const myOrders = role === 'admin' ? orders : orders.filter(order => order.shopId === myShopId);

  const metrics = useMemo(() => {
    const completedOrders = myOrders.filter(order => order.status === 'completed' || order.status === 'delivered');
    const revenue = completedOrders.reduce((sum, order) => sum + order.total, 0);
    const serviceFee = Math.round(revenue * 0.035);
    const pendingRevenue = myOrders.filter(order => order.status !== 'cancelled' && order.status !== 'completed').reduce((sum, order) => sum + order.total, 0);

    return {
      revenue,
      serviceFee,
      pendingRevenue,
      availablePayout: Math.max(revenue - serviceFee, 0),
      approvedProducts: myProducts.filter(product => product.status === 'approved').length,
      pendingProducts: myProducts.filter(product => product.status === 'pending').length,
      lowStock: myProducts.filter(product => (product.stock ?? 0) > 0 && (product.stock ?? 0) <= 5).length
    };
  }, [myOrders, myProducts]);

  const startEditProduct = (product: Product) => {
    setEditingProductId(product.id);
    setProductForm({
      name: product.name,
      price: String(product.price),
      sku: product.sku || '',
      stock: String(product.stock ?? ''),
      category: product.category,
      origin: product.origin,
      description: product.description || ''
    });
  };

  const resetProductForm = () => {
    setEditingProductId(null);
    setProductForm(emptyProductForm);
  };

  const handleSaveProduct = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!productForm.name || !productForm.price || !productForm.category || isSubmittingProduct) return;

    setIsSubmittingProduct(true);
    const payload = {
      name: productForm.name.trim(),
      price: Number(productForm.price),
      shopId: myShopId,
      status: 'pending' as const,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60',
      origin: productForm.origin,
      category: productForm.category,
      sku: productForm.sku.trim(),
      stock: Number(productForm.stock || 0),
      description: productForm.description.trim()
    };

    if (editingProductId) {
      await updateProduct(editingProductId, payload);
    } else {
      await addProduct(payload);
    }

    resetProductForm();
    setIsSubmittingProduct(false);
  };

  const handleDeleteProduct = async (productId: string) => {
    await deleteProduct(productId);
  };

  const handleUpdateProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSavingProfile(true);
    await updateShopProfile(profileForm);
    setIsSavingProfile(false);
  };

  const renderProducts = () => (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[420px_1fr]">
      <section className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
          <PlusCircle className="w-5 h-5 text-red-600" />
          {editingProductId ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
        </h3>
        <form onSubmit={handleSaveProduct} className="space-y-3">
          <input value={productForm.name} onChange={event => setProductForm(current => ({ ...current, name: event.target.value }))} className="w-full rounded-md border border-gray-300 px-3 py-2" placeholder="Tên sản phẩm *" required />
          <div className="grid grid-cols-2 gap-3">
            <input type="number" value={productForm.price} onChange={event => setProductForm(current => ({ ...current, price: event.target.value }))} className="w-full rounded-md border border-gray-300 px-3 py-2" placeholder="Giá *" required />
            <input type="number" value={productForm.stock} onChange={event => setProductForm(current => ({ ...current, stock: event.target.value }))} className="w-full rounded-md border border-gray-300 px-3 py-2" placeholder="Tồn kho" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input value={productForm.sku} onChange={event => setProductForm(current => ({ ...current, sku: event.target.value }))} className="w-full rounded-md border border-gray-300 px-3 py-2" placeholder="SKU" />
            <input value={productForm.category} onChange={event => setProductForm(current => ({ ...current, category: event.target.value }))} className="w-full rounded-md border border-gray-300 px-3 py-2" placeholder="Danh mục *" required />
          </div>
          <select value={productForm.origin} onChange={event => setProductForm(current => ({ ...current, origin: event.target.value as 'domestic' | 'imported' }))} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2">
            <option value="domestic">Hàng trong nước</option>
            <option value="imported">Hàng nhập khẩu</option>
          </select>
          <textarea value={productForm.description} onChange={event => setProductForm(current => ({ ...current, description: event.target.value }))} rows={4} className="w-full rounded-md border border-gray-300 px-3 py-2" placeholder="Mô tả, quy cách, chứng nhận..." />
          <div className="flex gap-2">
            <button disabled={isSubmittingProduct} className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50">
              <Save className="w-4 h-4" />
              {isSubmittingProduct ? 'Đang lưu...' : editingProductId ? 'Lưu thay đổi' : 'Gửi duyệt'}
            </button>
            {editingProductId && (
              <button type="button" onClick={resetProductForm} className="rounded-md border border-gray-300 px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50">
                Hủy
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 p-5">
          <h3 className="text-lg font-bold text-gray-900">Danh sách sản phẩm</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-left text-xs font-bold uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Sản phẩm</th>
                <th className="px-4 py-3">SKU / ID</th>
                <th className="px-4 py-3">Giá</th>
                <th className="px-4 py-3">Tồn kho</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {myProducts.map(product => (
                <tr key={product.id}>
                  <td className="px-4 py-3">
                    <div className="font-bold text-gray-900">{product.name}</div>
                    <div className="text-xs text-gray-500">{product.category}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{product.sku || 'N/A'}<br />{product.id.slice(0, 8)}</td>
                  <td className="px-4 py-3 font-bold text-red-600">{formatCurrency(product.price)}</td>
                  <td className="px-4 py-3">{product.stock ?? 0}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${product.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : product.status === 'pending' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>
                      {product.status === 'approved' ? 'Đã duyệt' : product.status === 'pending' ? 'Chờ duyệt' : 'Cần xử lý'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => startEditProduct(product)} className="rounded-md bg-gray-100 p-2 text-gray-600 hover:bg-gray-200" aria-label="Sửa sản phẩm">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteProduct(product.id)} className="rounded-md bg-red-50 p-2 text-red-600 hover:bg-red-100" aria-label="Xóa sản phẩm">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {myProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-500">Chưa có sản phẩm nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );

  const renderOrders = () => (
    <section className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="border-b border-gray-200 p-5">
        <h3 className="text-lg font-bold text-gray-900">Quản lý đơn hàng</h3>
      </div>
      <div className="divide-y divide-gray-100">
        {myOrders.map(order => {
          const product = products.find(item => item.id === order.productId);
          return (
            <div key={order.id} className="p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="font-bold text-gray-900">{product?.name || 'Sản phẩm'}</div>
                  <div className="text-sm text-gray-500">Mã đơn: <span className="font-mono">{order.id}</span></div>
                  <div className="text-sm text-gray-500">{order.customerName || 'Khách hàng'} • {order.customerPhone || 'Chưa có SĐT'}</div>
                </div>
                <div className="text-left md:text-right">
                  <div className="font-bold text-red-600">{formatCurrency(order.total)}</div>
                  <span className="mt-1 inline-block rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-700">{order.status}</span>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {order.status === 'pending' && <button onClick={() => updateOrderStatus(order.id, 'processing')} className="rounded-md bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700 hover:bg-blue-100">Xác nhận xử lý</button>}
                {order.status === 'processing' && <button onClick={() => updateOrderStatus(order.id, 'shipping')} className="rounded-md bg-purple-50 px-3 py-2 text-sm font-bold text-purple-700 hover:bg-purple-100">Bàn giao vận chuyển</button>}
                {order.status === 'shipping' && <button onClick={() => updateOrderStatus(order.id, 'delivered')} className="rounded-md bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700 hover:bg-emerald-100">Đã giao</button>}
              </div>
            </div>
          );
        })}
        {myOrders.length === 0 && <div className="p-10 text-center text-gray-500">Chưa có đơn hàng nào.</div>}
      </div>
    </section>
  );

  const renderFinance = () => (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">Tài chính</h3>
        <ExportReportButton />
      </div>
      <div className="grid grid-cols-2 gap-4 border-b border-gray-200 pb-4 text-center">
        <div><span className="block text-2xl font-bold text-green-600">₫12,500,000</span><span className="text-sm text-gray-500">Doanh thu tháng này</span></div>
        <div><span className="block text-2xl font-bold text-blue-600">₫3,200,000</span><span className="text-sm text-gray-500">Tiền đang giữ hộ</span></div>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4">
        <div className="rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-3"><Wallet className="h-6 w-6 text-blue-600" /></div>
              <div>
                <p className="font-medium">Ví ACF</p>
                <p className="text-sm text-gray-500">₫2,450,000</p>
              </div>
            </div>
            <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">Rút tiền</button>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-3"><Banknote className="h-6 w-6 text-green-600" /></div>
              <div>
                <p className="font-medium">Ngân hàng</p>
                <p className="text-sm text-gray-500">₫10,050,000</p>
              </div>
            </div>
            <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">Chuyển khoản</button>
          </div>
        </div>
      </div>
      <div className="mt-6">
        <h4 className="mb-3 font-bold text-gray-900">Lịch sử giao dịch</h4>
        <div className="space-y-3">
          {financialHistory.map(item => (
            <div key={item.id} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
              <div className="flex items-center gap-3">
                <div className={`rounded-lg p-2 ${item.type === 'deposit' ? 'bg-green-100' : item.type === 'withdrawal' ? 'bg-red-100' : 'bg-blue-100'}`}>
                  {item.type === 'deposit' ? <ArrowDown className="h-5 w-5 text-green-600" /> : item.type === 'withdrawal' ? <ArrowUp className="h-5 w-5 text-red-600" /> : <Wallet className="h-5 w-5 text-blue-600" />}
                </div>
                <div>
                  <p className="font-medium">{item.description}</p>
                  <p className="text-xs text-gray-500">{item.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-medium ${item.type === 'deposit' ? 'text-green-600' : item.type === 'withdrawal' ? 'text-red-600' : 'text-blue-600'}`}>{item.amount}</p>
                <p className="text-xs text-gray-500">{item.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMarketing = () => (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">Kênh tăng trưởng</h3>
        <ExportReportButton />
      </div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="rounded-lg border border-gray-200 p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="rounded-lg bg-red-100 p-2"><Share2 className="h-5 w-5 text-red-600" /></div>
            <h4 className="font-bold text-gray-900">Chia sẻ giới thiệu</h4>
          </div>
          <p className="mb-4 text-sm text-gray-600">Giới thiệu người bán và nhận hoa hồng lên đến 500,000đ mỗi khách hàng</p>
          <div className="flex gap-2">
            <input className="flex-1 rounded-md border border-gray-300 px-3 py-2" value={`https://acf.vn/ref/${user?.uid || 'shopId'}`} readOnly />
            <button className="rounded-md bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700">Sao chép</button>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="rounded-lg bg-blue-100 p-2"><Percent className="h-5 w-5 text-blue-600" /></div>
            <h4 className="font-bold text-gray-900">Mã giảm giá</h4>
          </div>
          <p className="mb-4 text-sm text-gray-600">Tạo mã giảm giá để tăng doanh số và chăm sóc khách hàng</p>
          <button className="w-full rounded-md border border-dashed border-gray-300 p-5 text-center hover:border-solid hover:bg-gray-50">
            <Plus className="mx-auto h-5 w-5 text-gray-400" />
            <p className="mt-2 text-sm font-medium text-gray-500">Tạo chương trình khuyến mãi</p>
          </button>
        </div>
        <div className="rounded-lg border border-gray-200 p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="rounded-lg bg-green-100 p-2"><Award className="h-5 w-5 text-green-600" /></div>
            <h4 className="font-bold text-gray-900">Chương trình thành viên</h4>
          </div>
          <p className="mb-4 text-sm text-gray-600">Xây dựng loyalty program để giữ chân khách hàng</p>
          <button className="rounded-md bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-700">Thiết lập</button>
        </div>
        <div className="rounded-lg border border-gray-200 p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="rounded-lg bg-purple-100 p-2"><MessageCircle className="h-5 w-5 text-purple-600" /></div>
            <h4 className="font-bold text-gray-900">Tin nhắn tự động</h4>
          </div>
          <p className="mb-4 text-sm text-gray-600">Gửi tin nhắn cảm ơn, nhắc đơn hàng, đánh giá tự động</p>
          <button className="rounded-md bg-purple-600 px-4 py-2 text-sm font-bold text-white hover:bg-purple-700">Thiết lập</button>
        </div>
      </div>
    </div>
  );

  const renderCustomers = () => (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-red-600" /> Tin nhắn</h3>
        <div className="mt-4 space-y-3 text-sm">
          <div className="rounded-md bg-gray-50 p-3"><strong>Nguyễn Văn A</strong><br />Cần tư vấn nguồn gốc sản phẩm.</div>
          <div className="rounded-md bg-gray-50 p-3"><strong>Trần Minh B</strong><br />Hỏi thời gian giao hàng dự kiến.</div>
        </div>
      </section>
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Star className="w-5 h-5 text-red-600" /> Đánh giá</h3>
        <div className="mt-4 space-y-3 text-sm">
          <div className="rounded-md bg-gray-50 p-3"><strong>4.8/5</strong><br />Tỷ lệ phản hồi tích cực.</div>
          <div className="rounded-md bg-gray-50 p-3"><strong>96%</strong><br />Tin nhắn được phản hồi trong ngày.</div>
        </div>
      </section>
    </div>
  );

  const renderShipping = () => (
    <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Truck className="w-5 h-5 text-red-600" /> Thiết lập vận chuyển</h3>
      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
        {['GHN', 'GHTK', 'Viettel Post'].map((provider, index) => (
          <label key={provider} className="rounded-lg border border-gray-200 p-4">
            <input type="radio" name="shipping-provider" defaultChecked={index === 0} className="text-red-600 focus:ring-red-500" />
            <span className="ml-2 font-bold text-gray-900">{provider}</span>
            <div className="mt-2 text-sm text-gray-500">Phí ship tự động, hỗ trợ lấy hàng tại kho.</div>
          </label>
        ))}
      </div>
      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        <input className="rounded-md border border-gray-300 px-3 py-2" placeholder="Phí ship mặc định" />
        <input className="rounded-md border border-gray-300 px-3 py-2" placeholder="Địa chỉ kho lấy hàng" defaultValue={profileForm.warehouseAddress || ''} onChange={event => setProfileForm(current => ({ ...current, warehouseAddress: event.target.value }))} />
      </div>
    </section>
  );

  const renderSettings = () => (
    <form onSubmit={handleUpdateProfile} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Store className="w-5 h-5 text-red-600" /> Hồ sơ shop</h3>
      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        <input className="rounded-md border border-gray-300 px-3 py-2" value={profileForm.address || ''} onChange={event => setProfileForm(current => ({ ...current, address: event.target.value }))} placeholder="Địa chỉ kinh doanh" />
        <input className="rounded-md border border-gray-300 px-3 py-2" value={profileForm.contactPhone || ''} onChange={event => setProfileForm(current => ({ ...current, contactPhone: event.target.value }))} placeholder="Số điện thoại liên hệ" />
        <input className="rounded-md border border-gray-300 px-3 py-2" value={profileForm.legalDocuments || ''} onChange={event => setProfileForm(current => ({ ...current, legalDocuments: event.target.value }))} placeholder="Mã số thuế / ĐKKD" />
        <input className="rounded-md border border-gray-300 px-3 py-2" value={profileForm.bankName || ''} onChange={event => setProfileForm(current => ({ ...current, bankName: event.target.value }))} placeholder="Ngân hàng nhận tiền" />
        <input className="rounded-md border border-gray-300 px-3 py-2" value={profileForm.bankAccountName || ''} onChange={event => setProfileForm(current => ({ ...current, bankAccountName: event.target.value }))} placeholder="Chủ tài khoản" />
        <input className="rounded-md border border-gray-300 px-3 py-2" value={profileForm.bankAccountNumber || ''} onChange={event => setProfileForm(current => ({ ...current, bankAccountNumber: event.target.value }))} placeholder="Số tài khoản" />
        <input className="rounded-md border border-gray-300 px-3 py-2 md:col-span-2" placeholder="URL logo / banner shop" />
      </div>
      <div className="mt-5 flex items-center justify-between gap-4">
        <span className="text-sm text-gray-500 flex items-center gap-2"><Building className="w-4 h-4" /> Trạng thái hồ sơ: {shopProfile?.verificationStatus === 'verified' ? 'Đã duyệt' : 'Chờ kiểm tra'}</span>
        <button disabled={isSavingProfile} className="rounded-md bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50">
          {isSavingProfile ? 'Đang lưu...' : 'Lưu hồ sơ'}
        </button>
      </div>
    </form>
  );

  const renderTab = () => {
    if (activeTab === 'products') return renderProducts();
    if (activeTab === 'orders') return renderOrders();
    if (activeTab === 'finance') return renderFinance();
    if (activeTab === 'marketing') return renderMarketing();
    if (activeTab === 'customers') return renderCustomers();
    if (activeTab === 'shipping') return renderShipping();
    return renderSettings();
  };

  return (
    <main className="mx-auto max-w-7xl p-4 md:p-8">
      <div className="mb-6 flex flex-col gap-4 border-b border-gray-200 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-black uppercase text-red-700">Kênh Người Bán</h2>
          <p className="mt-1 text-sm text-gray-500">Quản lý vận hành shop, đơn hàng, tài chính và kênh tăng trưởng.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
          <div className="rounded-lg bg-white px-4 py-3 shadow-sm border border-gray-200"><strong>{metrics.approvedProducts}</strong><br /><span className="text-gray-500">Đang bán</span></div>
          <div className="rounded-lg bg-white px-4 py-3 shadow-sm border border-gray-200"><strong>{metrics.pendingProducts}</strong><br /><span className="text-gray-500">Chờ duyệt</span></div>
          <div className="rounded-lg bg-white px-4 py-3 shadow-sm border border-gray-200"><strong>{myOrders.length}</strong><br /><span className="text-gray-500">Đơn hàng</span></div>
          <div className="rounded-lg bg-white px-4 py-3 shadow-sm border border-gray-200"><strong>{metrics.lowStock}</strong><br /><span className="text-gray-500">Sắp hết</span></div>
        </div>
      </div>

      <div className="mb-6 overflow-x-auto">
        <div className="flex min-w-max gap-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-bold ${activeTab === tab.id ? 'bg-red-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {renderTab()}
    </main>
  );
}
