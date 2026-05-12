import React, { useState } from 'react';
import { AlertTriangle, Camera, Upload, X, Send } from 'lucide-react';
import { useStore, Product } from '../store';
import { showSuccess, showError, showWarning } from '../lib/notifications';

interface ReportCounterfeitProps {
  product?: Product;
  onClose: () => void;
}

export function ReportCounterfeit({ product, onClose }: ReportCounterfeitProps) {
  const { user, addCounterfeitReport } = useStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    reporterName: user?.displayName || '',
    reporterEmail: user?.email || '',
    reporterPhone: '',
    suspicionReason: '',
    description: '',
    evidenceFiles: [] as File[]
  });

  const suspicionReasons = [
    { value: 'quality', label: 'Chất lượng kém, khác biệt so với hàng chính hãng' },
    { value: 'packaging', label: 'Bao bì, nhãn mác sai khác biệt' },
    { value: 'fake_brand', label: 'Giả mạo thương hiệu nổi tiếng' },
    { value: 'qr_code', label: 'Mã QR không xác thực được' },
    { value: 'price', label: 'Giá quá rẻ so với thị trường' },
    { value: 'source', label: 'Nguồn gốc không rõ ràng, không có giấy tờ' },
    { value: 'other', label: 'Lý do khác' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({ ...prev, evidenceFiles: [...prev.evidenceFiles, ...files] }));
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      evidenceFiles: prev.evidenceFiles.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      showWarning('Vui lòng đăng nhập để báo cáo hàng giả');
      return;
    }

    const requiredFields = ['reporterName', 'reporterEmail', 'suspicionReason', 'description'];
    
    if (requiredFields.some(field => !formData[field as keyof typeof formData])) {
      showWarning('Vui lòng điền đầy đủ các thông tin bắt buộc');
      return;
    }

    setIsSubmitting(true);

    try {
      const report = {
        productId: product?.id || '',
        reporterId: user.uid,
        reporterName: formData.reporterName,
        reporterEmail: formData.reporterEmail,
        reporterPhone: formData.reporterPhone,
        suspicionReason: formData.suspicionReason,
        description: formData.description,
        evidenceUrls: [] as string[],
        productInfo: {
          name: product?.name || '',
          shopId: product?.shopId || '',
        },
        status: 'pending' as const,
        priority: 'medium' as const,
      };

      await addCounterfeitReport(report);
      
      showSuccess('Báo cáo đã gửi thành công!', 'ACF sẽ xem xét và phản hồi trong vòng 24h.');
      setFormData({
        reporterName: user?.displayName || '',
        reporterEmail: user?.email || '',
        reporterPhone: '',
        suspicionReason: '',
        description: '',
        evidenceFiles: []
      });
      onClose();
    } catch (error) {
      console.error('Error submitting report:', error);
      showError('Có lỗi xảy ra khi gửi báo cáo', 'Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <AlertTriangle className="w-6 h-6 mr-2 text-red-600" />
              Báo cáo Vi phạm Sản phẩm
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Báo cáo sản phẩm hàng giả, vi phạm tiêu chuẩn để ACF xử lý
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Product Info */}
          {product && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-bold text-gray-800 mb-3">Thông tin sản phẩm vi phạm</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Tên sản phẩm:</span>
                  <p className="font-medium">{product.name}</p>
                </div>
                <div>
                  <span className="text-gray-600">Người bán:</span>
                  <p className="font-medium">{product.shopId.substring(0, 8)}...</p>
                </div>
                <div>
                  <span className="text-gray-600">Giá:</span>
                  <p className="font-medium text-red-600">{product.price.toLocaleString('vi-VN')} ₫</p>
                </div>
                <div>
                  <span className="text-gray-600">Trạng thái:</span>
                  <p className="font-medium">
                    {product.status === 'approved' ? 'Đã duyệt ACF' : product.status === 'pending' ? 'Chờ duyệt' : 'Bị từ chối'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Reporter Info */}
          <div>
            <h3 className="font-bold text-gray-800 mb-3">Thông tin người báo cáo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.reporterName}
                  onChange={(e) => handleInputChange('reporterName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Nguyễn Văn A"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.reporterEmail}
                  onChange={(e) => handleInputChange('reporterEmail', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="email@example.com"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  value={formData.reporterPhone}
                  onChange={(e) => handleInputChange('reporterPhone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="09xxxxxxxx"
                />
              </div>
            </div>
          </div>

          {/* Suspicion Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lý do nghi ngờ <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.suspicionReason}
              onChange={(e) => handleInputChange('suspicionReason', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">Chọn lý do nghi ngờ</option>
              {suspicionReasons.map(reason => (
                <option key={reason.value} value={reason.value}>
                  {reason.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả chi tiết <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Vui lòng mô tả chi tiết các dấu hiệu nghi ngờ hàng giả..."
            />
          </div>

          {/* Evidence Files */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bằng chứng (hình ảnh, video, tài liệu)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                multiple
                accept="image/*,video/*,.pdf"
                onChange={handleFileUpload}
                className="hidden"
                id="evidence-files"
              />
              <label
                htmlFor="evidence-files"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="w-12 h-12 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">
                  Nhấp để tải lên hoặc kéo thả file vào đây
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  Hỗ trợ: JPG, PNG, MP4, PDF (tối đa 10MB)
                </span>
              </label>
            </div>
            
            {formData.evidenceFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium text-gray-700">File đã tải lên:</h4>
                {formData.evidenceFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Đang gửi...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Gửi báo cáo
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
