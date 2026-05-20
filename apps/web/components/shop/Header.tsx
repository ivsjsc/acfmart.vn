'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Search, QrCode, Heart, Bell, ShoppingCart, User, ChevronDown, LogOut, Settings, Package,
} from 'lucide-react';

// Header chính của Customer Marketplace
export function Header() {
  const [cartCount] = useState(3);
  const [notifCount] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      {/* Top bar */}
      <div className="bg-[#E31937] text-white text-xs py-1">
        <div className="container-acf flex justify-between items-center">
          <span>🛡️ Nền tảng chống hàng giả số 1 Việt Nam</span>
          <div className="flex gap-4">
            <Link href="/seller" className="hover:underline">Bán hàng cùng ACFMart</Link>
            <span>|</span>
            <Link href="/affiliate" className="hover:underline">Tiếp thị liên kết</Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container-acf py-3">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#E31937] rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-lg">A</span>
              </div>
              <div>
                <div className="font-black text-xl text-[#E31937] leading-none">ACFMart</div>
                <div className="text-[9px] text-gray-500 font-medium leading-none">Chống Hàng Giả Việt Nam</div>
              </div>
            </div>
          </Link>

          {/* Search bar */}
          <div className="flex-1 flex items-center border-2 border-[#E31937] rounded-lg overflow-hidden">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm sản phẩm chính hãng, shop, thương hiệu..."
              className="flex-1 px-4 py-2.5 text-sm outline-none"
              onKeyDown={(e) => e.key === 'Enter' && console.log('search:', searchQuery)}
            />
            <button className="bg-[#E31937] px-5 py-2.5 text-white hover:bg-red-700 transition-colors flex items-center gap-2">
              <Search size={18} />
              <span className="text-sm font-medium hidden sm:block">Tìm kiếm</span>
            </button>
          </div>

          {/* Action icons */}
          <div className="flex items-center gap-1">
            {/* QR Scan */}
            <Link href="/qr-verify" className="flex flex-col items-center p-2 hover:text-[#E31937] transition-colors text-gray-600">
              <QrCode size={22} />
              <span className="text-[10px] mt-0.5">QR Scan</span>
            </Link>

            {/* Yêu thích */}
            <Link href="/wishlist" className="flex flex-col items-center p-2 hover:text-[#E31937] transition-colors text-gray-600">
              <Heart size={22} />
              <span className="text-[10px] mt-0.5">Yêu thích</span>
            </Link>

            {/* Thông báo */}
            <button className="flex flex-col items-center p-2 hover:text-[#E31937] transition-colors text-gray-600 relative">
              <div className="relative">
                <Bell size={22} />
                {notifCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#E31937] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {notifCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5">Thông báo</span>
            </button>

            {/* Giỏ hàng */}
            <Link href="/cart" className="flex flex-col items-center p-2 hover:text-[#E31937] transition-colors text-gray-600 relative">
              <div className="relative">
                <ShoppingCart size={22} />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#E31937] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5">Giỏ hàng</span>
            </Link>

            {/* User dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex flex-col items-center p-2 hover:text-[#E31937] transition-colors text-gray-600"
              >
                <div className="flex items-center gap-1">
                  <User size={22} />
                  <ChevronDown size={14} />
                </div>
                <span className="text-[10px] mt-0.5">Tài khoản</span>
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1">
                  <Link href="/account" className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm">
                    <User size={16} className="text-gray-500" />Thông tin tài khoản
                  </Link>
                  <Link href="/account/orders" className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm">
                    <Package size={16} className="text-gray-500" />Đơn hàng của tôi
                  </Link>
                  <Link href="/account/settings" className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm">
                    <Settings size={16} className="text-gray-500" />Cài đặt
                  </Link>
                  <hr className="my-1" />
                  <button className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-sm text-red-600 w-full">
                    <LogOut size={16} />Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="border-t border-gray-100 bg-white">
        <div className="container-acf">
          <div className="flex items-center gap-6 overflow-x-auto py-2 text-sm font-medium text-gray-700">
            <Link href="/" className="hover:text-[#E31937] whitespace-nowrap transition-colors">Trang chủ</Link>
            <Link href="/products" className="hover:text-[#E31937] whitespace-nowrap transition-colors">Sản phẩm</Link>
            <Link href="/live" className="hover:text-[#E31937] whitespace-nowrap transition-colors flex items-center gap-1">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>Livestream
            </Link>
            <Link href="/affiliate" className="hover:text-[#E31937] whitespace-nowrap transition-colors">Affiliate</Link>
            <Link href="/qr-verify" className="hover:text-[#E31937] whitespace-nowrap transition-colors">Xác thực QR</Link>
            <Link href="/community" className="hover:text-[#E31937] whitespace-nowrap transition-colors">Cộng đồng</Link>
            <Link href="/aivy" className="hover:text-[#E31937] whitespace-nowrap transition-colors flex items-center gap-1">
              ✨ Alvy AI
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
