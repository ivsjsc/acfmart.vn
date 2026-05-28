package vn.acfmart.mobile.features.account.presentation

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import coil.compose.AsyncImage
import java.text.NumberFormat
import java.util.Locale

/**
 * Wishlist Screen - Màn hình sản phẩm yêu thích
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun WishlistScreen(
    navController: NavController
) {
    val wishlistItems = remember { getDemoWishlistItems() }
    var isEditing by remember { mutableStateOf(false) }
    var selectedItems by remember { mutableStateOf(setOf<String>()) }
    
    val priceFormat = NumberFormat.getNumberInstance(Locale("vi", "VN"))
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { 
                    Text(
                        "Yêu thích (${wishlistItems.size})",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold
                    ) 
                },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Quay lại")
                    }
                },
                actions = {
                    if (wishlistItems.isNotEmpty()) {
                        TextButton(onClick = { isEditing = !isEditing }) {
                            Text(if (isEditing) "Xong" else "Chọn")
                        }
                    }
                }
            )
        }
    ) { paddingValues ->
        if (wishlistItems.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.FavoriteBorder,
                        contentDescription = null,
                        modifier = Modifier.size(100.dp),
                        tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.3f)
                    )
                    Text(
                        text = "Chưa có sản phẩm yêu thích",
                        style = MaterialTheme.typography.headlineSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Text(
                        text = "Nhấn icon ❤️ để thêm sản phẩm vào danh sách yêu thích",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Spacer(Modifier.height(16.dp))
                    Button(
                        onClick = { navController.navigate("store/home") }
                    ) {
                        Icon(Icons.Default.ShoppingBag, contentDescription = null)
                        Spacer(Modifier.width(8.dp))
                        Text("Khám phá ngay")
                    }
                }
            }
        } else {
            LazyVerticalGrid(
                columns = GridCells.Adaptive(minSize = 180.dp),
                contentPadding = PaddingValues(16.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp),
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
            ) {
                items(wishlistItems) { item ->
                    WishlistItemCard(
                        item = item,
                        priceFormat = priceFormat,
                        isSelected = item.id in selectedItems,
                        isEditing = isEditing,
                        onSelectionChange = { checked ->
                            if (checked) {
                                selectedItems += item.id
                            } else {
                                selectedItems -= item.id
                            }
                        },
                        onRemove = {
                            // TODO: Remove from wishlist
                        },
                        onClick = {
                            navController.navigate("store/product/${item.id}")
                        }
                    )
                }
                
                item {
                    if (isEditing && selectedItems.isNotEmpty()) {
                        Spacer(Modifier.height(80.dp))
                    }
                }
            }
        }
        
        // Bottom action bar when editing
        if (isEditing && selectedItems.isNotEmpty()) {
            Card(
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
            ) {
                Row(
                    modifier = Modifier
                        .padding(16.dp)
                        .fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    OutlinedButton(
                        onClick = {
                            // TODO: Remove selected items from wishlist
                            selectedItems = emptySet()
                            isEditing = false
                        },
                        modifier = Modifier.weight(1f),
                        colors = ButtonDefaults.outlinedButtonColors(
                            contentColor = MaterialTheme.colorScheme.error
                        )
                    ) {
                        Icon(Icons.Default.Delete, contentDescription = null)
                        Spacer(Modifier.width(8.dp))
                        Text("Xóa (${selectedItems.size})")
                    }
                    
                    Button(
                        onClick = {
                            // TODO: Add selected items to cart
                            selectedItems = emptySet()
                            isEditing = false
                        },
                        modifier = Modifier.weight(1f)
                    ) {
                        Icon(Icons.Default.ShoppingCart, contentDescription = null)
                        Spacer(Modifier.width(8.dp))
                        Text("Thêm giỏ hàng")
                    }
                }
            }
        }
    }
}

@Composable
private fun WishlistItemCard(
    item: WishlistItem,
    priceFormat: NumberFormat,
    isSelected: Boolean,
    isEditing: Boolean,
    onSelectionChange: (Boolean) -> Unit,
    onRemove: () -> Unit,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .clickable(onClick = onClick),
        shape = MaterialTheme.shapes.medium,
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier.fillMaxWidth()
        ) {
            // Product Image with overlay
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(180.dp)
            ) {
                AsyncImage(
                    model = item.imageUrl,
                    contentDescription = item.name,
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Crop
                )
                
                // Edit mode checkbox
                if (isEditing) {
                    Checkbox(
                        checked = isSelected,
                        onCheckedChange = onSelectionChange,
                        modifier = Modifier
                            .align(Alignment.TopStart)
                            .padding(8.dp)
                    )
                }
                
                // Remove button (always visible)
                IconButton(
                    onClick = onRemove,
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .padding(8.dp)
                ) {
                    Surface(
                        shape = MaterialTheme.shapes.small,
                        color = MaterialTheme.colorScheme.surface.copy(alpha = 0.9f)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Close,
                            contentDescription = "Xóa",
                            modifier = Modifier.padding(4.dp),
                            tint = MaterialTheme.colorScheme.error
                        )
                    }
                }
            }
            
            // Product Info
            Column(
                modifier = Modifier.padding(12.dp)
            ) {
                Text(
                    text = item.name,
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.SemiBold,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.fillMaxWidth()
                )
                
                Spacer(Modifier.height(4.dp))
                
                Text(
                    text = "${priceFormat.format(item.price)}₫",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary
                )
                
                Spacer(Modifier.height(4.dp))
                
                // Add to Cart button
                Button(
                    onClick = {
                        // TODO: Add to cart
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(36.dp),
                    contentPadding = PaddingValues(horizontal = 12.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.ShoppingCart,
                        contentDescription = null,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(Modifier.width(4.dp))
                    Text(
                        text = "Thêm vào giỏ",
                        style = MaterialTheme.typography.labelLarge
                    )
                }
            }
        }
    }
}

data class WishlistItem(
    val id: String,
    val name: String,
    val price: Double,
    val imageUrl: String,
    val addedDate: java.util.Date
)

private fun getDemoWishlistItems() = listOf(
    WishlistItem(
        id = "1",
        name = "Áo Thun Nam Premium Cotton 100%",
        price = 299000.0,
        imageUrl = "https://via.placeholder.com/300x300",
        addedDate = java.util.Date(System.currentTimeMillis() - 86400000)
    ),
    WishlistItem(
        id = "2",
        name = "Quần Jeans Nam Slim Fit Cao Cấp",
        price = 450000.0,
        imageUrl = "https://via.placeholder.com/300x300",
        addedDate = java.util.Date(System.currentTimeMillis() - 172800000)
    ),
    WishlistItem(
        id = "3",
        name = "Giày Sneaker Unisex Phong Cách",
        price = 890000.0,
        imageUrl = "https://via.placeholder.com/300x300",
        addedDate = java.util.Date(System.currentTimeMillis() - 259200000)
    ),
    WishlistItem(
        id = "4",
        name = "Mũ Lưỡi Trai Thời Trang",
        price = 150000.0,
        imageUrl = "https://via.placeholder.com/300x300",
        addedDate = java.util.Date(System.currentTimeMillis() - 345600000)
    )
)
