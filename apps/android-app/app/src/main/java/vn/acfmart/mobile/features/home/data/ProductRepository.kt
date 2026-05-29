package vn.acfmart.mobile.features.home.data

import com.google.firebase.firestore.DocumentSnapshot
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import kotlinx.coroutines.tasks.await
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Repository đọc dữ liệu sản phẩm THẬT từ Firestore, dùng chung collection
 * `products` với web app (project `ecommerce-acf`).
 *
 * Quy ước khớp [src/lib/product-service.ts]:
 * - Buyer chỉ thấy sản phẩm `status == "approved"`.
 * - Field DB: title, basePrice (legacy: price), thumbnail, images[], category,
 *   totalStock, totalSold, rating, reviewCount, shopName, acfVerifyStatus, created_at.
 * - Sắp xếp newest-first ở client để không loại doc thiếu `created_at` (legacy data),
 *   giống `sortProductsNewestFirst` bên web.
 *
 * KHÔNG mock, KHÔNG setTimeout giả lập (memory feedback_no_more_mock).
 */
@Singleton
class ProductRepository @Inject constructor(
    private val db: FirebaseFirestore
) {

    private val productsCol get() = db.collection(PRODUCTS_COLLECTION)

    /**
     * Danh mục được suy ra từ chính các sản phẩm đã duyệt (dữ liệu thật),
     * gom theo field `category` kèm số lượng. Tránh phụ thuộc collection riêng
     * chưa chắc tồn tại, và luôn phản ánh đúng hàng đang bán.
     */
    suspend fun getCategories(): List<Category> {
        val products = fetchApprovedProducts()
        return products
            .groupingBy { it.categoryName }
            .eachCount()
            .filterKeys { it.isNotBlank() }
            .map { (name, count) ->
                Category(
                    id = name,
                    name = name,
                    icon = categoryEmoji(name),
                    productCount = count
                )
            }
            .sortedByDescending { it.productCount }
    }

    /**
     * Danh sách sản phẩm đã duyệt, lọc theo category nếu có.
     */
    suspend fun getProducts(categoryId: String? = null): List<Product> {
        val products = fetchApprovedProducts()
        return if (categoryId.isNullOrBlank()) {
            products
        } else {
            products.filter { it.categoryId == categoryId }
        }
    }

    /**
     * Tìm kiếm client-side trên tập sản phẩm đã duyệt (Firestore không hỗ trợ
     * full-text). Khớp logic lọc bên web (title/brand/category/shop).
     */
    suspend fun searchProducts(query: String): List<Product> {
        val q = query.trim().lowercase()
        if (q.isEmpty()) return fetchApprovedProducts()
        return fetchApprovedProducts().filter { product ->
            product.name.lowercase().contains(q) ||
                product.description.lowercase().contains(q) ||
                product.categoryName.lowercase().contains(q) ||
                product.shopName.lowercase().contains(q)
        }
    }

    /**
     * Lấy 1 sản phẩm theo doc id. Trả null nếu không tồn tại.
     */
    suspend fun getProductById(id: String): Product? {
        val snap = productsCol.document(id).get().await()
        if (!snap.exists()) return null
        return snap.toProduct()
    }

    // --- internal -------------------------------------------------------------

    private suspend fun fetchApprovedProducts(): List<Product> {
        val snap = productsCol
            .whereEqualTo("status", "approved")
            .get()
            .await()
        return snap.documents
            .map { it.toProduct() }
            // newest-first; doc thiếu created_at coi như cũ nhất (0)
            .sortedByDescending { it.createdAtMillis }
    }
}

private const val PRODUCTS_COLLECTION = "products"

/**
 * Map 1 Firestore document → domain Product của app, chịu được dữ liệu legacy.
 */
private fun DocumentSnapshot.toProduct(): Product {
    val images = (get("images") as? List<*>)?.filterIsInstance<String>().orEmpty()
    val thumbnail = getString("thumbnail").orEmpty().ifBlank { images.firstOrNull().orEmpty() }
    val basePrice = (getDouble("basePrice") ?: getDouble("price") ?: 0.0)
    val acfApproved = getString("acfVerifyStatus") == "approved" || getBoolean("acfVerified") == true
    val category = getString("category").orEmpty().ifBlank { "Chưa phân loại" }

    return Product(
        id = id,
        name = getString("title").orEmpty().ifBlank { "Sản phẩm chưa đặt tên" },
        description = getString("description").orEmpty(),
        price = basePrice,
        originalPrice = null, // doc hiện chưa có giá gạch; để null cho tới khi web bổ sung
        imageUrl = thumbnail,
        categoryId = category,
        categoryName = category,
        rating = (getDouble("rating") ?: 0.0).toFloat(),
        reviewCount = (getLong("reviewCount") ?: 0L).toInt(),
        soldCount = (getLong("totalSold") ?: 0L).toInt(),
        isVerified = acfApproved,
        stock = (getLong("totalStock") ?: 0L).toInt(),
        shopId = getString("shopId").orEmpty(),
        shopName = getString("shopName").orEmpty().ifBlank { "Shop chưa cập nhật" },
        shopLocation = "", // chưa có trong product doc; lấy từ vendor/shop ở phase sau
        createdAtMillis = getTimestamp("created_at")?.toDate()?.time ?: 0L
    )
}

/** Emoji minh hoạ cho danh mục (chỉ là presentation, không phải dữ liệu giả). */
private fun categoryEmoji(name: String): String = when {
    name.contains("điện", true) || name.contains("electronic", true) -> "📱"
    name.contains("thời trang", true) || name.contains("fashion", true) -> "👕"
    name.contains("mỹ phẩm", true) || name.contains("beauty", true) -> "💄"
    name.contains("thực phẩm", true) || name.contains("food", true) -> "🍜"
    name.contains("gia dụng", true) || name.contains("home", true) -> "🏠"
    name.contains("sách", true) || name.contains("book", true) -> "📚"
    name.contains("thể thao", true) || name.contains("sport", true) -> "⚽"
    name.contains("đồ chơi", true) || name.contains("toy", true) -> "🧸"
    else -> "🛍️"
}
