package vn.acfmart.mobile.features.home.presentation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import vn.acfmart.mobile.features.home.data.Product
import vn.acfmart.mobile.features.home.data.ProductRepository
import javax.inject.Inject

/**
 * UI State cho Home Screen
 */
data class HomeUiState(
    val isLoading: Boolean = false,
    val categories: List<vn.acfmart.mobile.features.home.data.Category> = emptyList(),
    val products: List<Product> = emptyList(),
    val selectedCategoryId: String? = null,
    val searchQuery: String = "",
    val isSearching: Boolean = false,
    val errorMessage: String? = null
)

/**
 * ViewModel cho Home Screen -遵循 MVVM pattern
 * 
 * Quản lý:
 * - Danh sách categories
 * - Danh sách products (có thể filter theo category)
 * - Search functionality
 * - Loading & error states
 */
@HiltViewModel
class HomeViewModel @Inject constructor(
    private val repository: ProductRepository
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(HomeUiState())
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()
    
    init {
        loadCategories()
        loadProducts()
    }
    
    /**
     * Load categories từ repository
     */
    private fun loadCategories() {
        viewModelScope.launch {
            try {
                val categories = repository.getCategories()
                _uiState.update { it.copy(categories = categories) }
            } catch (e: Exception) {
                _uiState.update { 
                    it.copy(errorMessage = "Không thể tải danh mục: ${e.message}")
                }
            }
        }
    }
    
    /**
     * Load products (có thể filter theo category)
     */
    private fun loadProducts(categoryId: String? = null) {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, errorMessage = null) }
            try {
                val products = repository.getProducts(categoryId)
                _uiState.update { 
                    it.copy(
                        products = products,
                        isLoading = false,
                        selectedCategoryId = categoryId
                    )
                }
            } catch (e: Exception) {
                _uiState.update { 
                    it.copy(
                        isLoading = false,
                        errorMessage = "Không thể tải sản phẩm: ${e.message}"
                    )
                }
            }
        }
    }
    
    /**
     * Search products
     */
    fun searchProducts(query: String) {
        if (query.isBlank()) {
            // Nếu query rỗng, load lại products bình thường
            loadProducts(_uiState.value.selectedCategoryId)
            _uiState.update { it.copy(searchQuery = "", isSearching = false) }
            return
        }
        
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, searchQuery = query, isSearching = true) }
            try {
                val results = repository.searchProducts(query)
                _uiState.update { 
                    it.copy(
                        products = results,
                        isLoading = false
                    )
                }
            } catch (e: Exception) {
                _uiState.update { 
                    it.copy(
                        isLoading = false,
                        errorMessage = "Tìm kiếm thất bại: ${e.message}"
                    )
                }
            }
        }
    }
    
    /**
     * Chọn category và filter products
     */
    fun selectCategory(categoryId: String?) {
        if (categoryId == _uiState.value.selectedCategoryId) {
            // Bỏ chọn category
            loadProducts(null)
        } else {
            // Chọn category mới
            loadProducts(categoryId)
        }
        // Clear search khi chọn category
        _uiState.update { it.copy(searchQuery = "", isSearching = false) }
    }
    
    /**
     * Clear error message
     */
    fun clearError() {
        _uiState.update { it.copy(errorMessage = null) }
    }
    
    /**
     * Navigate to product detail (sẽ implement ở Phase 2+)
     */
    fun onProductClick(product: Product) {
        // TODO: Navigate to ProductDetail screen
        // Event sẽ được handle trong Composable
    }
    
    /**
     * Navigate to cart (sẽ implement ở Phase 2+)
     */
    fun onCartClick() {
        // TODO: Navigate to Cart screen
    }
}
