import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '../store';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { LanguageSwitcher } from './LanguageSwitcher';
import { AccountSettings } from './AccountSettings';
import { 
  Search, 
  ShoppingCart, 
  Bell, 
  User, 
  Package,
  Menu,
  Store,
  MessageCircle,
  Phone,
  LogIn,
  LogOut,
  Heart,
  MapPin,
  CreditCard,
  Settings,
  HelpCircle,
  Tag,
  X
} from 'lucide-react';
import ProfileDropdown from './ProfileDropdown';

export function Header() {
  const { user, logout, login, role, currentView, setCurrentView, isHeaderScrolled, setIsHeaderScrolled, switchRole } = useStore();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [showAccountSettings, setShowAccountSettings] = useState(false);

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsHeaderScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [setIsHeaderScrolled]);

  // Update CSS variable instead of directly changing body padding
  useEffect(() => {
    const navHeight = 48;
    document.documentElement.style.setProperty('--header-height', isHeaderScrolled ? `${navHeight}px` : '0px');
    return () => { document.documentElement.style.setProperty('--header-height', '0px'); };
  }, [isHeaderScrolled]);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
      setIsNotificationsOpen(false);
    }
    if (isMobileMenuOpen && !(event.target as Element).closest('.mobile-menu-container')) {
      setIsMobileMenuOpen(false);
    }
  }, [isMobileMenuOpen]);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setIsMobileMenuOpen(false);
      };
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isMobileMenuOpen]);

  return (
    <header className="z-20 sticky top-0" role="banner">
      {/* Top banner */}
      <div
        className={`bg-white transition-all duration-300 ease-in-out ${
          isHeaderScrolled ? 'opacity-0 -translate-y-full pointer-events-none h-0 overflow-hidden' : 'opacity-100 translate-y-0'
        }`}
        aria-hidden={isHeaderScrolled}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-center p-4">
          <a href="/" aria-label="Trang chủ - Trung tâm Kỹ thuật Chống hàng giả ACF">
            <img
              src="https://www.trungtamacf.vn/wp-content/uploads/2025/06/logo-Desktop-ACF-FN-2025.png"
              alt="Logo Trung tâm Kỹ thuật Chống hàng giả ACF"
              className="h-24 md:h-32 object-contain mx-auto"
            />
          </a>
        </div>
      </div>

      {/* Navigation bar */}
      <nav
        className={`bg-brand-red text-white transition-all duration-300 ease-in-out shadow-nav z-[60] ${
          isHeaderScrolled ? 'fixed top-0 left-0 right-0' : ''
        }`}
        aria-label="Điều hướng chính"
      >
        <div className="max-w-6xl mx-auto flex gap-2 md:gap-6 px-4 text-sm font-bold uppercase">
          <button
            onClick={() => navigate('/about')}
            className="py-3 px-2 hover:bg-brand-gold hover:text-white transition-colors flex items-center outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-brand-red min-h-touch"
          >
            Giới thiệu
          </button>
          <button
            onClick={() => navigate('/')}
            className="py-3 px-2 hover:bg-brand-gold hover:text-white transition-colors flex items-center outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-brand-red min-h-touch"
          >
            Trưng bày
          </button>
          <button
            onClick={() => navigate('/contact')}
            className="py-3 px-2 hover:bg-brand-gold hover:text-white transition-colors flex items-center outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-brand-red min-h-touch"
          >
            Liên hệ
          </button>
          
          {/* Auth section */}
          <div className="flex items-center gap-2 ml-auto">
            {user ? (
              <ProfileDropdown 
                user={user} 
                role={role} 
                onLogout={logout} 
                navigate={navigate} 
              />
            ) : (
              <>
                <button
                  onClick={login}
                  className="bg-red-700 hover:bg-red-800 text-white text-xs font-bold uppercase tracking-wider px-3 py-2 rounded flex items-center transition-colors shadow-md min-h-touch focus:outline-none focus:ring-2 focus:ring-white"
                  aria-label="Đăng nhập tài khoản"
                >
                  <LogIn className="w-4 h-4 mr-1" aria-hidden="true" /> Đăng nhập
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider px-3 py-2 rounded flex items-center transition-colors shadow-md min-h-touch focus:outline-none focus:ring-2 focus:ring-white"
                  aria-label="Đăng ký tài khoản mới"
                >
                  <User className="w-4 h-4 mr-1" aria-hidden="true" /> Đăng ký
                </button>
              </>
            )}
            {user && role !== 'shop_manager' && role !== 'shop_staff' && role !== 'admin' && role !== 'super_admin' && (
              <button
                onClick={() => navigate('/become-seller')}
                className="bg-brand-gold hover:bg-brand-gold-600 text-black text-xs font-bold uppercase tracking-wider px-3 py-2 rounded flex items-center transition-colors shadow-md ml-2 min-h-touch focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Đăng ký trở thành người bán hàng"
              >
                <Store className="w-4 h-4 mr-1" aria-hidden="true" /> Trở thành người bán
              </button>
            )}
          </div>
          
          <LanguageSwitcher />
        </div>
      </nav>

      {/* User menu bar */}
      {user && (
        <div
          className={`bg-brand-navy text-white shadow-md z-[50] transition-all duration-300 ${
            isHeaderScrolled ? 'fixed top-12 left-0 right-0' : ''
          }`}
          role="toolbar"
          aria-label="Menu người dùng"
        >
          <div className="flex items-center justify-between px-4 py-3 max-w-6xl mx-auto">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 hover:bg-brand-navy-800 rounded-lg transition-colors min-h-touch min-w-touch flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-brand-gold"
                aria-expanded={isMobileMenuOpen}
                aria-controls="user-expanded-menu"
                aria-label={isMobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" aria-hidden="true" />
                ) : (
                  <Menu className="w-5 h-5" aria-hidden="true" />
                )}
              </button>
              <span className="text-brand-gold font-bold uppercase text-xs tracking-wider">
                Menu người dùng
              </span>
            </div>
            
            {/* Quick actions */}
            <div className="flex items-center gap-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const input = e.currentTarget.querySelector('input');
                  if (input?.value) navigate(`/search?q=${encodeURIComponent(input.value)}`);
                }}
                role="search"
                aria-label="Tìm kiếm nhanh"
              >
                <div className="relative">
                  <label htmlFor="quick-search" className="sr-only">Tìm kiếm sản phẩm</label>
                  <input
                    id="quick-search"
                    type="search"
                    placeholder="Tìm kiếm nhanh..."
                    className="bg-brand-navy-800 text-white placeholder-gray-400 px-3 py-1.5 pr-8 rounded-lg text-sm w-32 md:w-48 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                  />
                  <button type="submit" className="absolute right-2 top-1.5" aria-label="Tìm kiếm">
                    <Search className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
                  </button>
                </div>
              </form>
              
              <div ref={notificationsRef} className="relative">
                <button 
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="relative p-2 bg-brand-navy-800 hover:bg-brand-navy-700 rounded-lg transition-colors min-h-touch min-w-touch flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-brand-gold"
                  aria-expanded={isNotificationsOpen}
                  aria-label="Thông báo (3 chưa đọc)"
                >
                  <Bell className="w-4 h-4 text-white" aria-hidden="true" />
                  <span className="absolute -top-1 -right-1 bg-brand-red text-white text-xs w-4 h-4 flex items-center justify-center rounded-full" aria-hidden="true">3</span>
                </button>

                {isNotificationsOpen && (
                  <div
                    className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 animate-slide-down"
                    role="dialog"
                    aria-label="Thông báo"
                  >
                    <div className="p-4 border-b border-gray-100">
                      <h3 className="font-bold text-gray-900">Thông báo</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      <div className="p-4 hover:bg-gray-50 border-b border-gray-50">
                        <p className="text-sm font-medium text-gray-900">Sản phẩm mới</p>
                        <p className="text-sm text-gray-600">iPhone 15 Pro Max đã có sẵn</p>
                        <p className="text-xs text-gray-400 mt-1">2 phút trước</p>
                      </div>
                      <div className="p-4 hover:bg-gray-50 border-b border-gray-50">
                        <p className="text-sm font-medium text-gray-900">Đơn hàng thành công</p>
                        <p className="text-sm text-gray-600">Đơn hàng #12345 đã được xác nhận</p>
                        <p className="text-xs text-gray-400 mt-1">1 giờ trước</p>
                      </div>
                      <div className="p-4 hover:bg-gray-50">
                        <p className="text-sm font-medium text-gray-900">Sản phẩm sắp hết</p>
                        <p className="text-sm text-gray-600">Sản phẩm bạn quan tâm sắp hết hàng</p>
                        <p className="text-xs text-gray-400 mt-1">3 giờ trước</p>
                      </div>
                    </div>
                    <div className="p-3 border-t border-gray-100 text-center">
                      <button
                        onClick={() => setIsNotificationsOpen(false)}
                        className="text-sm text-brand-red hover:text-brand-red-700 font-medium"
                      >
                        Đánh dấu tất cả đã đọc
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <button 
                onClick={() => setShowAccountSettings(true)}
                className="p-2 bg-brand-navy-800 hover:bg-brand-navy-700 rounded-lg transition-colors min-h-touch min-w-touch flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-brand-gold"
                aria-label="Cài đặt tài khoản"
              >
              <User className="w-4 h-4 text-white" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Expanded menu */}
        {isMobileMenuOpen && (
          <div
            id="user-expanded-menu"
            className="border-t border-brand-navy-800 animate-slide-down mobile-menu-container"
            role="menu"
            aria-label="Menu mở rộng"
          >
            <div className="px-4 py-4 max-w-6xl mx-auto">
              
              {/* Quick Links */}
              <div className="mb-4">
                <h3 className="text-brand-gold text-xs font-bold uppercase mb-3">Truy cập nhanh</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <QuickLink icon={Package} label="Quản lý đơn hàng" onClick={() => { navigate('/orders'); setIsMobileMenuOpen(false); }} />
                  <QuickLink icon={ShoppingCart} label="Giỏ hàng" onClick={() => { navigate('/cart'); setIsMobileMenuOpen(false); }} />
                  <QuickLink icon={Heart} label="Sản phẩm yêu thích" onClick={() => { setIsMobileMenuOpen(false); }} />
                  <QuickLink icon={Store} label="Cửa hàng của tôi" onClick={() => { navigate('/shop-owner'); setIsMobileMenuOpen(false); }} />
                  <QuickLink icon={MessageCircle} label="Tin nhắn" onClick={() => { setIsMobileMenuOpen(false); }} />
                  <QuickLink icon={Tag} label="Khuyến mãi" onClick={() => { setIsMobileMenuOpen(false); }} />
                </div>
              </div>

              {/* Account Management */}
              <div className="mb-4">
                <h3 className="text-brand-gold text-xs font-bold uppercase mb-3">Quản lý tài khoản</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <QuickLink icon={User} label="Thông tin cá nhân" onClick={() => { navigate('/profile'); setIsMobileMenuOpen(false); }} />
                  <QuickLink icon={MapPin} label="Địa chỉ giao hàng" onClick={() => { setIsMobileMenuOpen(false); }} />
                  <QuickLink icon={CreditCard} label="Thanh toán" onClick={() => { setIsMobileMenuOpen(false); }} />
                  <QuickLink icon={Settings} label="Cài đặt thông báo" onClick={() => { setIsMobileMenuOpen(false); }} />
                </div>
              </div>

              {/* Help */}
              <div>
                <h3 className="text-brand-gold text-xs font-bold uppercase mb-3">Hỗ trợ</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <QuickLink icon={HelpCircle} label="Trung tâm trợ giúp" onClick={() => { setIsMobileMenuOpen(false); }} />
                  <QuickLink icon={Phone} label="Liên hệ hỗ trợ" onClick={() => { navigate('/contact'); setIsMobileMenuOpen(false); }} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )}
    {/* Account Settings Modal */}
    {showAccountSettings && (
      <AccountSettings onClose={() => setShowAccountSettings(false)} />
    )}
    </header>
  );
}

function QuickLink({ icon: Icon, label, onClick }: { icon: React.ElementType; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="bg-brand-navy-800 hover:bg-brand-navy-700 px-3 py-2.5 rounded-lg text-sm transition-colors flex flex-col items-center justify-center min-h-touch focus:outline-none focus:ring-2 focus:ring-brand-gold"
      role="menuitem"
      aria-label={label}
    >
      <Icon className="w-5 h-5 mb-1.5" aria-hidden="true" />
      <span className="text-xs">{label}</span>
    </button>
  );
}