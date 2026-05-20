'use client';

import { useState } from 'react';
import { Search, Shield, Store, User, Users, Ban, CheckCircle } from 'lucide-react';

const users = [
  { id: 'u1', name: 'Nguyễn Văn An', email: 'nguyenvanan@gmail.com', phone: '0912 345 678', role: 'CUSTOMER', isActive: true, isVerified: true, joinedAt: '01/12/2024', orders: 23, spent: 8450000 },
  { id: 'u2', name: 'Trần Thị Bình', email: 'tranthibinh@gmail.com', phone: '0987 654 321', role: 'SELLER', isActive: true, isVerified: true, joinedAt: '15/11/2024', orders: 0, spent: 0 },
  { id: 'u3', name: 'Lê Hoàng Cường', email: 'lehoangcuong@gmail.com', phone: '0905 123 456', role: 'AFFILIATE', isActive: true, isVerified: false, joinedAt: '20/10/2024', orders: 12, spent: 3200000 },
  { id: 'u4', name: 'Phạm Thị Dung', email: 'phamthidung@gmail.com', phone: '0978 901 234', role: 'CUSTOMER', isActive: false, isVerified: true, joinedAt: '05/09/2024', orders: 45, spent: 15670000 },
  { id: 'u5', name: 'Hoàng Văn Em', email: 'hoangvanem@gmail.com', phone: '0933 567 890', role: 'CUSTOMER', isActive: true, isVerified: false, joinedAt: '10/08/2024', orders: 7, spent: 1890000 },
];

const roleMap: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  CUSTOMER: { label: 'Khách hàng', color: 'bg-blue-100 text-blue-700', icon: <User size={11} /> },
  SELLER: { label: 'Người bán', color: 'bg-orange-100 text-orange-700', icon: <Store size={11} /> },
  ADMIN: { label: 'Admin', color: 'bg-red-100 text-red-700', icon: <Shield size={11} /> },
  AFFILIATE: { label: 'Affiliate', color: 'bg-purple-100 text-purple-700', icon: <Users size={11} /> },
};

function formatVND(n: number) {
  if (n === 0) return '—';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const filtered = users.filter((u) => {
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Quản lý người dùng</h1>
          <p className="text-gray-500 text-sm mt-1">Tổng cộng {users.length} tài khoản đã đăng ký</p>
        </div>
        <div className="flex gap-2">
          {Object.entries(roleMap).map(([key, { label, color }]) => (
            <button
              key={key}
              onClick={() => setRoleFilter(roleFilter === key ? 'ALL' : key)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-all ${roleFilter === key ? color + ' border-current' : 'bg-gray-100 text-gray-600 border-transparent hover:bg-gray-200'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên, email..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E31937]/20 focus:border-[#E31937]"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Người dùng', 'Liên hệ', 'Vai trò', 'Đơn hàng', 'Chi tiêu', 'Trạng thái', 'Thao tác'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((u) => {
              const role = roleMap[u.role];
              return (
                <tr key={u.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-red-400 to-orange-400 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-bold">{u.name[0]}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{u.name}</p>
                        <p className="text-xs text-gray-400">Tham gia: {u.joinedAt}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-xs text-gray-700">{u.email}</p>
                    <p className="text-xs text-gray-400">{u.phone}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${role.color}`}>
                      {role.icon}{role.label}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-semibold">{u.orders}</td>
                  <td className="px-4 py-3.5 font-semibold text-[#E31937]">{formatVND(u.spent)}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${u.isActive ? 'bg-green-500' : 'bg-red-400'}`} />
                      <span className={`text-xs font-medium ${u.isActive ? 'text-green-700' : 'text-red-600'}`}>
                        {u.isActive ? 'Hoạt động' : 'Bị khóa'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex gap-1.5">
                      <button className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1.5 rounded-lg font-medium transition-colors">Chi tiết</button>
                      <button className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                        u.isActive ? 'bg-red-100 hover:bg-red-200 text-red-600' : 'bg-green-100 hover:bg-green-200 text-green-600'
                      }`}>
                        {u.isActive ? <Ban size={12} /> : <CheckCircle size={12} />}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
