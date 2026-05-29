package vn.acfmart.mobile.core.order

import com.google.firebase.firestore.DocumentSnapshot

/**
 * Trạng thái đơn gom nhóm cho người mua (map từ SellerOrderStatus của backend,
 * khớp `toBuyerStatus` bên web order-service.ts).
 */
enum class BuyerOrderStatus(val label: String) {
    PENDING("Chờ xác nhận"),
    PROCESSING("Đang xử lý"),
    SHIPPING("Đang giao"),
    DELIVERED("Đã giao"),
    CANCELLED("Đã hủy");

    companion object {
        fun fromRaw(raw: String?): BuyerOrderStatus = when (raw) {
            "payment_pending", "awaiting_confirm", "pending" -> PENDING
            "confirmed", "packed", "ready_pickup" -> PROCESSING
            "shipping", "out_for_delivery" -> SHIPPING
            "delivered", "completed" -> DELIVERED
            "cancelled", "returned", "refunded", "return_requested" -> CANCELLED
            else -> PENDING
        }
    }
}

data class BuyerOrderItem(
    val productId: String,
    val title: String,
    val image: String,
    val price: Double,
    val quantity: Int
)

data class BuyerOrder(
    val id: String,
    val code: String,
    val rawStatus: String,
    val status: BuyerOrderStatus,
    val shopName: String,
    val total: Double,
    val items: List<BuyerOrderItem>,
    val createdAtMillis: Long
) {
    /** Đơn chỉ huỷ được khi backend còn cho phép (khớp isCustomerOrderCancelUpdate). */
    val cancellable: Boolean get() = rawStatus == "payment_pending" || rawStatus == "awaiting_confirm"
}

@Suppress("UNCHECKED_CAST")
fun DocumentSnapshot.toBuyerOrder(): BuyerOrder {
    val rawItems = get("items") as? List<*> ?: emptyList<Any>()
    val items = rawItems.filterIsInstance<Map<String, Any?>>().map { m ->
        BuyerOrderItem(
            productId = (m["productId"] as? String).orEmpty(),
            title = (m["title"] as? String).orEmpty(),
            image = (m["image"] as? String).orEmpty(),
            price = (m["price"] as? Number)?.toDouble() ?: 0.0,
            quantity = (m["quantity"] as? Number)?.toInt() ?: 0
        )
    }
    val raw = getString("status").orEmpty()
    return BuyerOrder(
        id = id,
        code = getString("code") ?: id,
        rawStatus = raw,
        status = BuyerOrderStatus.fromRaw(raw),
        shopName = getString("shopName") ?: "Shop",
        total = (getDouble("total") ?: 0.0),
        items = items,
        createdAtMillis = getTimestamp("created_at")?.toDate()?.time ?: 0L
    )
}
