'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';

const slides = [
  {
    id: 1,
    title: 'Mua sắm an tâm',
    subtitle: 'Sản phẩm 100% chính hãng',
    description: 'ACFMart kiểm duyệt nghiêm ngặt mọi sản phẩm. Hoàn tiền 100% nếu phát hiện hàng giả.',
    gradient: 'from-[#E31937] via-red-600 to-orange-500',
    badges: ['100% Chính hãng', 'Bảo hành uy tín', 'Hoàn tiền 100%'],
  },
  {
    id: 2,
    title: 'Xác thực QR thông minh',
    subtitle: 'Quét mã — Biết ngay thật giả',
    description: 'Mỗi sản phẩm có mã QR riêng. Quét ngay để xác thực nguồn gốc trong vài giây.',
    gradient: 'from-red-700 via-[#E31937] to-pink-600',
    badges: ['QR độc quyền', 'Xác thực tức thì', 'Minh bạch nguồn gốc'],
  },
  {
    id: 3,
    title: 'Cộng đồng mua sắm',
    subtitle: 'Chia sẻ — Kết nối — Kiếm thêm',
    description: 'Tham gia cộng đồng hơn 50.000 thành viên. Chia sẻ trải nghiệm và nhận hoa hồng hấp dẫn.',
    gradient: 'from-orange-500 via-red-600 to-[#E31937]',
    badges: ['50k+ thành viên', 'Affiliate hấp dẫn', 'Cộng đồng uy tín'],
  },
];

export function HeroBanner() {
  const [current, setCurrent] = useState(0);

  // Tự động chuyển slide mỗi 4 giây
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[current];

  return (
    <div className={`relative rounded-2xl overflow-hidden bg-gradient-to-r ${slide.gradient} text-white p-8 mb-6 min-h-[220px] flex items-center`}>
      {/* Content */}
      <div className="flex-1 animate-fade-in">
        <p className="text-red-200 text-sm font-medium mb-1">{slide.subtitle}</p>
        <h2 className="text-3xl font-black mb-2 leading-tight">{slide.title}</h2>
        <p className="text-red-100 text-sm mb-4 max-w-md">{slide.description}</p>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-5">
          {slide.badges.map((badge) => (
            <span key={badge} className="flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full">
              <CheckCircle size={12} /> {badge}
            </span>
          ))}
        </div>

        <button className="bg-white text-[#E31937] font-bold px-6 py-2.5 rounded-full hover:bg-red-50 transition-colors text-sm">
          Khám phá ngay →
        </button>
      </div>

      {/* Decorative circle */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 w-40 h-40 bg-white/10 rounded-full blur-xl pointer-events-none" />
      <div className="absolute right-16 top-6 w-24 h-24 bg-white/10 rounded-full pointer-events-none" />

      {/* Navigation arrows */}
      <button
        onClick={() => setCurrent((c) => (c - 1 + slides.length) % slides.length)}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center transition-colors"
      >
        <ChevronLeft size={16} />
      </button>
      <button
        onClick={() => setCurrent((c) => (c + 1) % slides.length)}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center transition-colors"
      >
        <ChevronRight size={16} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-white w-6' : 'bg-white/50'}`}
          />
        ))}
      </div>
    </div>
  );
}
