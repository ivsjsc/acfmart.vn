package vn.acfmart.mobile.core.cart

import com.google.firebase.firestore.DocumentSnapshot

/**
 * Một dòng trong giỏ hàng. Lưu tại `carts/{uid}/items/{productId}` (Firestore
 * rules: isUserOwner). Mang đủ field để sau này gom đơn theo shop khi checkout.
 */
data class CartItem(
    val productId: String,
    val title: String,
    val price: Double,
    val image: String,
    val shopId: String,
    val shopName: String,
    val quantity: Int
) {
    val lineTotal: Double get() = price * quantity

    fun toMap(): Map<String, Any> = mapOf(
        "productId" to productId,
        "title" to title,
        "price" to price,
        "image" to image,
        "shopId" to shopId,
        "shopName" to shopName,
        "quantity" to quantity
    )
}

fun DocumentSnapshot.toCartItem(): CartItem = CartItem(
    productId = getString("productId") ?: id,
    title = getString("title").orEmpty(),
    price = getDouble("price") ?: 0.0,
    image = getString("image").orEmpty(),
    shopId = getString("shopId").orEmpty(),
    shopName = getString("shopName").orEmpty(),
    quantity = (getLong("quantity") ?: 1L).toInt()
)
