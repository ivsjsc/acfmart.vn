package vn.acfmart.mobile.core.order

import com.google.firebase.firestore.DocumentSnapshot
import com.google.firebase.firestore.FieldValue

/**
 * Địa chỉ giao hàng — khớp isValidShippingAddress() trong Firestore rules.
 */
data class ShippingAddress(
    val name: String = "",
    val phone: String = "",
    val address: String = "",
    val ward: String = "",
    val district: String = "",
    val city: String = ""
) {
    fun isValid(): Boolean {
        return name.isNotBlank() &&
                phone.matches(Regex("^[0-9+()\\-\\s]{8,20}$")) &&
                address.isNotBlank() &&
                ward.isNotBlank() &&
                district.isNotBlank() &&
                city.isNotBlank()
    }

    fun toMap(): Map<String, Any> = mapOf(
        "name" to name,
        "phone" to phone,
        "address" to address,
        "ward" to ward,
        "district" to district,
        "city" to city
    )
}

/**
 * Kho hàng xuất phát — khớp isValidShippingOrigin() trong Firestore rules.
 */
data class ShippingOrigin(
    val warehouseId: String,
    val warehouseName: String,
    val contactName: String,
    val contactPhone: String,
    val fullAddress: String,
    val ward: String,
    val district: String,
    val city: String,
    val routeLabel: String,
    val latitude: Double? = null,
    val longitude: Double? = null,
    val distanceKm: Double? = null,
    val selectionReason: String = "default"
) {
    fun toMap(): Map<String, Any?> = mapOf(
        "warehouseId" to warehouseId,
        "warehouseName" to warehouseName,
        "contactName" to contactName,
        "contactPhone" to contactPhone,
        "fullAddress" to fullAddress,
        "ward" to ward,
        "district" to district,
        "city" to city,
        "latitude" to latitude,
        "longitude" to longitude,
        "routeLabel" to routeLabel,
        "distanceKm" to distanceKm,
        "selectionReason" to selectionReason
    )
}

/**
 * Kho mặc định cho MVP — sau này sẽ lấy từ Firestore warehouses collection.
 */
object DefaultWarehouse {
    val SHIPPING_ORIGIN = ShippingOrigin(
        warehouseId = "warehouse-default",
        warehouseName = "Kho ACFMart",
        contactName = "ACFMart Warehouse",
        contactPhone = "0901234567",
        fullAddress = "123 Đường ABC",
        ward = "Phường XYZ",
        district = "Quận 1",
        city = "TP. Hồ Chí Minh",
        routeLabel = "Kho ACFMart · Quận 1, TP. Hồ Chí Minh → Khách hàng",
        selectionReason = "default"
    )
}

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
