package vn.acfmart.mobile.features.store.presentation

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import coil.compose.AsyncImage
import vn.acfmart.mobile.core.ui.theme.success
import vn.acfmart.mobile.core.ui.theme.warning
import java.text.NumberFormat
import java.util.Locale

/**
 * Product Detail Screen - Màn hình chi tiết sản phẩm
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProductDetailScreen(
    navController: NavController,
    productId: String = "1" // Demo: hardcoded product
) {
    // Demo data - sẽ thay bằng ViewModel + Repository
    val product = getDemoProduct(productId)
    var quantity by remember { mutableStateOf(1) }
    var isWishlisted by remember { mutableStateOf(false) }
    
    val priceFormat = NumberFormat.getNumberInstance(Locale("vi", "VN"))
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Chi tiết sản phẩm", style = MaterialTheme.typography.titleMedium) },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Quay lại")
                    }
                },
                actions = {
                    // Share button
                    IconButton(onClick = { /* TODO: Share product */ }) {
                        Icon(Icons.Default.Share, contentDescription = "Chia sẻ")
                    }
                    // Wishlist button
                    IconButton(onClick = { isWishlisted = !isWishlisted }) {
                        Icon(
                            imageVector = if (isWishlisted) Icons.Filled.Favorite else Icons.Default.FavoriteBorder,
                            contentDescription = if (isWishlisted) "Bỏ yêu thích" else "Yêu thích",
                            tint = if (isWishlisted) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.onSurface
                        )
                    }
                }
            )
        },
        bottomBar = {
            // Bottom action bar
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
            ) {
                Row(
                    modifier = Modifier
                        .padding(16.dp)
                        .fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Add to Cart button
                    OutlinedButton(
                        onClick = { /* TODO: Add to cart */ },
                        modifier = Modifier.weight(1f),
                        enabled = product.stock > 0
                    ) {
                        Icon(Icons.Default.ShoppingCart, contentDescription = null)
                        Spacer(Modifier.width(8.dp))
                        Text("Thêm giỏ hàng")
                    }
                    
                    // Buy Now button
                    Button(
                        onClick = { 
                            // TODO: Navigate to checkout
                        },
                        modifier = Modifier.weight(1f),
                        enabled = product.stock > 0
                    ) {
                        Icon(Icons.Default.Payment, contentDescription = null)
                        Spacer(Modifier.width(8.dp))
                        Text("Mua ngay")
                    }
                }
            }
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .verticalScroll(rememberScrollState())
        ) {
            // Product Image
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(350.dp)
            ) {
                AsyncImage(
                    model = product.imageUrl,
                    contentDescription = product.name,
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Crop
                )
                
                // Verified badge
                if (product.isVerified) {
                    Card(
                        modifier = Modifier
                            .padding(16.dp)
                            .align(Alignment.TopEnd),
                        colors = CardDefaults.cardColors(
                            containerColor = MaterialTheme.colorScheme.primary
                        ),
                        shape = MaterialTheme.shapes.small
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Verified,
                                contentDescription = null,
                                modifier = Modifier.size(16.dp),
                                tint = MaterialTheme.colorScheme.onPrimary
                            )
                            Text(
                                text = "Chính hãng",
                                style = MaterialTheme.typography.labelMedium,
                                color = MaterialTheme.colorScheme.onPrimary,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
                
                // Discount badge
                if (product.originalPrice != null && product.originalPrice > product.price) {
                    val discount = ((product.originalPrice - product.price) / product.originalPrice * 100).toInt()
                    Card(
                        modifier = Modifier
                            .padding(16.dp)
                            .align(Alignment.TopStart),
                        colors = CardDefaults.cardColors(
                            containerColor = MaterialTheme.colorScheme.error
                        ),
                        shape = MaterialTheme.shapes.small
                    ) {
                        Text(
                            text = "-$discount%",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onError,
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp)
                        )
                    }
                }
            }
            
            // Product Info
            Column(
                modifier = Modifier.padding(16.dp)
            ) {
                // Product Name
                Text(
                    text = product.name,
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold
                )
                
                Spacer(Modifier.height(12.dp))
                
                // Price Section
                Row(
                    verticalAlignment = Alignment.Bottom,
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text(
                        text = "${priceFormat.format(product.price)}₫",
                        style = MaterialTheme.typography.headlineMedium,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary
                    )
                    
                    if (product.originalPrice != null && product.originalPrice > product.price) {
                        Text(
                            text = "${priceFormat.format(product.originalPrice)}₫",
                            style = MaterialTheme.typography.bodyLarge,
                            textDecoration = TextDecoration.LineThrough,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
                
                Spacer(Modifier.height(16.dp))
                
                // Rating & Sold Stats
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Star,
                            contentDescription = null,
                            modifier = Modifier.size(20.dp),
                            tint = MaterialTheme.colorScheme.tertiary
                        )
                        Text(
                            text = String.format("%.1f", product.rating),
                            style = MaterialTheme.typography.bodyLarge,
                            fontWeight = FontWeight.SemiBold
                        )
                        Text(
                            text = "(${product.reviewCount} đánh giá)",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                    
                    Text(
                        text = "|",
                        style = MaterialTheme.typography.bodyLarge,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    
                    Text(
                        text = "${product.soldCount} đã bán",
                        style = MaterialTheme.typography.bodyLarge,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                
                Spacer(Modifier.height(24.dp))
                
                // Divider
                HorizontalDivider()
                
                Spacer(Modifier.height(16.dp))
                
                // Shop Info
                Text(
                    text = "Thông tin cửa hàng",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                
                Spacer(Modifier.height(12.dp))
                
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { /* TODO: Navigate to shop */ },
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f)
                    )
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Store,
                            contentDescription = null,
                            modifier = Modifier.size(40.dp),
                            tint = MaterialTheme.colorScheme.primary
                        )
                        
                        Column(
                            modifier = Modifier.weight(1f)
                        ) {
                            Text(
                                text = product.shopName,
                                style = MaterialTheme.typography.titleSmall,
                                fontWeight = FontWeight.Bold
                            )
                            
                            Spacer(Modifier.height(4.dp))
                            
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(4.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.LocationOn,
                                    contentDescription = null,
                                    modifier = Modifier.size(14.dp),
                                    tint = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                                Text(
                                    text = product.shopLocation,
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }
                        
                        IconButton(onClick = { /* TODO: Chat with shop */ }) {
                            Icon(
                                imageVector = Icons.Default.ChatBubble,
                                contentDescription = "Chat với shop",
                                tint = MaterialTheme.colorScheme.primary
                            )
                        }
                    }
                }
                
                Spacer(Modifier.height(24.dp))
                
                // Product Description
                Text(
                    text = "Mô tả sản phẩm",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                
                Spacer(Modifier.height(8.dp))
                
                Text(
                    text = product.description,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    lineHeight = MaterialTheme.typography.bodyMedium.lineHeight * 1.5
                )
                
                Spacer(Modifier.height(24.dp))
                
                // Stock Status
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Icon(
                        imageVector = if (product.stock > 0) Icons.Default.CheckCircle else Icons.Default.Cancel,
                        contentDescription = null,
                        tint = if (product.stock > 0) MaterialTheme.colorScheme.success else MaterialTheme.colorScheme.error
                    )
                    Text(
                        text = if (product.stock > 0) "Còn ${product.stock} sản phẩm" else "Hết hàng",
                        style = MaterialTheme.typography.bodyLarge,
                        color = if (product.stock > 0) MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.error,
                        fontWeight = FontWeight.SemiBold
                    )
                }
                
                Spacer(Modifier.height(32.dp))
            }
        }
    }
}

// Demo helper function
private fun getDemoProduct(id: String) = vn.acfmart.mobile.features.home.data.Product(
    id = id,
    name = "Áo Thun Nam Premium Cotton 100% - Chính Hãng",
    description = "Áo thun nam cao cấp được làm từ 100% cotton tự nhiên, thoáng mát, thấm hút mồ hôi tốt. Thiết kế hiện đại, phù hợp với nhiều phong cách thời trang. Sản phẩm đã được xác thực chống hàng giả qua hệ thống QR code của ACFMart.",
    price = 299000.0,
    originalPrice = 450000.0,
    imageUrl = "https://via.placeholder.com/400x400",
    categoryId = "fashion",
    categoryName = "Thời trang",
    rating = 4.8f,
    reviewCount = 1234,
    soldCount = 5678,
    isVerified = true,
    stock = 150,
    shopName = "Fashion Store Official",
    shopLocation = "Hà Nội"
)
