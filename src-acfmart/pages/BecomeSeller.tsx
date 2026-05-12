import React, { useState, useEffect } from 'react';
import { Store, FileText, CheckCircle, AlertCircle, Upload, User, Mail, Phone, MapPin, CreditCard, Shield, Star, Calendar, Eye, XCircle, Clock, EyeOff, EyeOffIcon, CloudUpload, Link2 } from 'lucide-react';
import { authService, AuthService } from '../services/authService';
import { SellerApplication } from '../types/sellerTypes';
import { zaloNotificationService } from '../services/zaloNotificationService';
import { showWarning, showError, showSuccess } from '../lib/notifications';
import { GoogleFormsService, SELLER_REGISTRATION_FORM_CONFIG } from '../services/googleFormsService';
import { FormAutoFillService, DEFAULT_SELLER_AUTOFILL_CONFIG } from '../services/formAutoFillService';
import { sellerFileUploadService, FileValidationResult } from '../services/fileUploadService';

interface FormData {
  // Personal Info
  fullName: string;
  email: string;
  phone: string;
  address: string;
  
  // Shop Info
  shopName: string;
  shopDescription: string;
  shopCategory: string;
  shopLogo: File | null;
  
  // Business Info
  businessLicense: File | null;
  taxCode: string;
  bankAccount: string;
  bankName: string;
  
  // Documents
  acfFormFile: File | null;
  vneidScreenshot: File | null;
  idCardFile: File | null;
  distributionContract: File | null;
  qualityCertificate: File | null;
  
  // Terms
  agreeTerms: boolean;
  agreePolicies: boolean;
}

const BecomeSeller: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    // Personal Info
    fullName: '',
    email: '',
    phone: '',
    address: '',
    
    // Shop Info
    shopName: '',
    shopDescription: '',
    shopCategory: '',
    shopLogo: null,
    
    // Business Info
    businessLicense: null,
    taxCode: '',
    bankAccount: '',
    bankName: '',
    
    // Documents
    acfFormFile: null,
    vneidScreenshot: null,
    idCardFile: null,
    distributionContract: null,
    qualityCertificate: null,
    
    // Terms
    agreeTerms: false,
    agreePolicies: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [applicationStatus, setApplicationStatus] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Google Forms integration states
  const [googleFormsEnabled, setGoogleFormsEnabled] = useState(false);
  const [isSubmittingToGoogle, setIsSubmittingToGoogle] = useState(false);
  const [googleFormResponse, setGoogleFormResponse] = useState<any>(null);
  const [fileValidationResults, setFileValidationResults] = useState<Record<string, FileValidationResult>>({});

  // Initialize services
  const googleFormsService = new GoogleFormsService(SELLER_REGISTRATION_FORM_CONFIG);
  const autoFillService = new FormAutoFillService(googleFormsService, DEFAULT_SELLER_AUTOFILL_CONFIG);

  const categories = [
    'Thời trang',
    'Điện tử & Điện lạnh',
    'Mỹ phẩm & Làm đẹp',
    'Nhà cửa & Đời sống',
    'Thể thao & Dã ngoại',
    'Sách & Văn phòng phẩm',
    'Ô tô & Xe máy',
    'Mẹ & Bé',
    'Sức khỏe',
    'An toàn & An ninh'
  ];

  // Check Google Forms availability and fetch current user
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = await AuthService.getCurrentUser();
        if (user) {
          setCurrentUser(user);
          // Auto-fill email from authenticated user
          setFormData(prev => ({
            ...prev,
            email: user.email || '',
            fullName: user.name || '',
          }));
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    // Check if Google Forms integration is available
    const checkGoogleFormsAvailability = () => {
      const hasFormId = !!process.env.REACT_APP_GOOGLE_FORM_ID;
      const hasApiKey = !!process.env.REACT_APP_GOOGLE_API_KEY;
      const hasClientId = !!process.env.REACT_APP_GOOGLE_CLIENT_ID;
      
      const isEnabled = hasFormId && hasApiKey && hasClientId;
      setGoogleFormsEnabled(isEnabled);
      
      if (isEnabled) {
        console.log('✅ Google Forms integration enabled');
      } else {
        console.log('ℹ️ Google Forms integration not available - using local storage only');
      }
    };

    fetchUserData();
    checkGoogleFormsAvailability();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: checkbox.checked
      }));
    } else if (type === 'file') {
      const fileInput = e.target as HTMLInputElement;
      const file = fileInput.files?.[0] || null;
      setFormData(prev => ({
        ...prev,
        [name]: file
      }));
      
      // Validate file if it's a required document
      if (file && name) {
        validateSingleFile(name, file);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Validate single file
  const validateSingleFile = async (fieldName: string, file: File) => {
    try {
      const result = await sellerFileUploadService.validateFile(file, fieldName);
      setFileValidationResults(prev => ({
        ...prev,
        [fieldName]: result
      }));
    } catch (error) {
      console.error(`Error validating file ${fieldName}:`, error);
    }
  };

  // Submit to Google Forms
  const submitToGoogleForms = async (applicationData: SellerApplication, files: Record<string, File>) => {
    if (!googleFormsEnabled) {
      throw new Error('Google Forms integration is not available');
    }

    setIsSubmittingToGoogle(true);
    
    try {
      // Process files (validate and compress)
      const { processedFiles, validationResults, hasErrors } = await sellerFileUploadService.processFiles(files);
      
      if (hasErrors) {
        const errorMessages = Object.values(validationResults)
          .filter(result => !result.isValid)
          .map(result => result.errors.join(', '))
          .join('; ');
        throw new Error(`File validation failed: ${errorMessages}`);
      }

      // Submit to Google Forms with auto-fill
      const response = await autoFillService.autoFillAndSubmit(applicationData, processedFiles);
      
      setGoogleFormResponse(response);
      showSuccess('Hồ sơ đã được gửi thành công đến Google Forms!');
      
      return response;
    } catch (error) {
      console.error('Error submitting to Google Forms:', error);
      throw error;
    } finally {
      setIsSubmittingToGoogle(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.agreeTerms || !formData.agreePolicies) {
      showWarning('Vui lòng đồng ý với điều khoản và chính sách');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Create application object
      const applicationData: Omit<SellerApplication, 'id' | 'applicationId' | 'status' | 'submittedAt'> = {
        ...formData,
        googleEmail: formData.email,
        fullName: formData.fullName,
        phone: formData.phone,
        address: formData.address,
        shopName: formData.shopName,
        shopDescription: formData.shopDescription,
        shopCategory: formData.shopCategory,
        taxCode: formData.taxCode,
        bankName: formData.bankName,
        bankAccount: formData.bankAccount,
        businessLicense: formData.businessLicense?.name || '',
        shopLogo: formData.shopLogo?.name || '',
        updatedAt: new Date().toISOString(),
        applicationVersion: 1
      };

      // Store uploaded files information
      const uploadedFiles = {
        acfFormFile: formData.acfFormFile?.name,
        vneidScreenshot: formData.vneidScreenshot?.name,
        idCard: formData.idCardFile?.name,
        businessLicense: formData.businessLicense?.name,
        distributionContract: formData.distributionContract?.name,
        qualityCertificate: formData.qualityCertificate?.name
      };

      // Generate a unique ID for application
      const applicationId = `SELLER-${Date.now()}`;
      
      // Create full application object
      const fullApplication: SellerApplication = {
        ...applicationData,
        id: applicationId,
        applicationId: applicationId,
        status: 'pending',
        submittedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        applicationVersion: 1,
        documents: uploadedFiles,
        verificationStatus: {
          email: true,
          phone: true,
          address: true,
          business: !!formData.businessLicense,
          bank: !!(formData.bankName && formData.bankAccount),
          shopCategory: !!formData.shopCategory
        }
      };

      // Prepare files for upload
      const filesForUpload: Record<string, File> = {};
      if (formData.acfFormFile) filesForUpload.acfFormFile = formData.acfFormFile;
      if (formData.vneidScreenshot) filesForUpload.vneidScreenshot = formData.vneidScreenshot;
      if (formData.idCardFile) filesForUpload.idCardFile = formData.idCardFile;
      if (formData.businessLicense) filesForUpload.businessLicense = formData.businessLicense;
      if (formData.distributionContract) filesForUpload.distributionContract = formData.distributionContract;
      if (formData.qualityCertificate) filesForUpload.qualityCertificate = formData.qualityCertificate;
      if (formData.shopLogo) filesForUpload.shopLogo = formData.shopLogo;

      // Submit to Google Forms if enabled
      let googleResponse = null;
      if (googleFormsEnabled) {
        try {
          googleResponse = await submitToGoogleForms(fullApplication, filesForUpload);
        } catch (error) {
          console.error('Google Forms submission failed:', error);
          showError('Cảnh báo: Không thể gửi đến Google Forms', 'Hồ sơ sẽ được lưu cục bộ.');
        }
      }

      // Save application data to localStorage (fallback)
      localStorage.setItem('sellerApplication', JSON.stringify(fullApplication));
      
      // Also add to list of all applications
      const allApplications = JSON.parse(localStorage.getItem('sellerApplications') || '[]');
      allApplications.push(fullApplication);
      localStorage.setItem('sellerApplications', JSON.stringify(allApplications));
      
      // Initialize Zalo notification service and send notification to moderators
      if (zaloNotificationService) {
        try {
          const notificationResults = await zaloNotificationService.notifyNewSellerApplication(fullApplication);
          console.log('Zalo notifications sent:', notificationResults);
        } catch (error) {
          console.error('Error sending Zalo notifications:', error);
        }
      }
      
      setSubmitStatus('success');
      setCurrentStep(5); // Success step
      
    } catch (error) {
      console.error('Error submitting application:', error);
      setSubmitStatus('error');
      showError('Có lỗi xảy ra khi gửi hồ sơ', 'Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">1</div>
        <h2 className="text-xl font-bold text-gray-900">Thông tin cá nhân</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4 inline mr-2" />
            Họ và tên đầy đủ
          </label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Họ và tên đầy đủ"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Phone className="w-4 h-4 inline mr-2" />
            Số điện thoại
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0912345678"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-2" />
            Địa chỉ thường trú
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="123 Nguyễn Huệ, Quận 1, TP.HCM"
            required
          />
        </div>
      </div>
      
      <div className="flex justify-end mt-6">
        <button
          onClick={() => setCurrentStep(2)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          disabled={!formData.fullName || !formData.phone || !formData.address}
        >
          Tiếp tục
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">2</div>
        <h2 className="text-xl font-bold text-gray-900">Thông tin cửa hàng</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Store className="w-4 h-4 inline mr-2" />
            Tên cửa hàng
          </label>
          <input
            type="text"
            name="shopName"
            value={formData.shopName}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Tên cửa hàng của bạn"
            required
          />
          <p className="text-xs text-gray-500 mt-1">Tên này sẽ hiển thị công khai trên sàn giao dịch</p>
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FileText className="w-4 h-4 inline mr-2" />
            Mô tả cửa hàng
          </label>
          <textarea
            name="shopDescription"
            value={formData.shopDescription}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Giới thiệu ngắn gọn về cửa hàng và sản phẩm của bạn..."
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Store className="w-4 h-4 inline mr-2" />
            Danh mục kinh doanh chính
          </label>
          <select
            name="shopCategory"
            value={formData.shopCategory}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Chọn danh mục</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Upload className="w-4 h-4 inline mr-2" />
            Logo cửa hàng
          </label>
          <input
            type="file"
            name="shopLogo"
            onChange={handleInputChange}
            accept="image/*"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {formData.shopLogo && (
            <p className="text-sm text-green-600 mt-1">Đã chọn: {formData.shopLogo.name}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">Định dạng: JPG, PNG. Kích thước tối đa: 2MB</p>
        </div>
      </div>
      
      <div className="flex justify-between mt-6">
        <button
          onClick={() => setCurrentStep(1)}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Quay lại
        </button>
        <button
          onClick={() => setCurrentStep(3)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          disabled={!formData.shopName || !formData.shopDescription || !formData.shopCategory}
        >
          Tiếp tục
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">3</div>
        <h2 className="text-xl font-bold text-gray-900">Thông tin pháp lý & Tài chính</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FileText className="w-4 h-4 inline mr-2" />
            Giấy phép kinh doanh (hoặc tài liệu tương đương)
          </label>
          <input
            type="file"
            name="businessLicense"
            onChange={handleInputChange}
            accept=".jpg,.jpeg,.png,.pdf"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          {formData.businessLicense && (
            <p className="text-sm text-green-600 mt-1">Đã chọn: {formData.businessLicense.name}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">Định dạng: JPG, PNG, PDF. Kích thước tối đa: 5MB</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Shield className="w-4 h-4 inline mr-2" />
            Mã số thuế (nếu có)
          </label>
          <input
            type="text"
            name="taxCode"
            value={formData.taxCode}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0123456789"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <CreditCard className="w-4 h-4 inline mr-2" />
            Tên ngân hàng
          </label>
          <input
            type="text"
            name="bankName"
            value={formData.bankName}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Tên ngân hàng"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <CreditCard className="w-4 h-4 inline mr-2" />
            Số tài khoản ngân hàng
          </label>
          <input
            type="text"
            name="bankAccount"
            value={formData.bankAccount}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Số tài khoản nhận tiền"
            required
          />
        </div>
      </div>
      
      <div className="flex justify-between mt-6">
        <button
          onClick={() => setCurrentStep(2)}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Quay lại
        </button>
        <button
          onClick={() => setCurrentStep(4)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          disabled={!formData.businessLicense || !formData.bankName || !formData.bankAccount}
        >
          Tiếp tục
        </button>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">4</div>
        <h2 className="text-xl font-bold text-gray-900">Tài liệu bắt buộc</h2>
      </div>
      
      {/* Google Forms Integration Banner */}
      {googleFormsEnabled && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Link2 className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-900">
              Tích hợp Google Forms
            </h3>
          </div>
          <p className="text-blue-800 mb-3">
            Hồ sơ của bạn sẽ được tự động điền vào Google Forms và tài liệu được tải lên Google Drive để Ban Quản trị xử lý nhanh chóng.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <CloudUpload className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-700">Tự động tải lên file</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700">Xác thực tự động</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-600" />
              <span className="text-sm text-purple-700">Bảo mật cao</span>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FileText className="w-4 h-4 inline mr-2" />
            Đơn đăng ký ACF Seller (PDF bắt buộc)
          </label>
          <input
            type="file"
            name="acfFormFile"
            onChange={handleInputChange}
            accept=".pdf"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          {formData.acfFormFile && (
            <div className="mt-2">
              <p className="text-sm text-green-600">Đã chọn: {formData.acfFormFile.name}</p>
              {fileValidationResults.acfFormFile && (
                <div className="mt-1">
                  {fileValidationResults.acfFormFile.isValid ? (
                    <p className="text-xs text-green-600">✅ File hợp lệ</p>
                  ) : (
                    <div className="text-xs text-red-600">
                      {fileValidationResults.acfFormFile.errors.map((error, idx) => (
                        <p key={idx}>❌ {error}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          <p className="text-xs text-gray-500 mt-1">Định dạng: PDF. Tải lên đơn đã điền thông tin và ký tên</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Shield className="w-4 h-4 inline mr-2" />
            Ảnh chụp màn hình VNeID mức 2
          </label>
          <input
            type="file"
            name="vneidScreenshot"
            onChange={handleInputChange}
            accept=".jpg,.jpeg,.png"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          {formData.vneidScreenshot && (
            <p className="text-sm text-green-600 mt-1">Đã chọn: {formData.vneidScreenshot.name}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">Định dạng: JPG, PNG. Ảnh chụp màn hình xác thực thành công</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4 inline mr-2" />
            CCCD/CMND người đại diện
          </label>
          <input
            type="file"
            name="idCardFile"
            onChange={handleInputChange}
            accept=".jpg,.jpeg,.png,.pdf"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          {formData.idCardFile && (
            <p className="text-sm text-green-600 mt-1">Đã chọn: {formData.idCardFile.name}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">Định dạng: JPG, PNG, PDF</p>
        </div>
      </div>
      
      <div className="flex justify-between mt-6">
        <button
          onClick={() => setCurrentStep(3)}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Quay lại
        </button>
        <button
          onClick={handleSubmit}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          disabled={
            !formData.acfFormFile || 
            !formData.vneidScreenshot || 
            !formData.idCardFile ||
            isSubmitting
          }
        >
          {isSubmitting ? 'Đang gửi hồ sơ...' : 'Gửi hồ sơ hoàn tất'}
        </button>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Hồ sơ đã được nộp thành công!
      </h2>
      
      {/* Google Forms Integration Status */}
      {googleFormsEnabled && googleFormResponse && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <Link2 className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-semibold text-green-900">
              Đã gửi thành công đến Google Forms
            </h3>
          </div>
          <div className="text-left space-y-2">
            <p className="text-green-800">✅ Mã phản hồi: {googleFormResponse.responseId}</p>
            <p className="text-green-800">✅ Thời gian gửi: {new Date(googleFormResponse.timestamp).toLocaleString('vi-VN')}</p>
            <p className="text-green-800">✅ Tất cả tài liệu đã được tải lên Google Drive</p>
            <p className="text-green-800">✅ Ban Quản trị sẽ nhận được thông báo ngay lập tức</p>
          </div>
        </div>
      )}
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Thông tin hồ sơ</h3>
        <div className="text-left space-y-2">
          <p><strong>Mã hồ sơ:</strong> <span className="text-blue-600">{`SELLER-${Date.now()}`}</span></p>
          <p><strong>Tên cửa hàng:</strong> {formData.shopName}</p>
          <p><strong>Email:</strong> {formData.email}</p>
          <p><strong>Trạng thái:</strong> <span className="text-yellow-600">Chờ kiểm duyệt</span></p>
          {googleFormsEnabled && (
            <p><strong>Google Forms:</strong> <span className="text-green-600">Đã liên kết</span></p>
          )}
        </div>
      </div>
      
      <button
        onClick={() => window.location.href = '/'}
        className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Về trang chủ
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Trở thành Người bán hàng
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Đăng ký trở thành người bán hàng trên Sàn TMĐT ACF để tiếp cận hàng triệu khách hàng và phát triển kinh doanh của bạn
          </p>
        </div>

        {/* Progress Steps */}
        {currentStep <= 4 && (
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center">
              {[1, 2, 3, 4].map((step) => (
                <React.Fragment key={step}>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                      step < currentStep
                        ? 'bg-green-600 text-white'
                        : step === currentStep
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {step < currentStep ? <CheckCircle className="w-5 h-5" /> : step}
                  </div>
                  {step < 4 && (
                    <div
                      className={`w-20 h-1 transition-colors ${
                        step < currentStep ? 'bg-green-600' : 'bg-gray-300'
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* Form Content */}
        {applicationStatus ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Hồ sơ đã được nộp thành công!
            </h2>
          </div>
        ) : (
          <>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
            {currentStep === 5 && renderSuccess()}
          </>
        )}

        {/* Info Box */}
        {currentStep <= 4 && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              <Shield className="w-5 h-5 inline mr-2" />
              Lưu ý quan trọng
            </h3>
            <ul className="text-left space-y-2 text-sm text-blue-800">
              <li>• Tất cả thông tin phải chính xác và có thể xác thực</li>
              <li>• Giấy phép kinh doanh phải còn hiệu lực</li>
              <li>• Tài khoản sẽ được liên kết với email Google của bạn</li>
              <li>• Quá trình kiểm duyệt có thể mất 7-10 ngày làm việc</li>
              <li>• Chúng tôi sẽ thông báo kết quả qua email</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default BecomeSeller;
