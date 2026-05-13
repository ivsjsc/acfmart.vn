export default function ProductCard({ product }: { product: Product }) {
  const [isHovered, setIsHovered] = useState(false);

  // 防御性检查：确保 images 是数组且不为空
  const firstImage = Array.isArray(product.images) && product.images.length > 0 
    ? product.images[0] 
    : "https://placehold.co/600x400";

  return (
    <Link
      to={`/products/${product.handle}`}
      className="group card overflow-hidden transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden bg-neutral-100">
        <img
          src={firstImage}
          alt={product.title}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
        {product.discount > 0 && (
          <span className="absolute left-2 top-2 rounded-md bg-brand-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
            -{product.discount}%
          </span>
        )}
        {product.verified && (
          <span className="absolute right-2 top-2 rounded-md bg-brand-gold-500/95 px-1.5 py-0.5 text-[10px] font-bold text-white">
            ✓ Chính hãng
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="line-clamp-2 text-xs font-medium text-neutral-900 group-hover:text-brand-red-600">
          {product.title}
        </h3>
        <div className="mt-1.5 flex items-baseline gap-1">
          <span className="text-sm font-bold text-brand-red-600">
            {formatCurrency(product.price)}
          </span>
        </div>
        {product.originalPrice && product.originalPrice > product.price && (
          <div className="text-[10px] text-neutral-400 line-through">
            {formatCurrency(product.originalPrice)}
          </div>
        )}
        <div className="mt-1.5 flex items-center justify-between text-[10px] text-neutral-500">
          <span>⭐ {product.rating}</span>
          <span>Đã bán {product.sold.toLocaleString("vi-VN")}</span>
        </div>
      </div>
    </Link>
  );
}