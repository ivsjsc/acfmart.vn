package vn.acfmart.mobile.features.account.presentation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import vn.acfmart.mobile.core.order.BuyerOrder
import vn.acfmart.mobile.core.order.OrderRepository
import javax.inject.Inject

data class OrdersUiState(
    val isLoading: Boolean = true,
    val orders: List<BuyerOrder> = emptyList(),
    val errorMessage: String? = null,
    val actionMessage: String? = null
)

@HiltViewModel
class OrdersViewModel @Inject constructor(
    private val repository: OrderRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(OrdersUiState())
    val uiState: StateFlow<OrdersUiState> = _uiState.asStateFlow()

    init {
        observe()
    }

    private fun observe() {
        viewModelScope.launch {
            repository.observeMyOrders()
                .catch { e ->
                    _uiState.update {
                        it.copy(isLoading = false, errorMessage = "Không thể tải đơn hàng: ${e.message}")
                    }
                }
                .collect { orders ->
                    _uiState.update { it.copy(isLoading = false, orders = orders, errorMessage = null) }
                }
        }
    }

    fun cancelOrder(order: BuyerOrder) {
        viewModelScope.launch {
            try {
                repository.cancelOrder(order)
                _uiState.update { it.copy(actionMessage = "Đã huỷ đơn ${order.code}") }
            } catch (e: Exception) {
                _uiState.update { it.copy(actionMessage = "Huỷ đơn thất bại: ${e.message}") }
            }
        }
    }

    fun clearActionMessage() = _uiState.update { it.copy(actionMessage = null) }
}
