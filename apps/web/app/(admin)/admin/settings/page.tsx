'use client';
import { useState } from 'react';
import { Save, Lock } from 'lucide-react';

type SettingsTab = 'general' | 'payment' | 'escrow' | 'commission' | 'email' | 'security';

const TAB_LIST: { key: SettingsTab; label: string; icon?: string }[] = [
  { key: 'general', label: 'Chung' },
  { key: 'payment', label: 'Thanh toán' },
  { key: 'escrow', label: '🔒 Escrow', icon: '🔒' },
  { key: 'commission', label: 'Hoa hồng' },
  { key: 'email', label: 'Email / SMTP' },
  { key: 'security', label: 'Bảo mật' },
];

const inputClass = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500';

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange}
      className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${checked ? 'bg-green-500' : 'bg-gray-200'}`}>
      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-0.5'}`} />
    </button>
  );
}

export default function AdminSettingsPage() {
  const [tab, setTab] = useState<SettingsTab>('general');

  // General
  const [platformName, setPlatformName] = useState('ACFMart');
  const [slogan, setSlogan] = useState('Mua sắm chính hãng, an toàn tuyệt đối');
  const [contact, setContact] = useState('support@acfmart.vn');
  const [logoUrl, setLogoUrl] = useState('');

  // Payment toggles
  const [payments, setPayments] = useState({
    cod: { enabled: true, fee: '0' },
    bank: { enabled: true, fee: '0' },
    momo: { enabled: true, fee: '0' },
    zalopay: { enabled: true, fee: '0' },
    card: { enabled: false, fee: '1.5' },
  });

  // Escrow
  const [escrowEnabled, setEscrowEnabled] = useState(true);
  const [autoReleaseDays, setAutoReleaseDays] = useState('7');
  const [disputeWindow, setDisputeWindow] = useState('3');
  const [escrowMin, setEscrowMin] = useState('50000');
  const [escrowBank, setEscrowBank] = useState('Vietcombank');
  const [escrowAccount, setEscrowAccount] = useState('1234567890');

  // Commission
  const [platformFee, setPlatformFee] = useState('5');
  const [affiliateFee, setAffiliateFee] = useState('2');
  const [tiers, setTiers] = useState([
    { label: 'Điện tử', fee: '3' },
    { label: 'Thời trang', fee: '5' },
    { label: 'Làm đẹp', fee: '6' },
    { label: 'Nhà cửa', fee: '4' },
  ]);

  // Email
  const [smtp, setSmtp] = useState({ host: 'smtp.gmail.com', port: '587', user: 'no-reply@acfmart.vn', password: '' });

  // Security
  const [require2FA, setRequire2FA] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('60');
  const [maxLoginAttempts, setMaxLoginAttempts] = useState('5');

  const SaveButton = () => (
    <button className="flex items-center gap-2 px-6 py-2.5 bg-[#E31937] hover:bg-red-700 text-white rounded-xl font-medium text-sm transition-colors mt-6">
      <Save className="w-4 h-4" />
      Lưu cài đặt
    </button>
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Cài đặt nền tảng</h1>
        <p className="text-gray-500 text-sm mt-1">Cấu hình các thông số hoạt động của ACFMart</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className="w-48 shrink-0">
          <nav className="space-y-1">
            {TAB_LIST.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  tab === t.key
                    ? 'bg-[#E31937] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}>
                {t.key === 'escrow' ? (
                  <span className="flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5" />Escrow
                  </span>
                ) : t.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 bg-white border border-gray-200 rounded-2xl p-6">
          {/* General */}
          {tab === 'general' && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin chung</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên nền tảng</label>
                  <input value={platformName} onChange={e => setPlatformName(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email liên hệ</label>
                  <input value={contact} onChange={e => setContact(e.target.value)} className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slogan</label>
                <input value={slogan} onChange={e => setSlogan(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL Logo</label>
                <input value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="https://acfmart.vn/logo.png" className={inputClass} />
              </div>
              <SaveButton />
            </div>
          )}

          {/* Payment */}
          {tab === 'payment' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Phương thức thanh toán</h2>
              {Object.entries(payments).map(([key, val]) => {
                const labels: Record<string, string> = { cod: 'COD', bank: 'Chuyển khoản ngân hàng', momo: 'Ví MoMo', zalopay: 'ZaloPay', card: 'Thẻ tín dụng' };
                const icons: Record<string, string> = { cod: '💵', bank: '🏦', momo: '💜', zalopay: '🔵', card: '💳' };
                return (
                  <div key={key} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{icons[key]}</span>
                      <span className="text-sm font-medium text-gray-800">{labels[key]}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-500">Phí (%):</label>
                        <input
                          value={val.fee}
                          onChange={e => setPayments(p => ({ ...p, [key]: { ...p[key as keyof typeof p], fee: e.target.value } }))}
                          type="number" step="0.1"
                          className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                      <Toggle
                        checked={val.enabled}
                        onChange={() => setPayments(p => ({ ...p, [key]: { ...p[key as keyof typeof p], enabled: !p[key as keyof typeof p].enabled } }))}
                      />
                    </div>
                  </div>
                );
              })}
              <SaveButton />
            </div>
          )}

          {/* Escrow */}
          {tab === 'escrow' && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <Lock className="w-6 h-6 text-blue-700" />
                <h2 className="text-lg font-semibold text-blue-900">Cài đặt Escrow</h2>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
                Hệ thống Escrow giữ tiền thanh toán của khách hàng cho đến khi người mua xác nhận nhận hàng thành công. Đây là tính năng cốt lõi bảo vệ cả người mua và người bán trên ACFMart.
              </div>

              {/* Master toggle */}
              <div className="flex items-center justify-between p-4 border-2 border-blue-200 bg-blue-50 rounded-xl">
                <div>
                  <p className="text-sm font-semibold text-blue-900">Bật hệ thống Escrow</p>
                  <p className="text-xs text-blue-600">Tắt sẽ chuyển thanh toán trực tiếp — không khuyến khích</p>
                </div>
                <Toggle checked={escrowEnabled} onChange={() => setEscrowEnabled(!escrowEnabled)} />
              </div>

              <div className={`space-y-4 ${!escrowEnabled ? 'opacity-40 pointer-events-none' : ''}`}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Thời gian tự động release (ngày) <span className="text-red-500">*</span>
                    </label>
                    <input type="number" value={autoReleaseDays} onChange={e => setAutoReleaseDays(e.target.value)}
                      min="1" max="30" className={inputClass} />
                    <p className="text-xs text-gray-400 mt-1">Mặc định: 7 ngày sau khi giao hàng</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Thời gian dispute window (ngày)
                    </label>
                    <input type="number" value={disputeWindow} onChange={e => setDisputeWindow(e.target.value)}
                      min="1" max="14" className={inputClass} />
                    <p className="text-xs text-gray-400 mt-1">Người mua có X ngày để khiếu nại</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngưỡng Escrow tối thiểu (VND)
                  </label>
                  <div className="relative">
                    <input type="number" value={escrowMin} onChange={e => setEscrowMin(e.target.value)}
                      className={`${inputClass} pr-8`} />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">đ</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Đơn dưới ngưỡng này không cần escrow</p>
                </div>

                <div className="border border-gray-200 rounded-xl p-4 space-y-3">
                  <p className="text-sm font-semibold text-gray-700">Tài khoản escrow</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Ngân hàng</label>
                      <select value={escrowBank} onChange={e => setEscrowBank(e.target.value)} className={inputClass}>
                        {['Vietcombank', 'Techcombank', 'MB Bank', 'BIDV', 'Agribank'].map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Số tài khoản</label>
                      <input value={escrowAccount} onChange={e => setEscrowAccount(e.target.value)} className={inputClass} />
                    </div>
                  </div>
                </div>
              </div>
              <SaveButton />
            </div>
          )}

          {/* Commission */}
          {tab === 'commission' && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Cài đặt hoa hồng</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hoa hồng nền tảng mặc định (%)</label>
                  <input type="number" value={platformFee} onChange={e => setPlatformFee(e.target.value)}
                    step="0.1" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hoa hồng Affiliate (%)</label>
                  <input type="number" value={affiliateFee} onChange={e => setAffiliateFee(e.target.value)}
                    step="0.1" className={inputClass} />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Phí theo danh mục</h3>
                <div className="space-y-2">
                  {tiers.map((tier, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl">
                      <span className="text-sm font-medium text-gray-800 w-32">{tier.label}</span>
                      <div className="relative flex-1 max-w-[100px]">
                        <input
                          type="number" value={tier.fee} step="0.5"
                          onChange={e => setTiers(prev => prev.map((t, j) => j === i ? { ...t, fee: e.target.value } : t))}
                          className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm pr-8 focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <SaveButton />
            </div>
          )}

          {/* Email */}
          {tab === 'email' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Cấu hình Email / SMTP</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Host</label>
                  <input value={smtp.host} onChange={e => setSmtp(s => ({ ...s, host: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
                  <input value={smtp.port} onChange={e => setSmtp(s => ({ ...s, port: e.target.value }))} className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email người gửi</label>
                <input value={smtp.user} onChange={e => setSmtp(s => ({ ...s, user: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">App Password</label>
                <input type="password" value={smtp.password} onChange={e => setSmtp(s => ({ ...s, password: e.target.value }))}
                  placeholder="••••••••••••••••" className={inputClass} />
              </div>
              <button className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-lg text-sm font-medium transition-colors">
                Gửi email test
              </button>
              <SaveButton />
            </div>
          )}

          {/* Security */}
          {tab === 'security' && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Cài đặt bảo mật</h2>
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-gray-800">Bắt buộc 2FA cho Sellers</p>
                  <p className="text-xs text-gray-500">Tất cả sellers phải bật xác thực 2 bước</p>
                </div>
                <Toggle checked={require2FA} onChange={() => setRequire2FA(!require2FA)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Timeout phiên đăng nhập (phút)
                </label>
                <input type="number" value={sessionTimeout} onChange={e => setSessionTimeout(e.target.value)}
                  className={`${inputClass} max-w-[150px]`} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số lần đăng nhập sai tối đa
                </label>
                <input type="number" value={maxLoginAttempts} onChange={e => setMaxLoginAttempts(e.target.value)}
                  className={`${inputClass} max-w-[150px]`} />
                <p className="text-xs text-gray-400 mt-1">Sau số lần này, tài khoản sẽ bị khóa tạm thời</p>
              </div>
              <SaveButton />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
