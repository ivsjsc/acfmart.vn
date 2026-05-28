package vn.acfmart.mobile.features.home.data

/**
 * Category data model
 */
data class Category(
    val id: String,
    val name: String,
    val icon: String, // Icon name or emoji
    val productCount: Int = 0
)

/**
 * Product data model
 */
data class Product(
    val id: String,
    val name: String,
    val description: String,
    val price: Double,
    val originalPrice: Double? = null, // For showing discounts
    val imageUrl: String,
    val categoryId: String,
    val categoryName: String,
    val rating: Float = 0f,
    val reviewCount: Int = 0,
    val soldCount: Int = 0,
    val isVerified: Boolean = false, // Anti-counterfeit verification status
    val stock: Int = 0,
    val shopName: String,
    val shopLocation: String
)
