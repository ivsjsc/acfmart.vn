import Link from 'next/link';

// 8 danh mục chính hiển thị dạng icon grid
const categories = [
  { label: 'Thời trang', emoji: '👗', slug: 'thoi-trang', count: 1243 },
  { label: 'Điện thoại', emoji: '📱', slug: 'dien-thoai', count: 856 },
  { label: 'Điện tử', emoji: '💻', slug: 'dien-tu', count: 723 },
  { label: 'Nhà cửa', emoji: '🏠', slug: 'nha-cua', count: 512 },
  { label: 'Làm đẹp', emoji: '💄', slug: 'lam-dep', count: 943 },
  { label: 'Sức khỏe', emoji: '🌿', slug: 'suc-khoe', count: 387 },
  { label: 'Thể thao', emoji: '⚽', slug: 'the-thao', count: 268 },
  { label: 'Phụ kiện', emoji: '👶', slug: 'phu-kien', count: 431 },
];

export function CategoryGrid() {
  return (
    <div className="mb-6">
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/categories/${cat.slug}`}
            className="flex flex-col items-center gap-1.5 p-3 bg-white rounded-xl border border-gray-100 hover:border-[#E31937] hover:shadow-sm transition-all group"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">{cat.emoji}</span>
            <span className="text-xs font-medium text-gray-700 text-center leading-tight">{cat.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
