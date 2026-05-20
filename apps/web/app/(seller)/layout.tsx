'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Package, ShoppingBag, BarChart2, Warehouse,
  CreditCard, Settings, ChevronRight, Bell, User, Store,
} from 'lucide-react';

const navItems = [
  { label: 'Tổng quan', href: '/seller/dashboard', icon: LayoutDashboard },
  { label: 'Sản phẩm', href: '/seller/products', icon: Package },
  { label: 'Đơn hàng', href: '/seller/orders', icon: ShoppingBag },
  { label: 'Phân tích', href: '/seller/analytics', icon: BarChart2 },
  { label: 'Kho hàng', href: '/seller/inventory', icon: Warehouse },
  { label: 'Tài chính', href: '/seller/finance', icon: CreditCard },
  { label: 'Cài đặt Shop', href: '/seller/settings', icon: Settings },
];

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col fixed top-0 left-0 h-full z-40">
        {/* Logo */}
        <div className="px-4 py-4 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#E31937] rounded-lg flex items-center justify-center">
              <span className="text-white font-black">A</span>
            </div>
            <div>
              <div className="font-black text-sm text-[#E31937] leading-none">ACFMart</div>
              <div className="text-[9px] text-gray-400 leading-none">Seller Portal</div>
            </div>
          </Link>
        </div>

        {/* Shop info */}
        <div className="px-4 py-3 bg-red-50 mx-3 mt-3 rounded-xl">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-[#E31937] rounded-full flex items-center justify-center">
              <Store size={16} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900">IVS Shop</p>
              <p className="text-[10px] text-[#E31937] font-medium">Seller Pro ⭐</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'bg-[#E31937] text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon size={16} />
                <span className="flex-1">{item.label}</span>
                {active && <ChevronRight size={14} />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-gray-100">
          <Link href="/" className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 px-3 py-2">
            ← Về trang mua sắm
          </Link>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 ml-60 flex flex-col">
        {/* Top header */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-30">
          <h1 className="font-semibold text-gray-900 text-sm">Seller Dashboard</h1>
          <div className="flex items-center gap-3">
            <button className="relative text-gray-500 hover:text-gray-700">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 bg-[#E31937] w-4 h-4 rounded-full text-[9px] text-white flex items-center justify-center font-bold">3</span>
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <User size={14} className="text-[#E31937]" />
              </div>
              <span className="text-sm font-medium text-gray-700">IVS Shop</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
