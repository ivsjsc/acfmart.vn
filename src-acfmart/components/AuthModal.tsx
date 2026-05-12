import React, { useState } from 'react';
import { useStore } from '../store';
import { Eye, EyeOff, Mail, Lock, User, X, Chrome } from 'lucide-react';
import { AuthService, LoginData, RegistrationData } from '../services/authService';

interface FormData {
  email: string;
  password: string;
  name?: string;
  confirmPassword?: string;
}

export function AuthModal({ 
  isOpen, 
  onClose,
  initialView = 'login'
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  initialView?: 'login' | 'register';
}) {
  const [isLoginView, setIsLoginView] = useState(initialView === 'login');
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { user } = useStore();

  const toggleView = () => {
    setIsLoginView(!isLoginView);
    setError('');
    setSuccessMessage('');
    setFormData({
      email: '',
      password: '',
      name: '',
      confirmPassword: ''
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const loginData: LoginData = {
        email: formData.email,
        password: formData.password
      };
      
      const result = await AuthService.loginWithEmailAndPassword(loginData.email, loginData.password);

      if (result.success && result.user) {
        setSuccessMessage('Đăng nhập thành công!');
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        setError(result.error || 'Đăng nhập thất bại');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Validate form
    if (!formData.name?.trim()) {
      setError('Vui lòng nhập họ tên');
      setLoading(false);
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      setLoading(false);
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      setLoading(false);
      return;
    }
    
    try {
      const registrationData: RegistrationData = {
        email: formData.email,
        password: formData.password,
        name: formData.name || '',
        role: 'customer'
      };
      
      const result = await AuthService.registerWithEmailAndPassword(registrationData);

      if (result.success && result.user) {
        setSuccessMessage(result.message || 'Đăng ký thành công!');
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError(result.error || 'Đăng ký thất bại');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await AuthService.loginWithGoogle();

      if (result.success && result.user) {
        setSuccessMessage('Đăng nhập bằng Google thành công!');
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        setError(result.error || 'Đăng nhập bằng Google thất bại');
      }
    } catch (err: any) {
      console.error('Google Sign In error:', err);
      setError(err.message || 'Đăng nhập bằng Google thất bại');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">
              {isLoginView ? 'Đăng nhập tài khoản' : 'Tạo tài khoản mới'}
            </h2>
            <button 
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">
              {error}
            </div>
          )}
          
          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg border border-green-200">
              {successMessage}
            </div>
          )}

          <form onSubmit={isLoginView ? handleLogin : handleRegister}>
            {!isLoginView && (
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Họ và tên
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập họ và tên"
                    required={!isLoginView}
                  />
                </div>
              </div>
            )}

            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập địa chỉ email"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                  placeholder="Nhập mật khẩu"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {!isLoginView && (
              <div className="mb-6">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập lại mật khẩu"
                    required={!isLoginView}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang xử lý...
                </span>
              ) : isLoginView ? (
                'Đăng nhập'
              ) : (
                'Tạo tài khoản'
              )}
            </button>
          </form>

          <div className="mt-4">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className={`w-full py-2.5 px-4 rounded-lg font-medium transition-colors flex items-center justify-center ${
                loading 
                  ? 'bg-gray-200 cursor-not-allowed text-gray-500' 
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Chrome className="w-5 h-5 mr-2 text-red-500" />
              {loading ? 'Đang xử lý...' : 'Đăng nhập bằng Google'}
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {isLoginView 
                ? "Chưa có tài khoản?" 
                : "Đã có tài khoản?"}
              {' '}
              <button
                onClick={toggleView}
                className="font-medium text-blue-600 hover:text-blue-800 focus:outline-none"
              >
                {isLoginView ? 'Tạo tài khoản' : 'Đăng nhập ngay'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}