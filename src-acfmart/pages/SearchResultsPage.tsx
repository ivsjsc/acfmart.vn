import { useEffect, useState } from 'react';
import { Star, Filter, Grid, List, Search } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useStore, Product } from '../store';
import { ProductCard } from '../components/ProductCard';

export const SearchResultsPage = () => {
  const location = useLocation();
  const { products, addToCart } = useStore();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'relevance' | 'price-low' | 'price-high' | 'top-rated' | 'newest'>('relevance');
  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: 10000000,
    category: '',
    rating: 0,
    inStock: false,
    freeShipping: false,
    officialStore: false
  });

  // Extract query from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchQuery = params.get('q') || '';
    setQuery(searchQuery);
    
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  }, [location]);

  // Filter and sort products
  useEffect(() => {
    if (!query) {
      setFilteredProducts([]);
      return;
    }
    
    let results = [...products];
    
    // Apply search query
    if (query) {
      results = results.filter(product => 
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase()) ||
        product.description?.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    // Apply filters
    results = results.filter(product => {
      // Price filter
      if (product.price < filters.minPrice || product.price > filters.maxPrice) return false;
      
      // Category filter
      if (filters.category && product.category !== filters.category) return false;
      
      // Rating filter
      if (filters.rating > 0 && (product.commercialInfo?.averageRating || 0) < filters.rating) return false;
      
      // In stock filter
      if (filters.inStock && (product.stock || 0) <= 0) return false;
      
      // Free shipping filter
      if (filters.freeShipping && !product.commercialInfo?.freeShipping) return false;
      
      // Official store filter
      if (filters.officialStore && !product.labelInfo?.officialStore) return false;
      
      return true;
    });
    
    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        results.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        results.sort((a, b) => b.price - a.price);
        break;
      case 'top-rated':
        results.sort((a, b) => (b.commercialInfo?.averageRating || 0) - (a.commercialInfo?.averageRating || 0));
        break;
      case 'newest':
        results.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        break;
      case 'relevance':
        // For now, just keep original order, in real app this would be sorted by relevance
        break;
    }
    
    setFilteredProducts(results);
  }, [query, products, sortBy, filters]);

  // Update filters
  const updateFilter = (filterName: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      minPrice: 0,
      maxPrice: 10000000,
      category: '',
      rating: 0,
      inStock: false,
      freeShipping: false,
      officialStore: false
    });
  };

  // Render star ratings
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tìm kiếm sản phẩm...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="container mx-auto px-4 py-6">
        {/* Search Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Kết quả tìm kiếm cho: <span className="text-red-600">"{query}"</span>
          </h1>
          <p className="text-gray-600">{filteredProducts.length} sản phẩm được tìm thấy</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-xl shadow p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900 flex items-center">
                  <Filter className="w-5 h-5 mr-2" />
                  Bộ lọc
                </h2>
                <button 
                  className="text-sm text-red-600"
                  onClick={resetFilters}
                >
                  Đặt lại
                </button>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3">Khoảng giá</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="range"
                      min="0"
                      max="10000000"
                      step="100000"
                      value={filters.minPrice}
                      onChange={(e) => updateFilter('minPrice', Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {filters.minPrice.toLocaleString('vi-VN')} ₫
                    </span>
                    <span className="text-sm text-gray-600">
                      {filters.maxPrice.toLocaleString('vi-VN')} ₫
                    </span>
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3">Danh mục</h3>
                <div className="space-y-2">
                  {['Điện tử', 'Thời trang', 'Nhà cửa', 'Làm đẹp', 'Mẹ & Bé', 'Thể thao', 'Sách'].map((cat, idx) => (
                    <div key={idx} className="flex items-center">
                      <input
                        type="radio"
                        id={`cat-${idx}`}
                        name="category"
                        checked={filters.category === cat}
                        onChange={() => updateFilter('category', cat)}
                        className="mr-2"
                      />
                      <label htmlFor={`cat-${idx}`} className="text-gray-700">{cat}</label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3">Đánh giá</h3>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map(star => (
                    <div key={star} className="flex items-center">
                      <input
                        type="radio"
                        id={`rating-${star}`}
                        name="rating"
                        checked={filters.rating === star}
                        onChange={() => updateFilter('rating', star)}
                        className="mr-2"
                      />
                      <label htmlFor={`rating-${star}`} className="flex items-center text-gray-700">
                        {renderStars(star)}
                        <span className="ml-1">trở lên</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Other filters */}
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="in-stock"
                    checked={filters.inStock}
                    onChange={(e) => updateFilter('inStock', e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="in-stock" className="text-gray-700">Còn hàng</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="free-shipping"
                    checked={filters.freeShipping}
                    onChange={(e) => updateFilter('freeShipping', e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="free-shipping" className="text-gray-700">Miễn phí giao hàng</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="official-store"
                    checked={filters.officialStore}
                    onChange={(e) => updateFilter('officialStore', e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="official-store" className="text-gray-700">Cửa hàng chính hãng</label>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:w-3/4">
            {/* Sort Controls */}
            <div className="bg-white rounded-xl shadow p-4 mb-6 flex flex-wrap items-center justify-between">
              <div className="text-sm text-gray-600 mb-2 sm:mb-0">
                {filteredProducts.length} sản phẩm
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Sắp xếp theo:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="relevance">Liên quan nhất</option>
                  <option value="price-low">Giá: Thấp đến cao</option>
                  <option value="price-high">Giá: Cao đến thấp</option>
                  <option value="top-rated">Đánh giá cao nhất</option>
                  <option value="newest">Mới nhất</option>
                </select>
                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    className={`p-2 ${viewMode === 'grid' ? 'bg-red-600 text-white' : 'bg-white text-gray-700'}`}
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    className={`p-2 ${viewMode === 'list' ? 'bg-red-600 text-white' : 'bg-white text-gray-700'}`}
                    onClick={() => setViewMode('list')}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Products */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-xl shadow p-12 text-center">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy sản phẩm</h3>
                <p className="text-gray-600 mb-6">Không có sản phẩm nào phù hợp với tìm kiếm của bạn</p>
                <button 
                  className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg"
                  onClick={resetFilters}
                >
                  Xem sản phẩm khác
                </button>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' 
                : 'space-y-6'
              }>
                {filteredProducts.map(product => (
                  <ProductCard 
                    product={product} 
                    onAddToCart={addToCart}
                    onQuickView={() => console.log('Quick view:', product.id)}
                    onReportCounterfeit={() => console.log('Report counterfeit:', product.id)}
                    onVerifyQR={() => console.log('Verify QR:', product.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
