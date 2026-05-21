'use client';
import { useState } from 'react';
import { Copy, Edit2, Plus, Trash2, Shield, Eye, EyeOff, Check } from 'lucide-react';

type ProfileTab = 'info' | 'address' | 'security' | 'affiliate';

const affiliateStats = [
  { label: 'Hoa hồng earned', value: '1.250.000đ', color: 'text-green-600' },
  { label: 'Tổng click', value: '342', color: 'text-blue-600' },
  { label: 'Đơn thành công', value: '18', color: 'text-purple-600' },
  { label: 'Tỷ lệ chuyển đổi', value: '5.3%', color: 'text-orange-600' },
];

const referredUsers = [
  { name: 'Trần Văn Bình', date: '15/05/2026', orders: 3, commission: 150000 },
  { name: 'Lê Thị Cúc', date: '10/05/2026', orders: 1, commission: 45000 },
  { name: 'Phạm Minh Đức', date: '05/05/2026', orders: 5, commission: 280000 },
  { name: 'Hoàng Thu Em', date: '01/05/2026', orders: 2, commission: 90000 },
];

export default function ProfilePage() {
  const [tab, setTab] = useState<ProfileTab>('info');
  const [copied, setCopied] = useState(false);
  const [showOldPwd, setShowOldPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);

  const refCode = 'ACF-TRI3T-2026';

  const copyRef = () => {
    navigator.clipboard?.writeText(refCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs: { key: ProfileTab; label: string }[] = [
    { key: 'info', label: 'Thông tin' },
    { key: 'address', label: 'Địa chỉ' },
    { key: 'security', label: 'Bảo mật' },
    { key: 'affiliate', label: 'Affiliate' },
  ];

  const inputClass = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500';

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="flex items-center gap-5 mb-8 bg-white border border-gray-200 rounded-2xl p-6">
        <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shrink-0">
          NA
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Nguyễn Văn An</h1>
          <p className="text-gray-500 text-sm">n.bi2993@gmail.com</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
              Khách hàng
            </span>
            <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
              <Shield className="w-3 h-3" />Đã xác minh
            </span>
          </div>
        </div>
        <button className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
          <Edit2 className="w-4 h-4" />Đổi ảnh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        {/* Tab: Thông tin */}
        {tab === 'info' && (
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Thông tin cá nhân</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Họ và tên</label>
                <input defaultValue="Nguyễn Văn An" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Email (không thể thay đổi)</label>
                <input value="n.bi2993@gmail.com" readOnly className={`${inputClass} bg-gray-50 text-gray-500 cursor-not-allowed`} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Số điện thoại</label>
                <input defaultValue="0901234567" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Ngày sinh</label>
                <input type="date" defaultValue="1993-05-21" className={inputClass} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Giới tính</label>
              <div className="flex gap-4">
                {['Nam', 'Nữ', 'Khác'].map(g => (
                  <label key={g} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="gender" defaultChecked={g === 'Nam'}
                      className="text-red-600 focus:ring-red-500" />
                    <span className="text-sm text-gray-700">{g}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="pt-2">
              <button className="px-6 py-2 bg-[#E31937] hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors">
                Lưu thay đổi
              </button>
            </div>
          </div>
        )}

        {/* Tab: Địa chỉ */}
        {tab === 'address' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-semibold text-gray-900">Địa chỉ của tôi</h2>
              <button className="flex items-center gap-1.5 text-sm text-[#E31937] hover:underline font-medium">
                <Plus className="w-4 h-4" />Thêm địa chỉ
              </button>
            </div>
            {[
              { id: 1, name: 'Nguyễn Văn An', phone: '0901234567', address: '123 Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh', isDefault: true },
              { id: 2, name: 'Nguyễn Văn An', phone: '0901234567', address: '456 Hoàng Diệu, Phường 10, Quận 10, TP. Hồ Chí Minh', isDefault: false },
            ].map(addr => (
              <div key={addr.id} className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-900">{addr.name}</span>
                      <span className="text-xs text-gray-400">| {addr.phone}</span>
                      {addr.isDefault && (
                        <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-medium">Mặc định</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{addr.address}</p>
                  </div>
                  <div className="flex gap-2 shrink-0 ml-4">
                    <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {!addr.isDefault && (
                      <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                {!addr.isDefault && (
                  <button className="mt-2 text-xs text-[#E31937] hover:underline">Đặt làm mặc định</button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Tab: Bảo mật */}
        {tab === 'security' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-4">Đổi mật khẩu</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Mật khẩu hiện tại</label>
                  <div className="relative">
                    <input type={showOldPwd ? 'text' : 'password'} placeholder="Nhập mật khẩu hiện tại..."
                      className={`${inputClass} pr-10`} />
                    <button onClick={() => setShowOldPwd(!showOldPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showOldPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Mật khẩu mới</label>
                  <div className="relative">
                    <input type={showNewPwd ? 'text' : 'password'} placeholder="Tối thiểu 8 ký tự..."
                      className={`${inputClass} pr-10`} />
                    <button onClick={() => setShowNewPwd(!showNewPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Xác nhận mật khẩu mới</label>
                  <input type="password" placeholder="Nhập lại mật khẩu mới..." className={inputClass} />
                </div>
                <button className="px-6 py-2 bg-[#E31937] hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors">
                  Cập nhật mật khẩu
                </button>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Xác thực 2 bước (2FA)</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Bảo vệ tài khoản với mã OTP qua SMS/email</p>
                </div>
                <button onClick={() => setTwoFAEnabled(!twoFAEnabled)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${twoFAEnabled ? 'bg-green-500' : 'bg-gray-200'}`}>
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${twoFAEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
              {twoFAEnabled && (
                <div className="mt-3 bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700">
                  ✓ Xác thực 2 bước đã được bật. Mã OTP sẽ được gửi qua SMS tới 0901234567.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: Affiliate */}
        {tab === 'affiliate' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-4">Chương trình Affiliate</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {affiliateStats.map(s => (
                  <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Referral link */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Mã giới thiệu của bạn</h3>
              <div className="flex gap-2">
                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 font-mono text-sm text-gray-800 font-medium">
                  {refCode}
                </div>
                <button onClick={copyRef}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    copied ? 'bg-green-500 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}>
                  {copied ? <><Check className="w-4 h-4" />Đã sao chép!</> : <><Copy className="w-4 h-4" />Sao chép</>}
                </button>
              </div>
              <div className="flex gap-2 mt-3">
                <button className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                  📘 Chia sẻ Facebook
                </button>
                <button className="flex-1 py-2 bg-blue-400 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors">
                  💬 Chia sẻ Zalo
                </button>
              </div>
            </div>

            {/* Referred users table */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Người được giới thiệu</h3>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-2.5">Tên</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-2.5">Ngày tham gia</th>
                      <th className="text-center text-xs font-medium text-gray-500 uppercase px-4 py-2.5">Đơn hàng</th>
                      <th className="text-right text-xs font-medium text-gray-500 uppercase px-4 py-2.5">Hoa hồng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {referredUsers.map(u => (
                      <tr key={u.name} className="hover:bg-gray-50">
                        <td className="px-4 py-2.5 font-medium text-gray-800">{u.name}</td>
                        <td className="px-4 py-2.5 text-gray-500">{u.date}</td>
                        <td className="px-4 py-2.5 text-center text-gray-700">{u.orders}</td>
                        <td className="px-4 py-2.5 text-right font-semibold text-green-600">+{u.commission.toLocaleString('vi-VN')}đ</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
