package vn.acfmart.mobile.core.cart

import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.CollectionReference
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Giỏ hàng THẬT lưu trên Firestore `carts/{uid}/items/{productId}` để đồng bộ
 * đa thiết bị với cùng tài khoản. Không dùng dữ liệu giả.
 */
@Singleton
class CartRepository @Inject constructor(
    private val db: FirebaseFirestore,
    private val auth: FirebaseAuth
) {

    private fun itemsCol(): CollectionReference? =
        auth.currentUser?.uid?.let {
            db.collection("carts").document(it).collection("items")
        }

    fun observeItems(): Flow<List<CartItem>> = callbackFlow {
        val col = itemsCol()
        if (col == null) {
            trySend(emptyList())
            awaitClose { }
            return@callbackFlow
        }
        val registration = col.addSnapshotListener { snap, err ->
            if (err != null) {
                close(err)
                return@addSnapshotListener
            }
            val items = snap?.documents?.map { it.toCartItem() }?.sortedBy { it.title } ?: emptyList()
            trySend(items)
        }
        awaitClose { registration.remove() }
    }

    /** Thêm sản phẩm vào giỏ; nếu đã có thì cộng dồn số lượng. */
    suspend fun addItem(item: CartItem) {
        val col = itemsCol() ?: throw IllegalStateException("Vui lòng đăng nhập để thêm vào giỏ")
        val ref = col.document(item.productId)
        val existing = ref.get().await()
        val currentQty = (existing.getLong("quantity") ?: 0L).toInt()
        val merged = item.copy(quantity = (currentQty + item.quantity).coerceIn(1, 99))
        ref.set(merged.toMap()).await()
    }

    suspend fun setQuantity(productId: String, quantity: Int) {
        val col = itemsCol() ?: return
        if (quantity <= 0) {
            col.document(productId).delete().await()
        } else {
            col.document(productId).update("quantity", quantity.coerceAtMost(99)).await()
        }
    }

    suspend fun removeItem(productId: String) {
        itemsCol()?.document(productId)?.delete()?.await()
    }

    suspend fun clear() {
        val col = itemsCol() ?: return
        val snap = col.get().await()
        for (doc in snap.documents) {
            doc.reference.delete().await()
        }
    }
}
