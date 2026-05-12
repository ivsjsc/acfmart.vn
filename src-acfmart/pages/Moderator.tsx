import React from 'react';
import { useStore } from '../store';
import { ShieldCheck, Check, X, Inbox } from 'lucide-react';
import { showConfirm, showSuccess } from '../lib/notifications';

export function ModeratorView() {
  const { products, updateProductStatus } = useStore();
  const pendingProducts = products.filter(p => p.status === 'pending');

  const handleApprove = async (id: string) => {
    await updateProductStatus(id, 'approved');
    showSuccess('Sản phẩm đã được phê duyệt');
  };

  const handleReject = (id: string) => {
    showConfirm(
      'Từ chối sản phẩm',
      'Bạn có chắc chắn muốn từ chối sản phẩm này? Hành động này không thể hoàn tác.',
      async () => {
        await updateProductStatus(id, 'rejected');
        showSuccess('Sản phẩm đã bị từ chối');
      }
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-red-100 shadow-card border-l-4 border-l-brand-red">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center mb-2 uppercase">
            <ShieldCheck className="w-6 h-6 mr-2 text-brand-red" aria-hidden="true" />
            Kiểm duyệt Sản phẩm
          </h1>
          <p className="text-gray-600 text-sm">Xem xét và phê duyệt các sản phẩm mới do Shop đăng tải.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-card border border-gray-100 overflow-hidden">
        {pendingProducts.length === 0 ? (
          <div className="p-12 text-center">
            <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-4" aria-hidden="true" />
            <p className="text-gray-500 font-medium">Không có sản phẩm nào cần kiểm duyệt lúc này.</p>
            <p className="text-gray-400 text-sm mt-1">Các sản phẩm mới sẽ xuất hiện ở đây khi Shop đăng tải.</p>
          </div>
        ) : (
          <table className="w-full text-left" aria-label="Danh sách sản phẩm chờ duyệt">
            <thead className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
              <tr>
                <th scope="col" className="p-4 font-medium">Sản phẩm</th>
                <th scope="col" className="p-4 font-medium">Shop</th>
                <th scope="col" className="p-4 font-medium">Giá đề xuất</th>
                <th scope="col" className="p-4 font-medium text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pendingProducts.map(p => (
                <tr key={p.id} className="hover:bg-gray-50/50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt="" className="w-10 h-10 rounded-md object-cover bg-gray-100" />
                      <span className="font-medium text-gray-800">{p.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">
                    {p.shopId}
                  </td>
                  <td className="p-4 font-medium text-gray-800">
                    {p.price.toLocaleString('vi-VN')} ₫
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleReject(p.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors min-h-touch min-w-touch flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-red-500"
                        aria-label={`Từ chối sản phẩm ${p.name}`}
                      >
                        <X className="w-5 h-5" aria-hidden="true" />
                      </button>
                      <button 
                        onClick={() => handleApprove(p.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors min-h-touch min-w-touch flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-green-500"
                        aria-label={`Phê duyệt sản phẩm ${p.name}`}
                      >
                        <Check className="w-5 h-5" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
