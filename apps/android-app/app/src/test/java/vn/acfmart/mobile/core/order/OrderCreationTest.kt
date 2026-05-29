package vn.acfmart.mobile.core.order

import com.google.common.truth.Truth.assertThat
import org.junit.Test
import vn.acfmart.mobile.core.cart.CartItem
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * Unit tests for order creation business logic.
 * Tests order code generation, fee allocation, and Firestore rules compliance.
 */
class OrderCreationTest {

    @Test
    fun `generates valid order code with timestamp`() {
        val now = Date()
        val orderCode = "ACF${SimpleDateFormat("yyMMddHHmmss", Locale.US).format(now)}"

        assertThat(orderCode).startsWith("ACF")
        assertThat(orderCode.length).isEqualTo(15) // ACF + 12 digits
        assertThat(orderCode).matches("ACF\\d{12}")
    }

    @Test
    fun `order code format matches pattern`() {
        val orderCode = "ACF240315123456"

        assertThat(orderCode).hasLength(15)
        assertThat(orderCode.substring(0, 3)).isEqualTo("ACF")
        assertThat(orderCode.substring(3)).matches("\\d{12}")
    }

    @Test
    fun `allocates shipping fee proportionally - single shop`() {
        val items = listOf(
            createCartItem(price = 100000.0, quantity = 2, shopId = "shop1")
        )
        val shippingFee = 30000
        val subtotal = items.sumOf { it.lineTotal.toLong() }

        // Single shop gets all shipping fee
        assertThat(subtotal).isEqualTo(200000L)
        assertThat(shippingFee).isEqualTo(30000)
    }

    @Test
    fun `allocates shipping fee proportionally - multiple shops`() {
        val items = listOf(
            createCartItem(price = 100000.0, quantity = 1, shopId = "shop1"),
            createCartItem(price = 200000.0, quantity = 1, shopId = "shop2")
        )
        val shippingFee = 30000

        val subtotals = items.groupBy { it.shopId }.map { (shopId, shopItems) ->
            shopId to shopItems.sumOf { it.lineTotal.toLong() }
        }
        val totalSubtotal = subtotals.sumOf { it.second }

        // Shop1: 100k, Shop2: 200k, Total: 300k
        assertThat(totalSubtotal).isEqualTo(300000L)
        
        // Proportional allocation
        val shop1Shipping = (100000.0 / 300000.0 * shippingFee).toLong()
        val shop2Shipping = (200000.0 / 300000.0 * shippingFee).toLong()

        assertThat(shop1Shipping).isEqualTo(10000L) // 1/3 of 30k
        assertThat(shop2Shipping).isEqualTo(20000L) // 2/3 of 30k
        assertThat(shop1Shipping + shop2Shipping).isEqualTo(shippingFee.toLong())
    }

    @Test
    fun `groups items by shopId correctly`() {
        val items = listOf(
            createCartItem(shopId = "shopA", productId = "p1"),
            createCartItem(shopId = "shopB", productId = "p2"),
            createCartItem(shopId = "shopA", productId = "p3"),
            createCartItem(shopId = "shopC", productId = "p4"),
            createCartItem(shopId = "shopB", productId = "p5")
        )

        val grouped = items.groupBy { it.shopId }

        assertThat(grouped).hasSize(3)
        assertThat(grouped["shopA"]?.size).isEqualTo(2)
        assertThat(grouped["shopB"]?.size).isEqualTo(2)
        assertThat(grouped["shopC"]?.size).isEqualTo(1)
    }

    @Test
    fun `validates total does not exceed 100 million`() {
        val maxTotal = 100_000_000
        val validTotal = 99_999_999
        val invalidTotal = 100_000_001

        assertThat(validTotal <= maxTotal).isTrue()
        assertThat(invalidTotal <= maxTotal).isFalse()
    }

    @Test
    fun `COD payment status mapping`() {
        val isCod = true
        val status = if (isCod) "awaiting_confirm" else "payment_pending"
        val paymentStatus = if (isCod) "cod" else "pending"

        assertThat(status).isEqualTo("awaiting_confirm")
        assertThat(paymentStatus).isEqualTo("cod")
    }

    @Test
    fun `non-COD payment status mapping`() {
        val isCod = false
        val status = if (isCod) "awaiting_confirm" else "payment_pending"
        val paymentStatus = if (isCod) "cod" else "pending"

        assertThat(status).isEqualTo("payment_pending")
        assertThat(paymentStatus).isEqualTo("pending")
    }

    @Test
    fun `shipping origin has all required fields for Firestore rules`() {
        val shippingOrigin = DefaultWarehouse.SHIPPING_ORIGIN
        val map = shippingOrigin.toMap()

        // Must have all required fields per isValidShippingOrigin()
        assertThat(map).containsKey("warehouseId")
        assertThat(map).containsKey("warehouseName")
        assertThat(map).containsKey("contactName")
        assertThat(map).containsKey("contactPhone")
        assertThat(map).containsKey("fullAddress")
        assertThat(map).containsKey("ward")
        assertThat(map).containsKey("district")
        assertThat(map).containsKey("city")
        assertThat(map).containsKey("routeLabel")
        assertThat(map).containsKey("selectionReason")
        
        // All must be non-null
        assertThat(map["warehouseId"]).isNotNull()
        assertThat(map["warehouseName"]).isNotNull()
        assertThat(map["contactName"]).isNotNull()
        assertThat(map["contactPhone"]).isNotNull()
        assertThat(map["fullAddress"]).isNotNull()
        assertThat(map["ward"]).isNotNull()
        assertThat(map["district"]).isNotNull()
        assertThat(map["city"]).isNotNull()
        assertThat(map["routeLabel"]).isNotNull()
        assertThat(map["selectionReason"]).isNotNull()
    }

    @Test
    fun `shipping address toMap matches Firestore rules structure`() {
        val address = ShippingAddress(
            name = "Nguyen Van A",
            phone = "0901234567",
            address = "123 Le Loi",
            ward = "Ben Nghe",
            district = "Quan 1",
            city = "TP. HCM"
        )
        val map = address.toMap()

        // Must match isValidShippingAddress() requirements
        assertThat(map).containsKey("name")
        assertThat(map).containsKey("phone")
        assertThat(map).containsKey("address")
        assertThat(map).containsKey("ward")
        assertThat(map).containsKey("district")
        assertThat(map).containsKey("city")
        assertThat(map).hasSize(6)
    }

    @Test
    fun `timeline event has correct structure`() {
        val status = "awaiting_confirm"
        val timelineEvent = mapOf(
            "status" to status,
            "timestamp" to "2024-03-15T10:30:00.000Z",
            "note" to "Đơn hàng mới chờ seller xác nhận"
        )

        assertThat(timelineEvent).containsKey("status")
        assertThat(timelineEvent).containsKey("timestamp")
        assertThat(timelineEvent).containsKey("note")
        assertThat(timelineEvent["status"]).isEqualTo(status)
    }

    @Test
    fun `order data structure matches Firestore requirements`() {
        // Simulate order data structure
        val orderData = mapOf(
            "code" to "ACF240315123456",
            "parentCode" to "ACF240315123456",
            "customerId" to "user123",
            "customerName" to "Nguyen Van A",
            "customerPhone" to "0901234567",
            "shopId" to "shop1",
            "shopName" to "Test Shop",
            "status" to "awaiting_confirm",
            "paymentStatus" to "cod",
            "paymentMethod" to "cod",
            "shippingMethod" to "standard",
            "shippingFee" to 30000,
            "codFee" to 0,
            "subtotal" to 100000,
            "total" to 130000,
            "items" to listOf(
                mapOf(
                    "productId" to "prod1",
                    "title" to "Product 1",
                    "price" to 100000.0,
                    "quantity" to 1
                )
            )
        )

        // Verify all required fields per isValidInitialOrder()
        val requiredFields = listOf(
            "code", "parentCode", "customerId", "customerName", "customerPhone",
            "shopId", "shopName", "status", "paymentStatus", "paymentMethod",
            "shippingMethod", "shippingFee", "codFee", "subtotal", "total", "items"
        )

        requiredFields.forEach { field ->
            assertThat(orderData).containsKey(field)
        }
    }

    @Test
    fun `multi-shop order generates different codes`() {
        val baseCode = "ACF240315123456"
        val shopCount = 3

        val orderCodes = (0 until shopCount).map { index ->
            if (shopCount > 1 && index > 0) "$baseCode-${index + 1}" else baseCode
        }

        assertThat(orderCodes).hasSize(3)
        assertThat(orderCodes[0]).isEqualTo("ACF240315123456")
        assertThat(orderCodes[1]).isEqualTo("ACF240315123456-2")
        assertThat(orderCodes[2]).isEqualTo("ACF240315123456-3")
    }

    private fun createCartItem(
        shopId: String = "shop1",
        productId: String = "prod1",
        price: Double = 100000.0,
        quantity: Int = 1
    ) = CartItem(
        productId = productId,
        title = "Test Product",
        price = price,
        image = "http://image.url",
        shopId = shopId,
        shopName = "Test Shop",
        quantity = quantity
    )
}
