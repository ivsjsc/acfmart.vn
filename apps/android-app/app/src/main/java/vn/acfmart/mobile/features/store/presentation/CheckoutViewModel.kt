package vn.acfmart.mobile.features.store.presentation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await
import vn.acfmart.mobile.core.cart.CartItem
import vn.acfmart.mobile.core.cart.CartRepository
import vn.acfmart.mobile.core.order.DefaultWarehouse
import vn.acfmart.mobile.core.order.OrderRepository
import vn.acfmart.mobile.core.order.ShippingAddress
import javax.inject.Inject

data class CheckoutUiState(
    val isLoading: Boolean = true,
    val isSubmitting: Boolean = false,
    val items: List<CartItem> = emptyList(),
    val shippingAddress: ShippingAddress = ShippingAddress(),
    val paymentMethod: String = "cod",
    val shippingFee: Int = 30000,
    val errorMessage: String? = null,
    val orderSuccess: Boolean = false
) {
    val subtotal: Long get() = items.sumOf { it.lineTotal.toLong() }
    val total: Long get() = subtotal + shippingFee
    val isFormValid: Boolean get() = shippingAddress.isValid() && items.isNotEmpty()
}

@HiltViewModel
class CheckoutViewModel @Inject constructor(
    private val orderRepository: OrderRepository,
    private val cartRepository: CartRepository,
    private val auth: FirebaseAuth,
    private val db: FirebaseFirestore
) : ViewModel() {

    private val _uiState = MutableStateFlow(CheckoutUiState())
    val uiState: StateFlow<CheckoutUiState> = _uiState.asStateFlow()

    init {
        loadUserProfile()
        observeCartItems()
    }

    private fun loadUserProfile() {
        viewModelScope.launch {
            try {
                val uid = auth.currentUser?.uid ?: return@launch
                val userDoc = db.collection("users").document(uid).get().await()
                if (userDoc.exists()) {
                    val name = userDoc.getString("name") ?: userDoc.getString("displayName") ?: ""
                    val phone = userDoc.getString("phone") ?: ""
                    val email = auth.currentUser?.email ?: ""

                    _uiState.update { state ->
                        state.copy(
                            isLoading = false,
                            shippingAddress = state.shippingAddress.copy(
                                name = name.ifBlank { auth.currentUser?.displayName ?: "" },
                                phone = phone
                            )
                        )
                    }
                } else {
                    _uiState.update { it.copy(isLoading = false) }
                }
            } catch (e: Exception) {
                // Không chặn checkout nếu không load được profile
                _uiState.update { it.copy(isLoading = false) }
            }
        }
    }

    private fun observeCartItems() {
        viewModelScope.launch {
            cartRepository.observeItems().collect { items ->
                _uiState.update { it.copy(items = items, isLoading = false) }
            }
        }
    }

    fun updateShippingAddress(address: ShippingAddress) {
        _uiState.update { it.copy(shippingAddress = address) }
    }

    fun updateField(field: String, value: String) {
        _uiState.update { state ->
            val updatedAddress = when (field) {
                "name" -> state.shippingAddress.copy(name = value)
                "phone" -> state.shippingAddress.copy(phone = value)
                "address" -> state.shippingAddress.copy(address = value)
                "ward" -> state.shippingAddress.copy(ward = value)
                "district" -> state.shippingAddress.copy(district = value)
                "city" -> state.shippingAddress.copy(city = value)
                else -> state.shippingAddress
            }
            state.copy(shippingAddress = updatedAddress)
        }
    }

    fun setPaymentMethod(method: String) {
        _uiState.update { it.copy(paymentMethod = method) }
    }

    fun placeOrder(customerNote: String? = null) {
        val state = _uiState.value
        if (!state.isFormValid) {
            _uiState.update { it.copy(errorMessage = "Vui lòng điền đầy đủ thông tin giao hàng") }
            return
        }
        if (state.items.isEmpty()) {
            _uiState.update { it.copy(errorMessage = "Giỏ hàng trống") }
            return
        }

        viewModelScope.launch {
            _uiState.update { it.copy(isSubmitting = true, errorMessage = null) }
            try {
                orderRepository.createOrder(
                    items = state.items,
                    shippingAddress = state.shippingAddress,
                    paymentMethod = state.paymentMethod,
                    shippingOrigin = DefaultWarehouse.SHIPPING_ORIGIN,
                    shippingFee = state.shippingFee,
                    customerNote = customerNote
                )

                // Xóa giỏ hàng sau khi đặt thành công
                cartRepository.clear()

                _uiState.update {
                    it.copy(
                        isSubmitting = false,
                        orderSuccess = true,
                        errorMessage = null
                    )
                }
            } catch (e: Exception) {
                _uiState.update {
                    it.copy(
                        isSubmitting = false,
                        errorMessage = "Đặt hàng thất bại: ${e.localizedMessage ?: "Lỗi không xác định"}"
                    )
                }
            }
        }
    }

    fun clearError() {
        _uiState.update { it.copy(errorMessage = null) }
    }
}
