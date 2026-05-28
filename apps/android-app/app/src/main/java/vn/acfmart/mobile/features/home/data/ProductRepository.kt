package vn.acfmart.mobile.features.home.data

import kotlinx.coroutines.delay

/**
 * Repository cung cấp dữ liệu giả lập cho Home Screen.
 * 
 * Production: thay thế bằng Firestore/REST API calls.
 */
class ProductRepository {
    
    /**
     * Lấy danh sách categories
     */
    suspend fun getCategories(): List<Category> {
        delay(500) // Giả lập network delay
        return CategoryData.categories
    }
    
    /**
     * Lấy danh sách products (có thể filter theo category)
     */
    suspend fun getProducts(categoryId: String? = null): List<Product> {
        delay(800) // Giả lập network delay
        return if (categoryId == null) {
            ProductData.products
        } else {
            ProductData.products.filter { it.categoryId == categoryId }
        }
    }
    
    /**
     * Search products
     */
    suspend fun searchProducts(query: String): List<Product> {
        delay(600)
        val lowerQuery = query.lowercase()
        return ProductData.products.filter { product ->
            product.name.lowercase().contains(lowerQuery) ||
            product.description.lowercase().contains(lowerQuery) ||
            product.categoryName.lowercase().contains(lowerQuery) ||
            product.shopName.lowercase().contains(lowerQuery)
        }
    }
    
    /**
     * Lấy product theo ID
     */
    suspend fun getProductById(id: String): Product? {
        delay(300)
        return ProductData.products.find { it.id == id }
    }
}

/**
 * Placeholder categories data
 */
object CategoryData {
    val categories = listOf(
        Category("cat1", "Điện tử", "📱", 1250),
        Category("cat2", "Thời trang", "👕", 3420),
        Category("cat3", "Mỹ phẩm", "💄", 890),
        Category("cat4", "Thực phẩm", "🍜", 2100),
        Category("cat5", "Gia dụng", "🏠", 1560),
        Category("cat6", "Sách", "📚", 670),
        Category("cat7", "Thể thao", "⚽", 980),
        Category("cat8", "Đồ chơi", "🧸", 540)
    )
}

/**
 * Placeholder products data - Demo chống hàng giả
 */
object ProductData {
    val products = listOf(
        Product(
            id = "p1",
            name = "iPhone 15 Pro Max 256GB - Chính hãng VN/A",
            description = "iPhone 15 Pro Max chip A17 Pro, camera 48MP, màn hình Super Retina XDR 6.7 inch. Sản phẩm chính hãng Apple Việt Nam, có tem chống hàng giả ACFMart.",
            price = 33990000.0,
            originalPrice = 35990000.0,
            imageUrl = "https://via.placeholder.com/400x400/DC2626/FFFFFF?text=iPhone+15",
            categoryId = "cat1",
            categoryName = "Điện tử",
            rating = 4.8f,
            reviewCount = 256,
            soldCount = 1234,
            isVerified = true,
            stock = 45,
            shopName = "ACF Official Store",
            shopLocation = "Hà Nội"
        ),
        Product(
            id = "p2",
            name = "Áo Polo Nam Cao Cấp - Cotton 100%",
            description = "Áo polo nam chất liệu cotton 100%, thoáng mát, thấm hút mồ hôi. Đã xác thực nguồn gốc qua hệ thống ACFMart.",
            price = 299000.0,
            originalPrice = 450000.0,
            imageUrl = "https://via.placeholder.com/400x400/2563EB/FFFFFF?text=Ao+Polo",
            categoryId = "cat2",
            categoryName = "Thời trang",
            rating = 4.5f,
            reviewCount = 189,
            soldCount = 2567,
            isVerified = true,
            stock = 150,
            shopName = "Fashion Hub",
            shopLocation = "TP. Hồ Chí Minh"
        ),
        Product(
            id = "p3",
            name = "Son MAC Ruby Woo - Chính hãng",
            description = "Son MAC Ruby Woo authentic, màu đỏ經典, finish matte. Tem xác thực ACFMart chống hàng giả.",
            price = 850000.0,
            imageUrl = "https://via.placeholder.com/400x400/DC2626/FFFFFF?text=MAC+Son",
            categoryId = "cat3",
            categoryName = "Mỹ phẩm",
            rating = 4.9f,
            reviewCount = 432,
            soldCount = 3456,
            isVerified = true,
            stock = 78,
            shopName = "Beauty Official",
            shopLocation = "Hà Nội"
        ),
        Product(
            id = "p4",
            name = "Yến Sào Khánh Hòa - 100g",
            description = "Yến sào Khánh Hòa nguyên chất, bồi bổ sức khỏe. Sản phẩm đã được xác thực nguồn gốc.",
            price = 2500000.0,
            originalPrice = 3000000.0,
            imageUrl = "https://via.placeholder.com/400x400/F59E0B/FFFFFF?text=Yen+Sao",
            categoryId = "cat4",
            categoryName = "Thực phẩm",
            rating = 4.7f,
            reviewCount = 98,
            soldCount = 567,
            isVerified = true,
            stock = 25,
            shopName = "Yến Sào Việt",
            shopLocation = "Khánh Hòa"
        ),
        Product(
            id = "p5",
            name = "Nồi Chiên Không Dầu Philips HD9270",
            description = "Nồi chiên không dầu Philips 6.2L, công nghệ Rapid Air. Hàng chính hãng, bảo hành 2 năm.",
            price = 3290000.0,
            originalPrice = 4500000.0,
            imageUrl = "https://via.placeholder.com/400x400/10B981/FFFFFF?text=Noi+Chien",
            categoryId = "cat5",
            categoryName = "Gia dụng",
            rating = 4.6f,
            reviewCount = 321,
            soldCount = 1890,
            isVerified = true,
            stock = 32,
            shopName = "Home Appliances",
            shopLocation = "TP. Hồ Chí Minh"
        ),
        Product(
            id = "p6",
            name = "Sách: Đắc Nhân Tâm - Dale Carnegie",
            description = "Đắc Nhân Tâm - Nghệ thuật ứng xử căn bản. Bản dịch mới nhất, NXB Tổng Hợp.",
            price = 86000.0,
            imageUrl = "https://via.placeholder.com/400x400/8B5CF6/FFFFFF?text=Dac+Nhan+Tam",
            categoryId = "cat6",
            categoryName = "Sách",
            rating = 4.8f,
            reviewCount = 567,
            soldCount = 8901,
            isVerified = false,
            stock = 200,
            shopName = "Nhà Sách Online",
            shopLocation = "Hà Nội"
        ),
        Product(
            id = "p7",
            name = "Giày Nike Air Force 1 '07 White",
            description = "Giày Nike Air Force 1 classic màu trắng, size 38-44. Hàng auth, có tem xác thực ACFMart.",
            price = 2890000.0,
            originalPrice = 3200000.0,
            imageUrl = "https://via.placeholder.com/400x400/000000/FFFFFF?text=Nike+AF1",
            categoryId = "cat2",
            categoryName = "Thời trang",
            rating = 4.7f,
            reviewCount = 234,
            soldCount = 1456,
            isVerified = true,
            stock = 67,
            shopName = "Sneaker Official",
            shopLocation = "Đà Nẵng"
        ),
        Product(
            id = "p8",
            name = "Samsung Galaxy S24 Ultra 512GB",
            description = "Samsung Galaxy S24 Ultra chip Snapdragon 8 Gen 3, camera 200MP, S Pen tích hợp AI.",
            price = 33990000.0,
            imageUrl = "https://via.placeholder.com/400x400/3B82F6/FFFFFF?text=Galaxy+S24",
            categoryId = "cat1",
            categoryName = "Điện tử",
            rating = 4.9f,
            reviewCount = 178,
            soldCount = 890,
            isVerified = true,
            stock = 28,
            shopName = "Samsung Official",
            shopLocation = "Hà Nội"
        ),
        Product(
            id = "p9",
            name = "Bóng Đá Nike Flight - Match Ball",
            description = "Bóng đá Nike Flight chính hãng, dùng cho thi đấu. Công nghệ Aerowsculpt.",
            price = 3800000.0,
            imageUrl = "https://via.placeholder.com/400x400/10B981/FFFFFF?text=Bong+Nike",
            categoryId = "cat7",
            categoryName = "Thể thao",
            rating = 4.6f,
            reviewCount = 89,
            soldCount = 345,
            isVerified = true,
            stock = 15,
            shopName = "Sports Pro",
            shopLocation = "TP. Hồ Chí Minh"
        ),
        Product(
            id = "p10",
            name = "LEGO Technic Lamborghini Sián",
            description = "LEGO Technic 42115 Lamborghini Sián FKP 37, 3696 miếng. Hàng chính hãng LEGO.",
            price = 9500000.0,
            originalPrice = 11000000.0,
            imageUrl = "https://via.placeholder.com/400x400/F59E0B/FFFFFF?text=LEGO",
            categoryId = "cat8",
            categoryName = "Đồ chơi",
            rating = 4.9f,
            reviewCount = 145,
            soldCount = 234,
            isVerified = true,
            stock = 8,
            shopName = "Toy Land",
            shopLocation = "Hà Nội"
        )
    )
}
