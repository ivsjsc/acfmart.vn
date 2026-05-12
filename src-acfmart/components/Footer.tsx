import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export function Footer() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-slate-900 border-t-4 border-red-600 text-slate-300 py-12 px-4 md:px-8 mt-12 text-sm leading-relaxed">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-yellow-400 font-bold text-xl tracking-wider shrink-0 border border-yellow-400">
              ACF
            </div>
            <div>
              <h3 className="text-white font-bold text-lg leading-tight uppercase">TRUNG TÂM KỸ THUẬT<br/>CHỐNG HÀNG GIẢ ACF</h3>
            </div>
          </div>
          <p className="mb-2"><strong>Tổng đài Chống hàng giả:</strong> <span className="text-red-400 font-bold text-lg">1900.066.689</span></p>
          <p className="mb-2"><strong>Hotline:</strong> <span className="text-yellow-400 font-bold">097.173.6789</span></p>
          <p className="mb-2"><strong>Website:</strong> <a href="http://trungtamacf.vn" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">trungtamacf.vn</a></p>
          <p><strong>Email:</strong> trungtamacf@gmail.com</p>
          <div className="mt-4">
            <p className="mb-2"><strong>Quét mã Zalo Official:</strong></p>
            <a href="https://zalo.me/602410694205613404" target="_blank" rel="noreferrer">
              <img src="https://page-photo-qr.zdn.vn/1772420993/d28355475902b05ce913.jpg" alt="Zalo Official QR Code" className="w-24 h-24 bg-white p-1 rounded hover:opacity-80 transition-opacity" />
            </a>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
             <h4 className="text-white font-semibold uppercase mb-2 border-b border-slate-700 pb-1">{t('footer.offices.north.title')}</h4>
            <p><strong>{t('footer.offices.north.headquarters')}</strong> 59A Phố Quan Hoa, Phường Quan Hoa, Quận Cầu Giấy, Hà Nội</p>
            <p className="text-slate-400">{t('footer.offices.north.phone')}</p>
            <p className="text-slate-400">{t('footer.offices.north.email')}</p>
          </div>
          <div>
             <h4 className="text-white font-semibold uppercase mb-2 border-b border-slate-700 pb-1">{t('footer.offices.west.title')}</h4>
            <p><strong>{t('footer.offices.west.canTho')}</strong> Số 75 Huỳnh Cương, Phường Ninh Kiều, TP Cần Thơ</p>
            <p className="text-slate-400">{t('footer.offices.west.phone')}</p>
          </div>
        </div>

        <div className="space-y-4">
           <div>
            <h4 className="text-white font-semibold uppercase mb-2 border-b border-slate-700 pb-1">{t('footer.offices.south.title')}</h4>
            <p><strong>{t('footer.offices.south.headquarters')}</strong> Số 360 Lạc Long Quân, Phường 5, Quận 11, TP Hồ Chí Minh</p>
            <p className="text-slate-400">{t('footer.offices.south.phone')}</p>
            <p><strong>Văn phòng ĐD:</strong> Số 360 Lạc Long Quân, Phường 5, Quận 11, TP Hồ Chí Minh</p>
            <p className="text-slate-400">ĐT/Fax: 084.28.66860044</p>
          </div>
           <div>
            <p><strong>VP Đồng Nai:</strong> QL51B, Xã Long Thành, tỉnh Đồng Nai</p>
             <p className="text-slate-400">ĐT: 0901.422.227</p>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-slate-800 text-center text-slate-500 text-xs">
        <p>&copy; {new Date().getFullYear()} Sàn TMĐT Chính Hãng - Trung tâm kỹ thuật chống hàng giả ACF. All rights reserved.</p>
        <p className="mt-1">Nền tảng mua sắm an toàn, nói không với hàng giả, hàng nhái.</p>
        <p className="mt-2">Sàn đang được phát triển bởi <a href="https://ivsacademy.edu.vn" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">IVS</a></p>
        <p className="mt-1">Chịu trách nhiệm thực hiện: <a href="https://minhtriet.online" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">minhtriet.online</a></p>
      </div>
    </footer>
  );
}
