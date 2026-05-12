import React from 'react';
import { useStore } from '../store';
import { Truck, CheckCircle2 } from 'lucide-react';
import { showConfirm, showSuccess } from '../lib/notifications';

export function CarrierView() {
  const { orders, products, updateOrderStatus } = useStore();
  const shippingOrders = orders.filter(o => o.status === 'shipping');

  const handleDeliver = (id: string) => {
    showConfirm(
      'Xác nhận giao hàng',
      'Xác nhận đã giao hàng thành công cho khách?',
      async () => {
        await updateOrderStatus(id, 'delivered');
        showSuccess('Đã xác nhận giao hàng thành công');
      }
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
      <div className="bg-white p-6 rounded-xl border border-red-100 shadow-sm border-l-4 border-l-red-600 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center mb-1 uppercase">
            <Truck className="w-6 h-6 mr-2 text-red-600" />
            Vận chuyển & Giao hàng
          </h2>
          <p className="text-gray-500 text-sm">Cập nhật trạng thái các đơn hàng đang giao.</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-center bg-red-50 border border-red-100 px-4 py-2 rounded-lg">
            <div className="text-2xl font-black text-red-600">{shippingOrders.length}</div>
            <div className="text-xs text-red-800 font-bold uppercase whitespace-nowrap">Đơn cần giao</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {shippingOrders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Tuyệt vời! Không có đơn hàng nào đang tồn đọng cần giao lúc này.
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {shippingOrders.map(o => {
              const product = products.find(p => p.id === o.productId);
              return (
                <li key={o.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                      <Truck className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 mb-1">Mã vận đơn: {o.id.toUpperCase()}</p>
                      <p className="text-sm text-gray-600">Sản phẩm: <span className="font-medium text-gray-800">{product?.name}</span></p>
                      <p className="text-sm text-gray-500 mt-1">Từ: {o.shopId} &rarr; Đến: {o.customerId}</p>
                    </div>
                  </div>
                  <div>
                    <button 
                      onClick={() => handleDeliver(o.id)}
                      className="w-full md:w-auto flex items-center justify-center bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-lg font-medium transition"
                    >
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      Xác nhận Đã Giao
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
