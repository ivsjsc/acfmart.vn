'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Package, Users, Store, Tag,
  BarChart2, Settings, ChevronRight, Bell, LogOut, Shield,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Duyệt Sản phẩm', href: '/admin/products', icon: Package, badge: 12 },
  { label: 'Quản lý User', href: '/admin/users', icon: Users },
  { label: 'Quản lý Seller', href: '/admin/sellers', icon: Store },
  { label: 'Danh mục & Thương hiệu', href: '/admin/categories', icon: Tag },
  { label: 'Báo cáo & Thống kê', href: '/admin/reports', icon: BarChart2 },
  { label: 'Cài đặt hệ thống', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar — dark */}
      <aside className="w-64 bg-gray-900 flex flex-col fixed top-0 left-0 h-full z-40">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-700/50">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#E31937] rounded-xl flex items-center justify-center shadow-lg">
              <Shield size={18} className="text-white" />
            </div>
            <div>
              <div className="font-black text-base text-white leading-none">ACFMart</div>
              <div className="text-[10px] text-gray-400 leading-none mt-0.5">Admin Console</div>
            </div>
          </Link>
        </div>

        {/* Admin badge */}
        <div className="mx-4 mt-4 mb-2 bg-red-900/30 border border-red-800/40 rounded-xl px-3 py-2.5 flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#E31937] rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-black">SA</span>
          </div>
          <div>
            <p className="text-xs font-bold text-white">Super Admin</p>
            <p className="text-[10px] text-gray-400">admin@acfmart.vn</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                  active
                    ? 'bg-[#fee2e2] text-[#E31937]'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon size={16} className={active ? 'text-[#E31937]' : 'text-gray-500 group-hover:text-white'} />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="bg-[#E31937] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
                {active && <ChevronRight size={14} className="text-[#E31937]" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-gray-700/50 space-y-1">
          <Link href="/" className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors">
            ← Về trang chủ
          </Link>
          <button className="flex items-center gap-2 text-xs text-gray-500 hover:text-red-400 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors w-full">
            <LogOut size={14} /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Top header */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div>
            <h1 className="font-bold text-gray-900 text-sm">
              {navItems.find((n) => pathname.startsWith(n.href))?.label ?? 'Admin Console'}
            </h1>
            <p className="text-xs text-gray-400">ACFMart Admin · {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Bell size={18} />
              <span className="absolute top-1 right-1 bg-[#E31937] w-3.5 h-3.5 rounded-full text-[8px] text-white flex items-center justify-center font-bold">7</span>
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
              <div className="w-8 h-8 bg-[#E31937] rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-black">SA</span>
              </div>
              <span className="text-sm font-semibold text-gray-800">Super Admin</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
