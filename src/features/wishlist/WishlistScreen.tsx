import { Heart, Package, ShoppingBag, Star } from "lucide-react";
import { ProductCard } from "../../components/ProductCard";

const dummyProducts = [
  {
    id: "1",
    title: "Sữa rửa mặt chống giả Acnes",
    thumbnail: "/api/placeholder/300/300",
    price: 120000,
    originalPrice: 150000,
    rating: 4.5,
    reviewCount: 128,
    inStock: true,
    isVerified: true,
  },
  {
    id: "2",
    title: "Trà sữa Gong Cha vị đặc biệt",
    thumbnail: "/api/placeholder/300/300",
    price: 55000,
    originalPrice: 65000,
    rating: 4.8,
    reviewCount: 89,
    inStock: true,
    isVerified: true,
  },
  {
    id: "3",
    title: "Tai nghe Bluetooth chống nước",
    thumbnail: "/api/placeholder/300/300",
    price: 890000,
    originalPrice: 990000,
    rating: 4.2,
    reviewCount: 204,
    inStock: false,
    isVerified: true,
  },
];

export function WishlistScreen() {
  return (
    <div className="container-acf py-6 lg:py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">Danh sách yêu thích</h1>
        <p className="text-neutral-600">Những sản phẩm bạn đã lưu để mua sau</p>
      </div>

      {dummyProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-brand-red-50 p-4 text-brand-red-600">
            <Heart size={48} />
          </div>
          <h3 className="mt-4 text-xl font-bold text-neutral-900">Danh sách yêu thích trống</h3>
          <p className="mt-2 text-neutral-600">
            Những sản phẩm bạn thêm vào yêu thích sẽ hiển thị ở đây
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {dummyProducts.map((product) => (
            <ProductCard key={product.id} product={product as any} />
          ))}
        </div>
      )}

      <div className="mt-12 rounded-2xl border border-neutral-200 p-6">
        <h2 className="text-lg font-bold text-neutral-900">Gợi ý cho bạn</h2>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {dummyProducts.slice(0, 4).map((product) => (
            <div key={`suggest-${product.id}`} className="card overflow-hidden">
              <div className="aspect-square w-full overflow-hidden rounded-t-2xl bg-neutral-100">
                <img
                  src={product.thumbnail}
                  alt={product.title}
                  className="size-full object-cover"
                />
              </div>
              <div className="p-3">
                <h3 className="truncate text-sm font-semibold text-neutral-900">
                  {product.title}
                </h3>
                <div className="mt-2 flex items-center gap-1.5">
                  <Star size={12} className="fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-semibold text-neutral-700">
                    {product.rating}
                  </span>
                  <span className="text-xs text-neutral-500">
                    ({product.reviewCount})
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-bold text-neutral-900">
                    {product.price.toLocaleString("vi-VN")}₫
                  </span>
                  {product.originalPrice > product.price && (
                    <span className="text-xs text-neutral-500 line-through">
                      {product.originalPrice.toLocaleString("vi-VN")}₫
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}