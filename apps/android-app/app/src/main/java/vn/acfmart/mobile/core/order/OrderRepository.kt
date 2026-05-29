package vn.acfmart.mobile.core.order

import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FieldValue
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import javax.inject.Inject
import javax.inject.Singleton

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

    private fun isoNow(): String =
        SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US).format(Date())
}
