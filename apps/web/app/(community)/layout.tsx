'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Home, Target, Smile, Link2, Compass, Wrench, ChevronRight, Users } from 'lucide-react';

const navSections = [
  {
    title: '',
    items: [
      { label: 'Trang chủ', href: '/community', icon: Home },
    ],
  },
  {
    title: 'Danh mục',
    items: [
      { label: 'Affiliate', href: '/community/affiliate', icon: Target, color: 'text-blue-500', count: '2.3k' },
      { label: 'Giải trí', href: '/community/entertainment', icon: Smile, color: 'text-orange-500', count: '5.1k' },
      { label: 'Liên kết', href: '/community/links', icon: Link2, color: 'text-purple-500', count: '1.8k' },
    ],
  },
  {
    title: 'Khám phá',
    items: [
      { label: 'Nổi bật', href: '/community/trending', icon: Compass },
      { label: 'Thành viên mới', href: '/community/new-members', icon: Users },
    ],
  },
  {
    title: 'Công cụ',
    items: [
      { label: 'Tạo liên kết Affiliate', href: '/affiliate', icon: Wrench },
    ],
  },
];

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="container-acf flex items-center justify-between py-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#E31937] rounded-lg flex items-center justify-center">
              <span className="text-white font-black">A</span>
            </div>
            <span className="font-black text-[#E31937]">ACFMart</span>
            <span className="text-gray-300">|</span>
            <span className="font-bold text-purple-700 text-sm">Community</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/community/new-post" className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
              + Đăng bài
            </Link>
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-700 text-xs font-bold">U</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container-acf py-5 flex gap-6">
        {/* Left sidebar */}
        <aside className="w-56 flex-shrink-0 hidden lg:block">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-20">
            {navSections.map((section, si) => (
              <div key={si} className={si > 0 ? 'border-t border-gray-100' : ''}>
                {section.title && (
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 pt-3 pb-1">
                    {section.title}
                  </p>
                )}
                <nav className="py-1 px-2">
                  {section.items.map((item) => {
                    const active = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                          active ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        <Icon size={15} className={'color' in item ? item.color as string : active ? 'text-purple-600' : 'text-gray-400'} />
                        <span className="flex-1">{item.label}</span>
                        {'count' in item && item.count && (
                          <span className="text-[10px] text-gray-400 font-medium">{item.count}</span>
                        )}
                        {active && <ChevronRight size={12} className="text-purple-500" />}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            ))}

            {/* Alvy AI widget */}
            <div className="m-3 mt-2 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl p-3 text-white">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full overflow-hidden">
                  <Image 
                    src="/aivy-ai/android-chrome-192x192.png" 
                    alt="Aivy AI Logo"
                    width={28}
                    height={28}
                    className="object-cover"
                  />
                </div>
                <span className="font-bold text-sm">Alvy AI</span>
              </div>
              <p className="text-[11px] text-purple-100 mb-2.5 leading-snug">
                Trợ lý AI thông minh hỗ trợ bạn tạo nội dung và chiến lược affiliate.
              </p>
              <Link href="/aivy" className="block w-full text-center bg-white text-purple-700 text-xs font-bold py-1.5 rounded-lg hover:bg-purple-50 transition-colors">
                Trò chuyện ngay ✨
              </Link>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
