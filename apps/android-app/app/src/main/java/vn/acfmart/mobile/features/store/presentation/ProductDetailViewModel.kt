package vn.acfmart.mobile.features.store.presentation

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import vn.acfmart.mobile.core.cart.CartItem
import vn.acfmart.mobile.core.cart.CartRepository
import vn.acfmart.mobile.features.home.data.Product
import vn.acfmart.mobile.features.home.data.ProductRepository
import javax.inject.Inject

/**
 * UI state cho màn chi tiết sản phẩm. Dữ liệu lấy THẬT từ Firestore.
 */
data class ProductDetailUiState(
    val isLoading: Boolean = true,
    val product: Product? = null,
    val errorMessage: String? = null,
    val cartMessage: String? = null
)

@HiltViewModel
class ProductDetailViewModel @Inject constructor(
    private val repository: ProductRepository,
    private val cartRepository: CartRepository,
    savedStateHandle: SavedStateHandle
) : ViewModel() {

    // route: store/product/{id}
    private val productId: String = savedStateHandle.get<String>("id").orEmpty()

    private val _uiState = MutableStateFlow(ProductDetailUiState())
    val uiState: StateFlow<ProductDetailUiState> = _uiState.asStateFlow()

    init {
        load()
    }

    fun load() {
        if (productId.isBlank()) {
            _uiState.update { it.copy(isLoading = false, errorMessage = "Thiếu mã sản phẩm.") }
            return
        }
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, errorMessage = null) }
            try {
                val product = repository.getProductById(productId)
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        product = product,
                        errorMessage = if (product == null) "Không tìm thấy sản phẩm." else null
                    )
                }
            } catch (e: Exception) {
                _uiState.update {
                    it.copy(isLoading = false, errorMessage = "Không thể tải sản phẩm: ${e.message}")
                }
            }
        }
    }

    fun addToCart(quantity: Int = 1) {
        val product = _uiState.value.product ?: return
        viewModelScope.launch {
            try {
                cartRepository.addItem(
                    CartItem(
                        productId = product.id,
                        title = product.name,
                        price = product.price,
                        image = product.imageUrl,
                        shopId = product.shopId,
                        shopName = product.shopName,
                        quantity = quantity
                    )
                )
                _uiState.update { it.copy(cartMessage = "Đã thêm vào giỏ hàng") }
            } catch (e: Exception) {
                _uiState.update { it.copy(cartMessage = e.message ?: "Không thể thêm vào giỏ") }
            }
        }
    }

    fun clearCartMessage() = _uiState.update { it.copy(cartMessage = null) }
}
