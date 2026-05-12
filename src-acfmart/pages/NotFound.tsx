import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileQuestion, ArrowLeft, Home, Search } from 'lucide-react';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4" role="main">
      <div className="text-center max-w-md">
        <div className="mx-auto w-20 h-20 bg-brand-gold-100 rounded-full flex items-center justify-center mb-6">
          <FileQuestion className="w-10 h-10 text-brand-gold-600" aria-hidden="true" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
        <h2 className="text-xl font-semibold text-gray-700 mb-3">
          Không tìm thấy trang
        </h2>
        <p className="text-gray-600 mb-8">
          Trang bạn tìm kiếm không tồn tại hoặc đã bị di chuyển. Hãy kiểm tra lại đường dẫn hoặc quay về trang chủ.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors min-h-touch"
            aria-label="Quay lại trang trước"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Quay lại
          </button>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-red text-white rounded-lg hover:bg-brand-red-700 transition-colors min-h-touch"
            aria-label="Về trang chủ"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            Trang chủ
          </button>
          <button
            onClick={() => navigate('/search')}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-brand-red rounded-lg text-brand-red hover:bg-red-50 transition-colors min-h-touch"
            aria-label="Tìm kiếm sản phẩm"
          >
            <Search className="w-4 h-4" aria-hidden="true" />
            Tìm kiếm
          </button>
        </div>
      </div>
    </div>
  );
}
