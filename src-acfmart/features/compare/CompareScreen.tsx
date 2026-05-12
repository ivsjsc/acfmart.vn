import { Package, ShieldCheck, ArrowLeft, Trash2 } from "lucide-react";

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
    brand: "Acnes",
    features: {
      "Loại da": "Da dầu, Da hỗn hợp",
      "Dung tích": "100ml",
      "Thành phần": "Salicylic Acid, Zinc",
      "Xuất xứ": "Nhật Bản"
    }
  },
  {
    id: "2",
    title: "Sữa rửa mặt ngừa mụn Clean & Clear",
    thumbnail: "/api/placeholder/300/300",
    price: 95000,
    originalPrice: 110000,
    rating: 4.3,
    reviewCount: 205,
    inStock: true,
    isVerified: true,
    brand: "Clean & Clear",
    features: {
      "Loại da": "Da mụn",
      "Dung tích": "150ml",
      "Thành phần": "Salicylic Acid",
      "Xuất xứ": "Mỹ"
    }
  },
  {
    id: "3",
    title: "Sữa rửa mặt dịu nhẹ Cetaphil",
    thumbnail: "/api/placeholder/300/300",
    price: 180000,
    originalPrice: 200000,
    rating: 4.7,
    reviewCount: 312,
    inStock: true,
    isVerified: true,
    brand: "Cetaphil",
    features: {
      "Loại da": "Da nhạy cảm",
      "Dung tích": "236ml",
      "Thành phần": "Pro-Vitamin B5",
      "Xuất xứ": "Mỹ"
    }
  }
];

export function CompareScreen() {
  if (dummyProducts.length === 0) {
    return (
      <div className="container-acf py-16">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-gold-100 text-brand-gold-600">
            <Package size={28} />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">So sánh sản phẩm</h1>
          <p className="mt-2 text-sm text-neutral-600">
            Bạn chưa chọn sản phẩm nào để so sánh. Thêm sản phẩm vào để bắt đầu so sánh.
          </p>
        </div>
      </div>
    );
  }

  const allFeatures = new Set();
  dummyProducts.forEach(product => {
    Object.keys(product.features).forEach(feature => allFeatures.add(feature));
  });

  return (
    <div className="container-acf py-6 lg:py-10">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">So sánh sản phẩm</h1>
            <p className="text-neutral-600">So sánh {dummyProducts.length} sản phẩm đã chọn</p>
          </div>
          <button className="btn-secondary flex items-center gap-2">
            <ArrowLeft size={16} />
            Tiếp tục mua sắm
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="border-b border-neutral-200">
              <th className="bg-neutral-50 p-4 text-left text-sm font-semibold text-neutral-900">Thông số</th>
              {dummyProducts.map((product) => (
                <th key={product.id} className="bg-neutral-50 p-4 text-center">
                  <div className="relative mx-auto max-w-[240px]">
                    <button 
                      className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                      title="Xóa khỏi so sánh"
                    >
                      <Trash2 size={12} />
                    </button>
                    <div className="flex flex-col items-center">
                      <div className="mb-2 aspect-square w-full overflow-hidden rounded-lg bg-neutral-100">
                        <img
                          src={product.thumbnail}
                          alt={product.title}
                          className="size-full object-cover"
                        />
                      </div>
                      <h3 className="text-center text-xs font-semibold text-neutral-900 line-clamp-2">
                        {product.title}
                      </h3>
                      <div className="mt-1 flex items-center gap-1">
                        {product.isVerified && (
                          <ShieldCheck size={12} className="text-brand-red-600" />
                        )}
                        <span className="text-xs font-semibold text-brand-red-600">
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
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-neutral-100">
              <td className="p-4 font-medium text-neutral-700">Đánh giá</td>
              {dummyProducts.map((product) => (
                <td key={product.id} className="p-4 text-center">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`h-3 w-3 ${
                              i < Math.floor(product.rating)
                                ? "text-yellow-400"
                                : "text-neutral-300"
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-xs text-neutral-600">
                        {product.rating} ({product.reviewCount})
                      </span>
                    </div>
                  </div>
                </td>
              ))}
            </tr>
            
            <tr className="border-b border-neutral-100 bg-neutral-50">
              <td className="p-4 font-medium text-neutral-700">Tình trạng</td>
              {dummyProducts.map((product) => (
                <td key={product.id} className="p-4 text-center">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                      product.inStock
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {product.inStock ? "Còn hàng" : "Hết hàng"}
                  </span>
                </td>
              ))}
            </tr>

            <tr className="border-b border-neutral-100">
              <td className="p-4 font-medium text-neutral-700">Thương hiệu</td>
              {dummyProducts.map((product) => (
                <td key={product.id} className="p-4 text-center text-sm text-neutral-600">
                  {product.brand}
                </td>
              ))}
            </tr>

            {Array.from(allFeatures).map((feature, idx) => (
              <tr 
                key={String(feature)} 
                className={`${idx % 2 === 0 ? 'bg-neutral-50' : ''} border-b border-neutral-100`}
              >
                <td className="p-4 font-medium text-neutral-700">{String(feature)}</td>
                {dummyProducts.map((product) => (
                  <td key={product.id} className="p-4 text-center text-sm text-neutral-600">
                    {product.features[feature as keyof typeof product.features] || "-"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 flex justify-center gap-4">
        <button className="btn-primary">Chọn mua sản phẩm</button>
        <button className="btn-secondary">Xóa danh sách so sánh</button>
      </div>
    </div>
  );
}