import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, Eye, EyeOff, AlertCircle, CheckCircle, ArrowLeft, Shield, Store, Package, Truck } from 'lucide-react';
import { showSuccess, showError } from '../lib/notifications';
import { AuthService, RegistrationData } from '../services/authService';

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phone: string;
  role: 'customer' | 'shop_staff';
  agreeTerms: boolean;
  agreePrivacy: boolean;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<RegisterFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    role: 'customer',
    agreeTerms: false,
    agreePrivacy: false
  });

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const validateForm = () => {
    const newErrors: Partial<RegisterFormData> = {};

    if (!formData.email) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.password) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Xác nhận mật khẩu là bắt buộc';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu không khớp';
    }

    if (!formData.fullName) {
      newErrors.fullName = 'Họ và tên là bắt buộc';
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = 'Họ và tên phải có ít nhất 2 ký tự';
    }

    if (!formData.phone) {
      newErrors.phone = 'Số điện thoại là bắt buộc';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'Bạn phải đồng ý với điều khoản sử dụng' as any;
    }

    if (!formData.agreePrivacy) {
      newErrors.agreePrivacy = 'Bạn phải đồng ý với chính sách bảo mật' as any;
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

    try {
      const registrationData: RegistrationData = {
        email: formData.email,
        password: formData.password,
        name: formData.fullName,
        phone: formData.phone,
        role: formData.role as 'customer' | 'shop_manager' | 'admin' | 'super_admin' | 'shop_staff'
      };
      
      const result = await AuthService.registerWithEmailAndPassword(registrationData);

      if (result.success && result.user) {
        showSuccess('Đăng ký thành công!', result.message || 'Vui lòng kiểm tra email để xác nhận tài khoản.');
        navigate('/'); // Navigate to home after successful registration
      } else {
        showError('Đăng ký thất bại', result.error || 'Vui lòng thử lại sau.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      showError('Đăng ký thất bại', 'Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof RegisterFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const nextStep = () => {
    if (currentStep === 1) {
      if (!formData.email || !validateEmail(formData.email)) {
        setErrors({ email: 'Email không hợp lệ' });
        return;
      }
      if (!formData.password || formData.password.length < 6) {
        setErrors({ password: 'Mật khẩu phải có ít nhất 6 ký tự' });
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setErrors({ confirmPassword: 'Mật khẩu không khớp' });
        return;
      }
    }
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Đăng ký tài khoản</h1>
          <p className="text-gray-600">Tham gia sàn TMĐT ACF để mua sắm và kinh doanh</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    currentStep >= step
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div
                    className={`w-16 h-1 mx-2 transition-colors ${
                      currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center mt-4">
            <div className="flex justify-between w-full max-w-xs text-xs text-gray-600">
              <span className={currentStep >= 1 ? 'font-medium text-blue-600' : ''}>
                Thông tin cơ bản
              </span>
              <span className={currentStep >= 2 ? 'font-medium text-blue-600' : ''}>
                Thông tin cá nhân
              </span>
              <span className={currentStep >= 3 ? 'font-medium text-blue-600' : ''}>
                Xác nhận
              </span>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Thông tin cơ bản</h2>
                
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="nhapemail@example.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mật khẩu <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.password ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Nhập mật khẩu"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Xác nhận mật khẩu <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Nhập lại mật khẩu"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Role Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loại tài khoản
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => handleInputChange('role', 'customer')}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        formData.role === 'customer'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <User className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                      <h3 className="font-medium text-gray-900">Khách hàng</h3>
                      <p className="text-sm text-gray-600 mt-1">Mua sắm sản phẩm</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInputChange('role', 'shop_staff')}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        formData.role === 'shop_staff'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Store className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                      <h3 className="font-medium text-gray-900">Người bán hàng</h3>
                      <p className="text-sm text-gray-600 mt-1">Kinh doanh sản phẩm</p>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Personal Information */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Thông tin cá nhân</h2>
                
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.fullName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Nhập họ và tên đầy đủ"
                    />
                  </div>
                  {errors.fullName && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.fullName}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* Role Benefits */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">Quyền lợi của bạn:</h3>
                  {formData.role === 'customer' ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Mua sắm sản phẩm chất lượng
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Giao hàng nhanh chóng
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Bảo hành và đổi trả
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Bán sản phẩm trên sàn TMĐT
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Quản lý đơn hàng tự động
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Hỗ trợ marketing và vận chuyển
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Xác nhận đăng ký</h2>
                
                {/* Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">Thông tin tài khoản:</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{formData.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Họ và tên:</span>
                      <span className="font-medium">{formData.fullName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Số điện thoại:</span>
                      <span className="font-medium">{formData.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Loại tài khoản:</span>
                      <span className="font-medium">
                        {formData.role === 'customer' ? 'Khách hàng' : 'Người bán hàng'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Terms and Privacy */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={formData.agreeTerms}
                      onChange={(e) => handleInputChange('agreeTerms', e.target.checked)}
                      className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="terms" className="text-sm text-gray-600">
                      Tôi đồng ý với{' '}
                      <a href="#" className="text-blue-600 hover:text-blue-800">
                        Điều khoản sử dụng
                      </a>{' '}
                      của sàn TMĐT ACF
                    </label>
                  </div>
                  {errors.agreeTerms && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.agreeTerms}
                    </p>
                  )}

                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="privacy"
                      checked={formData.agreePrivacy}
                      onChange={(e) => handleInputChange('agreePrivacy', e.target.checked)}
                      className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="privacy" className="text-sm text-gray-600">
                      Tôi đồng ý với{' '}
                      <a href="#" className="text-blue-600 hover:text-blue-800">
                        Chính sách bảo mật
                      </a>{' '}
                      của sàn TMĐT ACF
                    </label>
                  </div>
                  {errors.agreePrivacy && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.agreePrivacy}
                    </p>
                  )}
                </div>

                {/* Security Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">Bảo mật thông tin</h4>
                      <p className="text-sm text-blue-800 mt-1">
                        Chúng tôi cam kết bảo mật thông tin cá nhân của bạn và chỉ sử dụng cho mục đích
                        xác thực tài khoản và cải thiện trải nghiệm dịch vụ.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={currentStep === 1}
              >
                Quay lại
              </button>

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Tiếp tục
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
                </button>
              )}
            </div>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Đã có tài khoản?{' '}
              <a href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                Đăng nhập ngay
              </a>
            </p>
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
    </div>
  );
};

export default Register;