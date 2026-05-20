import Link from 'next/link';
import Image from 'next/image';
import { Star, ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  comparePrice?: number;
  thumbnail: string;
  rating: number;
  reviewCount: number;
  soldCount: number;
  shopName: string;
  shopLogo?: string;
  isVerified?: boolean;
}

// Format tiền Việt Nam
function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

export function ProductCard({
  id, name, price, comparePrice, thumbnail, rating,
  reviewCount, soldCount, shopName, shopLogo, isVerified = true,
}: ProductCardProps) {
  const discountPercent = comparePrice ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;

  return (
    <Link href={`/products/${id}`} className="card-product group block">
      {/* Thumbnail */}
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        <Image
          src={thumbnail}
          alt={name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Badge chính hãng */}
        <span className="badge-authentic absolute top-2 left-2">Chính hãng</span>
        {discountPercent > 0 && (
          <span className="absolute top-2 right-2 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
            -{discountPercent}%
          </span>
        )}
        {/* Nút thêm giỏ hàng */}
        <button
          onClick={(e) => { e.preventDefault(); console.log('add to cart:', id); }}
          className="absolute bottom-2 right-2 w-8 h-8 bg-[#E31937] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-700"
        >
          <ShoppingCart size={14} className="text-white" />
        </button>
      </div>

      {/* Info */}
      <div className="p-3">
        {/* Shop */}
        <div className="flex items-center gap-1.5 mb-1">
          {shopLogo ? (
            <Image src={shopLogo} alt={shopName} width={16} height={16} className="rounded-full" />
          ) : (
            <div className="w-4 h-4 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-[8px] text-[#E31937] font-bold">{shopName[0]}</span>
            </div>
          )}
          <span className="text-[10px] text-gray-500 truncate">{shopName}</span>
          {isVerified && <span className="text-[8px] text-green-600 font-bold">✓ Đã xác thực</span>}
        </div>

        {/* Tên sản phẩm */}
        <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-2 leading-tight">{name}</h3>

        {/* Giá */}
        <div className="flex items-baseline gap-1.5 mb-2">
          <span className="text-base font-bold text-[#E31937]">{formatVND(price)}</span>
          {comparePrice && (
            <span className="text-xs text-gray-400 line-through">{formatVND(comparePrice)}</span>
          )}
        </div>

        {/* Rating & sold */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-0.5">
            <Star size={11} className="fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{rating.toFixed(1)}</span>
            <span className="text-gray-400">({reviewCount})</span>
          </div>
          <span>Đã bán {soldCount.toLocaleString('vi-VN')}</span>
        </div>
      </div>
    </Link>
  );
}
