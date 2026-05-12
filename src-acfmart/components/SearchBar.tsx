import React, { useState, useEffect } from 'react';
import { Search, X, Clock, MapPin, Filter } from 'lucide-react';
import { useStore, Category } from '../store';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function SearchBar({ onSearch, placeholder = "Tìm sản phẩm chính hãng...", autoFocus = false }: SearchBarProps) {
  const { products, setSearchQuery, searchQuery } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const saved = localStorage.getItem('recentSearches');
    return saved ? JSON.parse(saved) : [];
  });

  const categories: { id: Category; name: string }[] = [
    { id: 'thoi-trang-nam', name: 'Thời trang nam' },
    { id: 'thoi-trang-nu', name: 'Thời trang nữ' },
    { id: 'giay-dep-nam', name: 'Giày dép nam' },
    { id: 'giay-dep-nu', name: 'Giày dép nữ' },
    { id: 'dien-thoai-phu-kien', name: 'Điện thoại & Phụ kiện' },
    { id: 'thiet-bi-dien-tu', name: 'Thiết bị điện tử' },
    { id: 'may-tinh-laptop', name: 'Máy tính & Laptop' },
    { id: 'may-anh-may-quay-phim', name: 'Máy ảnh, máy quay' },
    { id: 'dong-ho', name: 'Đồng hồ' },
    { id: 'me-be', name: 'Mẹ & Bé' },
    { id: 'nha-cua-doi-song', name: 'Nhà cửa & Đời sống' },
    { id: 'sac-dep', name: 'Sắc đẹp' },
    { id: 'suc-khoe', name: 'Sức khỏe' },
  ];

  // Handle search input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.length > 0) {
      // Get suggestions based on product names
      const matches = products
        .filter(p => 
          p.name.toLowerCase().includes(value.toLowerCase()) ||
          p.category.toLowerCase().includes(value.toLowerCase())
        )
        .slice(0, 5)
        .map(p => p.name);
      
      setSuggestions(Array.from(new Set(matches)));
    } else {
      setSuggestions([]);
    }
  };

  // Handle search submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Add to recent searches
      if (!recentSearches.includes(searchQuery)) {
        const updatedSearches = [searchQuery, ...recentSearches].slice(0, 5);
        setRecentSearches(updatedSearches);
        localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
      }
      
      if (onSearch) {
        onSearch(searchQuery);
      }
      setIsOpen(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    if (!recentSearches.includes(suggestion)) {
      const updatedSearches = [suggestion, ...recentSearches].slice(0, 5);
      setRecentSearches(updatedSearches);
      localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
    }
    if (onSearch) {
      onSearch(suggestion);
    }
    setIsOpen(false);
  };

  // Handle recent search click
  const handleRecentSearchClick = (term: string) => {
    setSearchQuery(term);
    if (onSearch) {
      onSearch(term);
    }
    setIsOpen(false);
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setSuggestions([]);
  };

  return (
    <div className="relative w-full max-w-2xl">
      <form onSubmit={handleSearchSubmit} className="w-full">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className="w-full pl-10 pr-10 py-3 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent shadow-sm"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </form>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-96 overflow-y-auto">
          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="py-2">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Gợi ý tìm kiếm
              </div>
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <Search className="w-4 h-4 text-gray-400 mr-3" />
                  <span>{suggestion}</span>
                </div>
              ))}
            </div>
          )}

          {/* Recent Searches */}
          {recentSearches.length > 0 && searchQuery === '' && (
            <div className="py-2">
              <div className="px-4 py-2 flex justify-between items-center">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Tìm kiếm gần đây
                </div>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  Xóa tất cả
                </button>
              </div>
              {recentSearches.map((term, index) => (
                <div
                  key={index}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center"
                  onClick={() => handleRecentSearchClick(term)}
                >
                  <Clock className="w-4 h-4 text-gray-400 mr-3" />
                  <span>{term}</span>
                </div>
              ))}
            </div>
          )}

          {/* Categories */}
          {searchQuery === '' && (
            <div className="py-2">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Danh mục phổ biến
              </div>
              <div className="grid grid-cols-2 gap-1">
                {categories.slice(0, 6).map((cat) => (
                  <div
                    key={cat.id}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center"
                    onClick={() => {
                      setSearchQuery(cat.name);
                      if (onSearch) onSearch(cat.name);
                      setIsOpen(false);
                    }}
                  >
                    <MapPin className="w-4 h-4 text-gray-400 mr-3" />
                    <span>{cat.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Show recent searches if there are no suggestions */}
          {searchQuery === '' && recentSearches.length > 0 && (
            <div className="py-2 border-t border-gray-200">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Tìm kiếm gần đây
              </div>
              {recentSearches.map((term, index) => (
                <div
                  key={index}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center"
                  onClick={() => handleRecentSearchClick(term)}
                >
                  <Clock className="w-4 h-4 text-gray-400 mr-3" />
                  <span>{term}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}