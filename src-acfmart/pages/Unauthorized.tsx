import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldX, ArrowLeft, Home } from 'lucide-react';

export function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4" role="main">
      <div className="text-center max-w-md">
        <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <ShieldX className="w-10 h-10 text-brand-red" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Không có quyền truy cập
        </h1>
        <p className="text-gray-600 mb-8">
          Bạn không có quyền truy cập trang này. Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là lỗi.
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
        </div>
      </div>
    </div>
  );
}
