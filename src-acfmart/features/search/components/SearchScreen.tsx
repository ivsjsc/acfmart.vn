import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ScrollView, Image, Platform } from 'react-native';
import { colors, semanticColors, spacing, typography, radius } from '../../../design-system/tokens';

interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: Date;
}

interface SearchResult {
  id: string;
  name: string;
  price: number;
  discountPrice: number;
  rating: number;
  reviewCount: number;
  image: string;
  isVerified: boolean;
  category: string;
}

const SearchScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([
    { id: '1', query: 'son dưỡng môi', timestamp: new Date(Date.now() - 86400000) },
    { id: '2', query: 'tai nghe không dây', timestamp: new Date(Date.now() - 172800000) },
    { id: '3', query: 'mặt nạ thiên nhiên', timestamp: new Date(Date.now() - 259200000) },
  ]);
  
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(true);
  const [trendingSearches] = useState<string[]>([
    'son chống nắng', 'sữa rửa mặt', 'tai nghe bluetooth', 
    'balo chống nước', 'nước hoa chính hãng', 'mỹ phẩm organic'
  ]);

  // Mock data for search results
  const mockProducts: SearchResult[] = [
    {
      id: '1',
      name: 'Son dưỡng môi thiên nhiên SPF 15 - Đỏ Ruby',
      price: 250000,
      discountPrice: 180000,
      rating: 4.8,
      reviewCount: 1240,
      image: 'https://via.placeholder.com/150',
      isVerified: true,
      category: 'Mỹ phẩm'
    },
    {
      id: '2',
      name: 'Tai nghe không dây chống ồn - Model X Pro',
      price: 1200000,
      discountPrice: 990000,
      rating: 4.6,
      reviewCount: 876,
      image: 'https://via.placeholder.com/150',
      isVerified: true,
      category: 'Điện tử'
    },
    {
      id: '3',
      name: 'Mặt nạ dưỡng da thiên nhiên - Vitamin C',
      price: 350000,
      discountPrice: 280000,
      rating: 4.7,
      reviewCount: 542,
      image: 'https://via.placeholder.com/150',
      isVerified: true,
      category: 'Mỹ phẩm'
    },
    {
      id: '4',
      name: 'Balo chống nước thời trang - Size L',
      price: 450000,
      discountPrice: 360000,
      rating: 4.5,
      reviewCount: 321,
      image: 'https://via.placeholder.com/150',
      isVerified: true,
      category: 'Phụ kiện'
    },
  ];

  useEffect(() => {
    if (searchQuery.length > 0) {
      // Filter products based on search query
      const filtered = mockProducts.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filtered);
      setShowSuggestions(false);
    } else {
      setShowSuggestions(true);
    }
  }, [searchQuery]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Add to search history
      const newItem: SearchHistoryItem = {
        id: Date.now().toString(),
        query: searchQuery,
        timestamp: new Date()
      };
      setSearchHistory(prev => [newItem, ...prev.slice(0, 9)]); // Keep only last 10 items
      setShowSuggestions(false);
    }
  };

  const handleClearHistory = () => {
    setSearchHistory([]);
  };

  const handleSuggestionPress = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
  };

  const renderSearchResult = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity style={styles.resultItem}>
      <Image source={{ uri: item.image }} style={styles.resultImage} />
      <View style={styles.resultInfo}>
        <Text style={styles.resultName} numberOfLines={2}>{item.name}</Text>
        <View style={styles.resultMeta}>
          <Text style={styles.resultPrice}>{item.discountPrice.toLocaleString('vi-VN')}₫</Text>
          {item.price !== item.discountPrice && (
            <Text style={styles.resultOriginalPrice}>{item.price.toLocaleString('vi-VN')}₫</Text>
          )}
          <View style={styles.ratingContainer}>
            <Text style={styles.rating}>⭐ {item.rating}</Text>
            <Text style={styles.reviewCount}>({item.reviewCount})</Text>
          </View>
        </View>
        <View style={styles.resultFooter}>
          <Text style={styles.category}>{item.category}</Text>
          {item.isVerified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>🛡️ Chính hãng</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderHistoryItem = ({ item }: { item: SearchHistoryItem }) => (
    <TouchableOpacity 
      style={styles.historyItem} 
      onPress={() => handleSuggestionPress(item.query)}
    >
      <Text style={styles.historyText}>{item.query}</Text>
      <TouchableOpacity>
        <Text style={styles.deleteIcon}>✕</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            placeholder="Tìm kiếm sản phẩm, thương hiệu..."
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              style={styles.clearButton} 
              onPress={() => setSearchQuery('')}
            >
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity 
          style={styles.cancelButton} 
          onPress={() => {
            setSearchQuery('');
            setShowSuggestions(true);
          }}
        >
          <Text style={styles.cancelButtonText}>Hủy</Text>
        </TouchableOpacity>
      </View>

      {showSuggestions ? (
        <ScrollView style={styles.suggestionsContainer}>
          {/* Trending Searches */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Tìm kiếm phổ biến</Text>
            <View style={styles.trendingContainer}>
              {trendingSearches.map((search, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.trendingChip}
                  onPress={() => handleSuggestionPress(search)}
                >
                  <Text style={styles.trendingText}>{search}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Recent Searches */}
          {searchHistory.length > 0 && (
            <View style={styles.sectionContainer}>
              <View style={styles.historyHeader}>
                <Text style={styles.sectionTitle}>Tìm kiếm gần đây</Text>
                <TouchableOpacity onPress={handleClearHistory}>
                  <Text style={styles.clearHistoryText}>Xóa</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={searchHistory}
                renderItem={renderHistoryItem}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
              />
            </View>
          )}
        </ScrollView>
      ) : (
        <View style={styles.resultsContainer}>
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsCount}>
              {searchResults.length} sản phẩm cho "{searchQuery}"
            </Text>
          </View>
          <FlatList
            data={searchResults}
            renderItem={renderSearchResult}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: semanticColors.surface.base,
    paddingTop: spacing[6],
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    backgroundColor: colors.brand.red[500],
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[50],
    borderRadius: radius.full,
    paddingHorizontal: spacing[4],
    marginRight: spacing[3],
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing[3],
    fontSize: typography.body.md.fontSize,
    color: semanticColors.text.primary,
  },
  clearButton: {
    padding: spacing[1],
  },
  clearButtonText: {
    fontSize: 18,
    color: semanticColors.text.muted,
  },
  cancelButton: {
    padding: spacing[2],
  },
  cancelButtonText: {
    fontSize: typography.body.md.fontSize,
    color: colors.neutral[50],
    fontWeight: '600',
  },
  suggestionsContainer: {
    flex: 1,
    paddingHorizontal: spacing[4],
  },
  sectionContainer: {
    marginTop: spacing[5],
  },
  sectionTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: '600',
    color: semanticColors.text.primary,
    marginBottom: spacing[3],
  },
  trendingContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  trendingChip: {
    backgroundColor: colors.neutral[100],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: radius.full,
    marginRight: spacing[2],
    marginBottom: spacing[2],
  },
  trendingText: {
    fontSize: typography.body.sm.fontSize,
    color: semanticColors.text.secondary,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  clearHistoryText: {
    color: colors.danger[500],
    fontSize: typography.body.sm.fontSize,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: semanticColors.border.divider,
  },
  historyText: {
    fontSize: typography.body.md.fontSize,
    color: semanticColors.text.primary,
    flex: 1,
  },
  deleteIcon: {
    fontSize: 18,
    color: semanticColors.text.muted,
  },
  resultsContainer: {
    flex: 1,
  },
  resultsHeader: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: semanticColors.border.divider,
  },
  resultsCount: {
    fontSize: typography.body.md.fontSize,
    color: semanticColors.text.secondary,
  },
  resultItem: {
    flexDirection: 'row',
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: semanticColors.border.divider,
    backgroundColor: colors.neutral[50],
  },
  resultImage: {
    width: 80,
    height: 80,
    borderRadius: radius.md,
    resizeMode: 'contain',
  },
  resultInfo: {
    flex: 1,
    marginLeft: spacing[3],
  },
  resultName: {
    fontSize: typography.body.md.fontSize,
    lineHeight: typography.body.md.lineHeight,
    color: semanticColors.text.primary,
    marginBottom: spacing[1],
  },
  resultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[1],
  },
  resultPrice: {
    fontSize: typography.body.md.fontSize,
    fontWeight: '600',
    color: colors.danger[600],
    marginRight: spacing[2],
  },
  resultOriginalPrice: {
    fontSize: typography.caption.fontSize,
    color: semanticColors.text.muted,
    textDecorationLine: 'line-through',
    marginRight: spacing[2],
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  rating: {
    fontSize: typography.body.sm.fontSize,
    color: colors.warning[500],
  },
  reviewCount: {
    fontSize: typography.body.sm.fontSize,
    color: semanticColors.text.muted,
    marginLeft: spacing[1],
  },
  resultFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing[1],
  },
  category: {
    fontSize: typography.body.sm.fontSize,
    color: semanticColors.text.muted,
  },
  verifiedBadge: {
    backgroundColor: colors.success[500],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: radius.full,
  },
  verifiedText: {
    fontSize: typography.caption.fontSize,
    color: colors.neutral[50],
    fontWeight: '600',
  },
});

export default SearchScreen;