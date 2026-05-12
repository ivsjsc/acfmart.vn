import React, { useState, useRef, useEffect } from 'react';
import { User, Settings, Package, LogOut, ChevronDown, Store, CheckCircle, Home } from 'lucide-react';

interface ProfileDropdownProps {
  user: any;
  role?: string;
  onLogout: () => void;
  navigate: (path: string) => void;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ user, role, onLogout, navigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMenuClick = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleLogout = () => {
    onLogout();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
      >
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
        <div className="text-left">
          <div className="text-sm font-medium text-gray-900">
            {user.email?.split('@')[0] || 'User'}
          </div>
          {role && (
            <div className="text-xs text-gray-500 capitalize">
              {role === 'admin' ? 'Quản trị viên' :
               role === 'moderator' ? 'Đối tác' :
               role === 'shop' ? 'Người bán' :
               role === 'carrier' ? 'Người giao hàng' :
               role === 'customer' ? 'Khách hàng' : role}
            </div>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  {user.email?.split('@')[0] || 'User'}
                </div>
                <div className="text-sm text-gray-500">{user.email}</div>
                {role && (
                  <div className="text-xs text-blue-600 font-medium capitalize">
                    {role === 'admin' ? 'Quản trị viên' :
                     role === 'moderator' ? 'Đối tác kiểm duyệt' :
                     role === 'shop' ? 'Người bán hàng' :
                     role === 'carrier' ? 'Đối tác vận chuyển' :
                     role === 'customer' ? 'Khách hàng' : role}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {/* Hồ sơ người dùng */}
            <button
              onClick={() => handleMenuClick('/profile')}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
            >
              <User className="w-5 h-5 text-gray-600" />
              <div className="text-left">
                <div className="font-medium text-gray-900">Hồ sơ người dùng</div>
                <div className="text-xs text-gray-500">Quản lý thông tin cá nhân</div>
              </div>
            </button>

            {/* Cài đặt tài khoản */}
            <button
              onClick={() => handleMenuClick('/profile/settings')}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
            >
              <Settings className="w-5 h-5 text-gray-600" />
              <div className="text-left">
                <div className="font-medium text-gray-900">Cài đặt tài khoản</div>
                <div className="text-xs text-gray-500">Quản lý thông tin cá nhân</div>
              </div>
            </button>

            {/* Đơn mua */}
            <button
              onClick={() => handleMenuClick('/orders')}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
            >
              <Package className="w-5 h-5 text-gray-600" />
              <div className="text-left">
                <div className="font-medium text-gray-900">Đơn mua</div>
                <div className="text-xs text-gray-500">Xem lịch sử mua hàng</div>
              </div>
            </button>

            {/* Đơn bán - chỉ cho shop */}
            {(role === 'shop' || role === 'admin') && (
              <button
                onClick={() => handleMenuClick('/shop/orders')}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
              >
                <Package className="w-5 h-5 text-gray-600" />
                <div className="text-left">
                  <div className="font-medium text-gray-900">Đơn bán</div>
                  <div className="text-xs text-gray-500">Quản lý đơn hàng bán</div>
                </div>
              </button>
            )}

            {/* Giỏ hàng */}
            <button
              onClick={() => handleMenuClick('/cart')}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
            >
              <Package className="w-5 h-5 text-gray-600" />
              <div className="text-left">
                <div className="font-medium text-gray-900">Giỏ hàng</div>
                <div className="text-xs text-gray-500">Xem sản phẩm đã chọn</div>
              </div>
            </button>

            {/* Divider */}
            <div className="border-t border-gray-100 my-2"></div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full px-4 py-3 flex items-center gap-3 text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <div className="font-medium">Đăng xuất</div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;