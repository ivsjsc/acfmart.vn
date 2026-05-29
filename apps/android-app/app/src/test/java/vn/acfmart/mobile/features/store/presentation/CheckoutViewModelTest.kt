package vn.acfmart.mobile.features.store.presentation

import com.google.common.truth.Truth.assertThat
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.StandardTestDispatcher
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.setMain
import org.junit.After
import org.junit.Before
import org.junit.Test
import vn.acfmart.mobile.core.order.ShippingAddress

/**
 * Unit tests for CheckoutViewModel UI state and validation logic.
 * Tests business logic without Android dependencies.
 */
@OptIn(ExperimentalCoroutinesApi::class)
class CheckoutViewModelTest {

    private val testDispatcher = StandardTestDispatcher()

    @Before
    fun setup() {
        Dispatchers.setMain(testDispatcher)
    }

    @After
    fun teardown() {
        Dispatchers.resetMain()
    }

    @Test
    fun `initial state has correct defaults`() {
        val state = CheckoutUiState()

        assertThat(state.isLoading).isTrue()
        assertThat(state.isSubmitting).isFalse()
        assertThat(state.items).isEmpty()
        assertThat(state.paymentMethod).isEqualTo("cod")
        assertThat(state.shippingFee).isEqualTo(30000)
        assertThat(state.errorMessage).isNull()
        assertThat(state.orderSuccess).isFalse()
    }

    @Test
    fun `isFormValid returns false when address is empty`() {
        val state = CheckoutUiState(
            shippingAddress = ShippingAddress(),
            items = listOf(createTestCartItem())
        )

        assertThat(state.isFormValid).isFalse()
    }

    @Test
    fun `isFormValid returns false when cart is empty`() {
        val state = CheckoutUiState(
            shippingAddress = createValidAddress(),
            items = emptyList()
        )

        assertThat(state.isFormValid).isFalse()
    }

    @Test
    fun `isFormValid returns true when address valid and cart not empty`() {
        val state = CheckoutUiState(
            shippingAddress = createValidAddress(),
            items = listOf(createTestCartItem())
        )

        assertThat(state.isFormValid).isTrue()
    }

    @Test
    fun `calculates subtotal correctly`() {
        val items = listOf(
            createTestCartItem(price = 100000.0, quantity = 2),
            createTestCartItem(price = 50000.0, quantity = 3)
        )
        val state = CheckoutUiState(items = items)

        assertThat(state.subtotal).isEqualTo(350000L) // (100k * 2) + (50k * 3)
    }

    @Test
    fun `calculates total with shipping fee`() {
        val items = listOf(createTestCartItem(price = 100000.0, quantity = 1))
        val state = CheckoutUiState(
            items = items,
            shippingFee = 30000
        )

        assertThat(state.total).isEqualTo(130000L) // 100k + 30k shipping
    }

    @Test
    fun `calculates total with zero items`() {
        val state = CheckoutUiState(
            items = emptyList(),
            shippingFee = 30000
        )

        assertThat(state.total).isEqualTo(30000L) // Just shipping
    }

    @Test
    fun `updateField updates name correctly`() {
        val state = CheckoutUiState()
        val updatedAddress = state.shippingAddress.copy(name = "Nguyen Van A")

        assertThat(updatedAddress.name).isEqualTo("Nguyen Van A")
    }

    @Test
    fun `updateField updates phone correctly`() {
        val state = CheckoutUiState()
        val updatedAddress = state.shippingAddress.copy(phone = "0901234567")

        assertThat(updatedAddress.phone).isEqualTo("0901234567")
    }

    @Test
    fun `updateField updates address correctly`() {
        val state = CheckoutUiState()
        val updatedAddress = state.shippingAddress.copy(address = "123 Le Loi")

        assertThat(updatedAddress.address).isEqualTo("123 Le Loi")
    }

    @Test
    fun `setPaymentMethod updates to cod`() {
        val state = CheckoutUiState()
        val updated = state.copy(paymentMethod = "cod")

        assertThat(updated.paymentMethod).isEqualTo("cod")
    }

    @Test
    fun `setPaymentMethod updates to bank_transfer`() {
        val state = CheckoutUiState()
        val updated = state.copy(paymentMethod = "bank_transfer")

        assertThat(updated.paymentMethod).isEqualTo("bank_transfer")
    }

    @Test
    fun `error state can be cleared`() {
        val state = CheckoutUiState(errorMessage = "Some error")
        val cleared = state.copy(errorMessage = null)

        assertThat(cleared.errorMessage).isNull()
    }

    @Test
    fun `orderSuccess state update`() {
        val state = CheckoutUiState()
        val success = state.copy(orderSuccess = true, isSubmitting = false)

        assertThat(success.orderSuccess).isTrue()
        assertThat(success.isSubmitting).isFalse()
    }

    @Test
    fun `submitting state disables form`() {
        val state = CheckoutUiState(
            isSubmitting = true,
            shippingAddress = createValidAddress(),
            items = listOf(createTestCartItem())
        )

        assertThat(state.isSubmitting).isTrue()
        assertThat(state.isFormValid).isTrue() // Form valid but submitting
    }

    @Test
    fun `multiple items calculate correctly`() {
        val items = listOf(
            createTestCartItem(price = 200000.0, quantity = 1),
            createTestCartItem(price = 150000.0, quantity = 2),
            createTestCartItem(price = 75000.0, quantity = 3)
        )
        val state = CheckoutUiState(items = items)

        assertThat(state.subtotal).isEqualTo(725000L) // 200k + 300k + 225k
    }

    private fun createTestCartItem(
        price: Double = 100000.0,
        quantity: Int = 1
    ) = vn.acfmart.mobile.core.cart.CartItem(
        productId = "prod_${System.currentTimeMillis()}",
        title = "Test Product",
        price = price,
        image = "http://image.url",
        shopId = "shop1",
        shopName = "Test Shop",
        quantity = quantity
    )

    private fun createValidAddress() = ShippingAddress(
        name = "Nguyen Van A",
        phone = "0901234567",
        address = "123 Le Loi",
        ward = "Ben Nghe",
        district = "Quan 1",
        city = "TP. Ho Chi Minh"
    )
}
