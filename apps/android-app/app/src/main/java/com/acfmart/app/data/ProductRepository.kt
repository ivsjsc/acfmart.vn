package com.acfmart.app.data

import com.acfmart.app.Product
import com.acfmart.app.network.ApiService
import kotlinx.coroutines.delay

class ProductRepository(private val apiService: ApiService) {
    
    suspend fun getProducts(): List<Product> {
        // In a real app, we would call apiService.getProducts()
        // For now, we mock the sync with Webapp
        delay(1000)
        return listOf(
            Product("1", "Cà Phê Arabica Cầu Đất", 250000, "Cà phê sạch từ Lâm Đồng.", "Cà phê", true),
            Product("2", "Nước Mắm Phú Quốc 40N", 120000, "Truyền thống từ cá cơm tươi.", "Gia vị", true),
            Product("3", "Khăn Lụa Vạn Phúc", 850000, "Lụa tơ tằm thượng hạng.", "Thời trang", true),
            Product("4", "Mật Ong Rừng U Minh", 350000, "Mật ong nguyên chất 100%.", "Gia vị", true),
            Product("5", "Trà Sen Đồng Tháp", 180000, "Hương sen tự nhiên thanh khiết.", "Thủ công", true)
        )
    }
}
