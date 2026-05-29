package vn.acfmart.mobile.features.store.presentation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import vn.acfmart.mobile.core.cart.CartItem
import vn.acfmart.mobile.core.cart.CartRepository
import javax.inject.Inject

data class CartUiState(
    val isLoading: Boolean = true,
    val items: List<CartItem> = emptyList(),
    val errorMessage: String? = null
)

@HiltViewModel
class CartViewModel @Inject constructor(
    private val repository: CartRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(CartUiState())
    val uiState: StateFlow<CartUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            repository.observeItems()
                .catch { e ->
                    _uiState.update { it.copy(isLoading = false, errorMessage = "Không thể tải giỏ hàng: ${e.message}") }
                }
                .collect { items ->
                    _uiState.update { it.copy(isLoading = false, items = items, errorMessage = null) }
                }
        }
    }

    fun updateQuantity(productId: String, quantity: Int) {
        viewModelScope.launch {
            runCatching { repository.setQuantity(productId, quantity) }
        }
    }

    fun remove(productId: String) {
        viewModelScope.launch { runCatching { repository.removeItem(productId) } }
    }

    fun clear() {
        viewModelScope.launch { runCatching { repository.clear() } }
    }
}
