import React from 'react';

interface CategoryNavProps {
  activeCategory?: string;
  onSelectCategory: (category: string) => void;
}

export function CategoryNav({ activeCategory, onSelectCategory }: CategoryNavProps) {
  const categories = [
    { id: 'fashion-men', name: 'Thời Trang Nam' },
    { id: 'fashion-women', name: 'Thời Trang Nữ' },
    { id: 'shoes-men', name: 'Giày Dép Nam' },
    { id: 'shoes-women', name: 'Giày Dép Nữ' },
    { id: 'electronics', name: 'Điện Thoại & Phụ Kiện' },
    { id: 'computers', name: 'Máy Tính & Laptop' },
    { id: 'cameras', name: 'Máy Ảnh & Máy Quay Phim' },
    { id: 'watches', name: 'Đồng Hồ' },
    { id: 'kids', name: 'Mẹ & Bé' },
    { id: 'home', name: 'Nhà Cửa & Đời Sống' },
    { id: 'beauty', name: 'Sắc Đẹp' },
    { id: 'health', name: 'Sức Khỏe' }
  ];

  return (
    <nav className="flex gap-2 overflow-x-auto py-2">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelectCategory(cat.id)}
          className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${
            activeCategory === cat.id
              ? 'bg-red-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {cat.name}
        </button>
      ))}
    </nav>
  );
}
