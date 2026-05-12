import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, AlertCircle, ArrowLeft, Shield, Store, Package, Truck } from 'lucide-react';
import { AuthModal } from '../components/AuthModal';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [modalInitialView, setModalInitialView] = useState<'login' | 'register'>('login');

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!password) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    } else if (password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    // Handle login logic here
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Login attempt with:', { email, password });
      // Actual login would happen via AuthModal now
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginClick = () => {
    setModalInitialView('login');
    setShowAuthModal(true);
  };

  const handleRegisterClick = () => {
    setModalInitialView('register');
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại trang chủ
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Đăng nhập tài khoản</h1>
          <p className="text-gray-600">Truy cập tài khoản của bạn để tiếp tục mua sắm</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto">
          <div className="space-y-6">
            <button
              onClick={handleLoginClick}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
            >
              <Mail className="w-5 h-5 mr-2" />
              Đăng nhập với Email
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Hoặc</span>
              </div>
            </div>

            <button
              onClick={handleRegisterClick}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center justify-center"
            >
              <User className="w-5 h-5 mr-2" />
              Tạo tài khoản mới
            </button>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-center text-sm font-medium text-gray-900 mb-4">Tại sao nên chọn ACF?</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-xs text-gray-600">Xác thực nguồn gốc</p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Package className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-xs text-gray-600">Sản phẩm chính hãng</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-medium text-gray-900">Sản phẩm đa dạng</h3>
            <p className="text-sm text-gray-600 mt-1">Nhiều ngành hàng chất lượng</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Truck className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-medium text-gray-900">Giao hàng nhanh</h3>
            <p className="text-sm text-gray-600 mt-1">Vận chuyển toàn quốc</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-medium text-gray-900">Bảo mật an toàn</h3>
            <p className="text-sm text-gray-600 mt-1">Bảo vệ thông tin cá nhân</p>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal 
          isOpen={true} 
          onClose={() => setShowAuthModal(false)} 
          initialView={modalInitialView}
        />
      )}
    </div>
  );
};

export default Login;