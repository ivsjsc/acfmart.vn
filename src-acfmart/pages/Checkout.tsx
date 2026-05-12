import React from 'react';
import Payment from '../components/Payment';

const Checkout = () => {
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Thanh toán đơn hàng</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery Address */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Địa chỉ nhận hàng</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border border-gray-300 rounded-md" 
                    defaultValue="Nguyễn Văn A" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border border-gray-300 rounded-md" 
                    defaultValue="0123456789" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                <input 
                  type="text" 
                  className="w-full p-2 border border-gray-300 rounded-md" 
                  defaultValue="123 Đường ABC, Phường XYZ, Quận 1" 
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tỉnh/Thành phố</label>
                  <select className="w-full p-2 border border-gray-300 rounded-md">
                    <option>Hồ Chí Minh</option>
                    <option>Hà Nội</option>
                    <option>Đà Nẵng</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quận/Huyện</label>
                  <select className="w-full p-2 border border-gray-300 rounded-md">
                    <option>Quận 1</option>
                    <option>Quận 2</option>
                    <option>Quận 3</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phường/Xã</label>
                  <select className="w-full p-2 border border-gray-300 rounded-md">
                    <option>Phường Tân Định</option>
                    <option>Phường Đa Kao</option>
                    <option>Phường Bến Nghé</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded text-red-600 focus:ring-red-500" defaultChecked />
                  <span className="ml-2 text-sm text-gray-700">Đặt làm địa chỉ mặc định</span>
                </label>
              </div>
            </div>
          </div>
          
          {/* Shipping Method */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Phương thức vận chuyển</h2>
            <div className="space-y-3">
              <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input type="radio" name="shipping" className="h-4 w-4 text-red-600 focus:ring-red-500" defaultChecked />
                <div className="ml-3">
                  <span className="block font-medium text-gray-800">Giao hàng tiêu chuẩn</span>
                  <span className="block text-sm text-gray-600">3-5 ngày làm việc • Miễn phí</span>
                </div>
              </label>
              
              <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input type="radio" name="shipping" className="h-4 w-4 text-red-600 focus:ring-red-500" />
                <div className="ml-3">
                  <span className="block font-medium text-gray-800">Giao hàng nhanh</span>
                  <span className="block text-sm text-gray-600">1-2 ngày làm việc • 30,000 ₫</span>
                </div>
              </label>
              
              <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input type="radio" name="shipping" className="h-4 w-4 text-red-600 focus:ring-red-500" />
                <div className="ml-3">
                  <span className="block font-medium text-gray-800">Giao hàng trong ngày</span>
                  <span className="block text-sm text-gray-600">Trong ngày • 50,000 ₫</span>
                </div>
              </label>
            </div>
          </div>
        </div>
        
        <div>
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Đơn hàng</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Tạm tính</span>
                <span className="text-gray-800 font-medium">2,490,000 ₫</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phí vận chuyển</span>
                <span className="text-gray-800 font-medium">Miễn phí</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Giảm giá</span>
                <span className="text-green-600 font-medium">-100,000 ₫</span>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex justify-between text-lg font-bold">
                <span>Tổng cộng</span>
                <span className="text-red-600">2,390,000 ₫</span>
              </div>
            </div>
            
            <Payment />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;