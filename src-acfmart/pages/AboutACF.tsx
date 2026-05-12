import React from 'react';
import { ShieldCheck, Scale, FileText, PhoneCall, Building, Network, ArrowRight, BookOpen, Users, Briefcase } from 'lucide-react';

export function AboutACF() {
  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 space-y-12">
      {/* Sơ đồ pháp lý */}
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-black text-[#000080] uppercase">Sơ đồ pháp lý & Tổ chức</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">Tổng quan về Trung tâm Kỹ thuật chống hàng giả ACF</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Sơ đồ quan hệ Visual */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-100 flex flex-col justify-center items-center">
            
            <div className="w-full max-w-md relative pb-12 pt-6">
              {/* Quỹ CHG */}
              <div className="bg-red-600 text-white p-4 rounded-xl shadow-md z-10 relative flex items-center justify-center space-x-2 w-56 mx-auto">
                <ShieldCheck className="w-6 h-6" />
                <span className="font-bold">Quỹ Chống hàng giả (CHG)</span>
              </div>
              
              <div className="h-10 w-1 bg-red-300 mx-auto -mt-2 relative z-0"></div>

              {/* ACF */}
              <div className="bg-[#000080] text-white p-5 rounded-xl shadow-lg z-10 relative flex flex-col items-center justify-center space-y-2 w-72 mx-auto border-4 border-yellow-400">
                <span className="font-black text-xl tracking-wider text-yellow-400 text-center">TRUNG TÂM ACF</span>
                <div className="border-t border-white/30 pt-2 w-full text-center">
                  <span className="text-xs">Đơn vị trực thuộc • Pháp nhân độc lập <br/>Hoạt động phi lợi nhuận</span>
                  <div className="text-[10px] mt-1 opacity-80">(CN: Hà Nội, TP.HCM, Đồng Nai, Cần Thơ)</div>
                </div>
              </div>

              <div className="flex justify-between w-full px-12 -mt-4 relative z-0">
                <div className="w-1/2 h-16 border-l-2 border-b-2 border-gray-300 rounded-bl-xl"></div>
                <div className="w-1/2 h-16 border-r-2 border-b-2 border-gray-300 rounded-br-xl"></div>
              </div>

              <div className="flex justify-between mt-2 px-4 space-x-4">
                {/* Cơ quan Nhà nước */}
                <div className="bg-slate-100 text-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 text-center w-1/2 text-sm font-bold flex flex-col items-center">
                  <Building className="w-6 h-6 mb-2 text-slate-600" />
                  Cơ quan Nhà nước
                  <span className="text-[11px] font-normal text-slate-500 mt-1">Phối hợp & Báo cáo</span>
                </div>
                
                {/* Doanh nghiệp & Người tiêu dùng */}
                <div className="bg-slate-100 text-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 text-center w-1/2 text-sm font-bold flex flex-col items-center">
                  <Users className="w-6 h-6 mb-2 text-slate-600" />
                  Doanh nghiệp & NTD
                  <span className="text-[11px] font-normal text-slate-500 mt-1">Bảo vệ & Hỗ trợ pháp lý</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-start space-x-4">
              <div className="bg-red-50 p-3 rounded-lg text-red-600 shrink-0">
                <Scale className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 uppercase mb-2">Cơ sở pháp lý</h3>
                <ul className="text-sm text-gray-600 space-y-1.5 list-disc pl-4">
                  <li><strong>Nghị quyết 41/2025:</strong> tăng cường chống buôn lậu, gian lận thương mại, hàng giả.</li>
                  <li><strong>Nghị định 98/2020/NĐ-CP:</strong> xử phạt hành chính trong thương mại, sản xuất, buôn bán hàng giả.</li>
                  <li><strong>Điều 192 BLHS:</strong> quy định tội sản xuất, buôn bán hàng giả.</li>
                </ul>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-start space-x-4">
              <div className="bg-blue-50 p-3 rounded-lg text-blue-600 shrink-0">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 uppercase mb-2">Chức năng & Nhiệm vụ</h3>
                <ul className="text-sm text-gray-600 space-y-1.5 list-disc pl-4">
                  <li>Tiếp nhận phản ánh qua <strong>Tổng đài 24/7</strong>.</li>
                  <li><strong>Tư vấn pháp lý</strong> cho doanh nghiệp, cá nhân.</li>
                  <li>Tổ chức NCKH, hội nghị, hội thảo, tập huấn.</li>
                  <li>Là <strong>cầu nối</strong> giữa cơ quan Nhà nước và doanh nghiệp.</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-start space-x-4">
              <div className="bg-green-50 p-3 rounded-lg text-green-600 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 uppercase mb-2">Quyền hạn</h3>
                <ul className="text-sm text-gray-600 space-y-1.5 list-disc pl-4">
                  <li>Được phép giao dịch, ký kết hợp tác.</li>
                  <li>Thực hiện các hoạt động nghiên cứu, tư vấn.</li>
                  <li>Có quyền đại diện pháp lý trong lĩnh vực chống hàng giả.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Đối tác */}
      <div className="bg-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12 uppercase">ĐỐI TÁC</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 items-center justify-items-center">
            <div className="flex items-center justify-center w-full h-20 md:h-24 p-4 bg-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300 border border-gray-100">
              <img alt="Đối tác 1" className="max-w-full max-h-full object-contain filter grayscale hover:grayscale-0 hover:brightness-110 transition-all duration-300" src="https://www.trungtamacf.vn/wp-content/uploads/2025/04/1.png" />
            </div>
            <div className="flex items-center justify-center w-full h-20 md:h-24 p-4 bg-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300 border border-gray-100">
              <img alt="Đối tác 2" className="max-w-full max-h-full object-contain filter grayscale hover:grayscale-0 hover:brightness-110 transition-all duration-300" src="https://www.trungtamacf.vn/wp-content/uploads/2025/04/1.png" />
            </div>
            <div className="flex items-center justify-center w-full h-20 md:h-24 p-4 bg-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300 border border-gray-100">
              <img alt="Đối tác 3" className="max-w-full max-h-full object-contain filter grayscale hover:grayscale-0 hover:brightness-110 transition-all duration-300" src="https://www.trungtamacf.vn/wp-content/uploads/2025/04/2.png" />
            </div>
            <div className="flex items-center justify-center w-full h-20 md:h-24 p-4 bg-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300 border border-gray-100">
              <img alt="Đối tác 4" className="max-w-full max-h-full object-contain filter grayscale hover:grayscale-0 hover:brightness-110 transition-all duration-300" src="https://www.trungtamacf.vn/wp-content/uploads/2025/04/3.png" />
            </div>
            <div className="flex items-center justify-center w-full h-20 md:h-24 p-4 bg-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300 border border-gray-100">
              <img alt="Đối tác 5" className="max-w-full max-h-full object-contain filter grayscale hover:grayscale-0 hover:brightness-110 transition-all duration-300" src="https://www.trungtamacf.vn/wp-content/uploads/2025/04/5.png" />
            </div>
            <div className="flex items-center justify-center w-full h-20 md:h-24 p-4 bg-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300 border border-gray-100">
              <img alt="Đối tác 6" className="max-w-full max-h-full object-contain filter grayscale hover:grayscale-0 hover:brightness-110 transition-all duration-300" src="https://www.trungtamacf.vn/wp-content/uploads/2025/04/6.png" />
            </div>
            <div className="flex items-center justify-center w-full h-20 md:h-24 p-4 bg-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300 border border-gray-100">
              <img alt="Đối tác 7" className="max-w-full max-h-full object-contain filter grayscale hover:grayscale-0 hover:brightness-110 transition-all duration-300" src="https://www.trungtamacf.vn/wp-content/uploads/2025/04/7.png" />
            </div>
            <div className="flex items-center justify-center w-full h-20 md:h-24 p-4 bg-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300 border border-gray-100">
              <img alt="Đối tác 8" className="max-w-full max-h-full object-contain filter grayscale hover:grayscale-0 hover:brightness-110 transition-all duration-300" src="https://www.trungtamacf.vn/wp-content/uploads/2025/08/FECPI-scaled.jpg" />
            </div>
            <div className="flex items-center justify-center w-full h-20 md:h-24 p-4 bg-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300 border border-gray-100">
              <img alt="Đối tác 9" className="max-w-full max-h-full object-contain filter grayscale hover:grayscale-0 hover:brightness-110 transition-all duration-300" src="/photos/ivsjsc.png" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
