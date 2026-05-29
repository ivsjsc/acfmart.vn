package vn.acfmart.mobile.core.order

import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FieldValue
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.WriteBatch
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import javax.inject.Inject
import javax.inject.Singleton
import vn.acfmart.mobile.core.cart.CartItem

/**
 * Truy cập collection `orders` THẬT (dùng chung web). Người mua chỉ thấy đơn của
 * mình (`customerId == uid`, khớp Firestore rules). Huỷ đơn tuân thủ
 * `isCustomerOrderCancelUpdate`: chỉ đổi status/updated_at/timeline và chỉ khi
 * đơn đang ở payment_pending|awaiting_confirm.
 */
@Singleton
class OrderRepository @Inject constructor(
    private val db: FirebaseFirestore,
    private val auth: FirebaseAuth
) {

    private val ordersCol get() = db.collection("orders")

    /** Realtime đơn của người mua hiện tại, mới nhất trước. */
    fun observeMyOrders(): Flow<List<BuyerOrder>> = callbackFlow {
        val uid = auth.currentUser?.uid
        if (uid == null) {
            trySend(emptyList())
            awaitClose { }
            return@callbackFlow
        }
        val registration = ordersCol
            .whereEqualTo("customerId", uid)
            .addSnapshotListener { snap, err ->
                if (err != null) {
                    close(err)
                    return@addSnapshotListener
                }
                val orders = snap?.documents
                    ?.map { it.toBuyerOrder() }
                    ?.sortedByDescending { it.createdAtMillis }
                    ?: emptyList()
                trySend(orders)
            }
        awaitClose { registration.remove() }
    }

    /** Huỷ đơn (chỉ khi cancellable). Ghi đúng các field rules cho phép. */
    suspend fun cancelOrder(order: BuyerOrder) {
        val uid = auth.currentUser?.uid ?: throw IllegalStateException("Chưa đăng nhập")
        require(order.cancellable) { "Đơn hàng không thể huỷ ở trạng thái hiện tại" }
        val timelineEvent = mapOf(
            "status" to "cancelled",
            "timestamp" to isoNow(),
            "actorId" to uid,
            "note" to "Khách hàng huỷ đơn"
        )
        ordersCol.document(order.id).update(
            mapOf(
                "status" to "cancelled",
                "updated_at" to FieldValue.serverTimestamp(),
                "timeline" to FieldValue.arrayUnion(timelineEvent)
            )
        ).await()
    }

    /**
     * Tạo đơn hàng thật từ giỏ hàng, tuân thủ isValidInitialOrder() trong Firestore rules.
     * - Nhóm sản phẩm theo shopId (mỗi shop = 1 đơn con)
     * - Status: payment_pending (không COD) hoặc awaiting_confirm (COD)
     * - shippingOrigin và shippingAddress phải hợp lệ
     */
    suspend fun createOrder(
        items: List<CartItem>,
        shippingAddress: ShippingAddress,
        paymentMethod: String, // "cod" hoặc "bank_transfer"
        shippingOrigin: ShippingOrigin,
        shippingFee: Int = 30000,
        customerNote: String? = null
    ): List<BuyerOrder> {
        val uid = auth.currentUser?.uid ?: throw IllegalStateException("Chưa đăng nhập")
        val user = auth.currentUser
        require(items.isNotEmpty()) { "Giỏ hàng trống" }
        require(shippingAddress.isValid()) { "Địa chỉ giao hàng không hợp lệ" }

        // Nhóm items theo shop
        val itemsByShop = items.groupBy { it.shopId }
        val now = Date()
        val orderCode = "ACF${SimpleDateFormat("yyMMddHHmmss", Locale.US).format(now)}"
        val batch = db.batch()
        val createdOrders = mutableListOf<BuyerOrder>()

        // Phân bổ shipping fee theo subtotal
        val subtotals = itemsByShop.map { (shopId, shopItems) ->
            shopId to shopItems.sumOf { it.lineTotal.toLong() }
        }
        val totalSubtotal = subtotals.sumOf { it.second }
        val allocatedShipping = if (totalSubtotal > 0) {
            subtotals.map { (_, shopSub) ->
                (shopSub.toDouble() / totalSubtotal * shippingFee).toLong()
            }
        } else {
            List(itemsByShop.size) { 0L }
        }

        itemsByShop.entries.forEachIndexed { index, (shopId, shopItems) ->
            val subtotal = shopItems.sumOf { it.lineTotal.toLong() }.toInt()
            val shopShipping = allocatedShipping[index].toInt()
            val total = subtotal + shopShipping // COD fee = 0 cho MVP

            require(total <= 100_000_000) { "Tổng tiền đơn hàng vượt quá 100 triệu" }

            val isCod = paymentMethod == "cod"
            val status = if (isCod) "awaiting_confirm" else "payment_pending"
            val paymentStatus = if (isCod) "cod" else "pending"

            val shopCode = if (itemsByShop.size > 1 && index > 0) "$orderCode-${index + 1}" else orderCode

            val orderData = mapOf(
                "code" to shopCode,
                "parentCode" to orderCode,
                "customerId" to uid,
                "customerEmail" to (user?.email ?: ""),
                "customerName" to (user?.displayName ?: shippingAddress.name),
                "customerPhone" to shippingAddress.phone,
                "shopId" to shopId,
                "shopName" to (shopItems.firstOrNull()?.shopName ?: "Shop"),
                "status" to status,
                "paymentStatus" to paymentStatus,
                "paymentMethod" to paymentMethod,
                "shippingMethod" to "standard",
                "shippingOrigin" to shippingOrigin.toMap(),
                "shippingFee" to shopShipping,
                "codFee" to 0,
                "subtotal" to subtotal,
                "total" to total,
                "items" to shopItems.map { item ->
                    mapOf(
                        "productId" to item.productId,
                        "title" to item.title,
                        "image" to item.image,
                        "price" to item.price,
                        "quantity" to item.quantity
                    )
                },
                "shippingAddress" to shippingAddress.toMap(),
                "customerNote" to (customerNote ?: ""),
                "timeline" to listOf(
                    mapOf(
                        "status" to status,
                        "timestamp" to isoNow(),
                        "note" to if (isCod) "Đơn hàng mới chờ seller xác nhận" else "Đơn hàng chờ xác nhận thanh toán"
                    )
                ),
                "created_at" to FieldValue.serverTimestamp(),
                "updated_at" to FieldValue.serverTimestamp()
            )

            val orderRef = ordersCol.document()
            batch.set(orderRef, orderData)

            // Tạo BuyerOrder để return
            val buyerOrder = BuyerOrder(
                id = orderRef.id,
                code = shopCode,
                rawStatus = status,
                status = BuyerOrderStatus.fromRaw(status),
                shopName = shopItems.firstOrNull()?.shopName ?: "Shop",
                total = total.toDouble(),
                items = shopItems.map { item ->
                    BuyerOrderItem(
                        productId = item.productId,
                        title = item.title,
                        image = item.image,
                        price = item.price,
                        quantity = item.quantity
                    )
                },
                createdAtMillis = now.time
            )
            createdOrders.add(buyerOrder)
        }

        batch.commit().await()
        return createdOrders
    }

    private fun isoNow(): String =
        SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US).format(Date())
}
