package vn.acfmart.mobile.core.cart

import com.google.common.truth.Truth.assertThat
import org.junit.Test

/**
 * Unit tests for CartItem calculations and data mapping.
 */
class CartItemTest {

    @Test
    fun `lineTotal calculates correctly`() {
        val item = CartItem(
            productId = "prod1",
            title = "Test Product",
            price = 100000.0,
            image = "http://image.url",
            shopId = "shop1",
            shopName = "Test Shop",
            quantity = 3
        )

        assertThat(item.lineTotal).isEqualTo(300000.0)
    }

    @Test
    fun `lineTotal with quantity 1`() {
        val item = CartItem(
            productId = "prod1",
            title = "Test Product",
            price = 50000.0,
            image = "http://image.url",
            shopId = "shop1",
            shopName = "Test Shop",
            quantity = 1
        )

        assertThat(item.lineTotal).isEqualTo(50000.0)
    }

    @Test
    fun `toMap produces correct structure`() {
        val item = CartItem(
            productId = "prod123",
            title = "Samsung Galaxy",
            price = 5000000.0,
            image = "http://image.url",
            shopId = "shop456",
            shopName = "Tech Store",
            quantity = 2
        )

        val map = item.toMap()

        assertThat(map).containsKey("productId")
        assertThat(map).containsKey("title")
        assertThat(map).containsKey("price")
        assertThat(map).containsKey("image")
        assertThat(map).containsKey("shopId")
        assertThat(map).containsKey("shopName")
        assertThat(map).containsKey("quantity")
        assertThat(map["productId"]).isEqualTo("prod123")
        assertThat(map["title"]).isEqualTo("Samsung Galaxy")
        assertThat(map["price"]).isEqualTo(5000000.0)
        assertThat(map["quantity"]).isEqualTo(2)
        assertThat(map).hasSize(7)
    }

    @Test
    fun `cart items can be grouped by shopId`() {
        val items = listOf(
            CartItem(
                productId = "p1",
                title = "Product 1",
                price = 100.0,
                image = "",
                shopId = "shopA",
                shopName = "Shop A",
                quantity = 1
            ),
            CartItem(
                productId = "p2",
                title = "Product 2",
                price = 200.0,
                image = "",
                shopId = "shopB",
                shopName = "Shop B",
                quantity = 2
            ),
            CartItem(
                productId = "p3",
                title = "Product 3",
                price = 150.0,
                image = "",
                shopId = "shopA",
                shopName = "Shop A",
                quantity = 3
            )
        )

        val grouped = items.groupBy { it.shopId }

        assertThat(grouped).hasSize(2)
        assertThat(grouped["shopA"]?.size).isEqualTo(2)
        assertThat(grouped["shopB"]?.size).isEqualTo(1)
    }

    @Test
    fun `calculate subtotal from cart items`() {
        val items = listOf(
            CartItem(
                productId = "p1",
                title = "Product 1",
                price = 100000.0,
                image = "",
                shopId = "shop1",
                shopName = "Shop 1",
                quantity = 2
            ),
            CartItem(
                productId = "p2",
                title = "Product 2",
                price = 50000.0,
                image = "",
                shopId = "shop1",
                shopName = "Shop 1",
                quantity = 3
            )
        )

        val subtotal = items.sumOf { it.lineTotal.toLong() }

        assertThat(subtotal).isEqualTo(350000L) // (100k * 2) + (50k * 3)
    }

    @Test
    fun `filter empty cart`() {
        val emptyCart = emptyList<CartItem>()

        assertThat(emptyCart.isEmpty()).isTrue()
        assertThat(emptyCart.sumOf { it.lineTotal.toLong() }).isEqualTo(0L)
    }
}
