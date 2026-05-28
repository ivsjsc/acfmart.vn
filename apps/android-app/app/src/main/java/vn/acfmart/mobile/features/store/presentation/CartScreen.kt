package vn.acfmart.mobile.features.store.presentation

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
 * Shopping Cart Screen - Màn hình giỏ hàng
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CartScreen(
    navController: NavController
) {
    // Demo cart items - sẽ thay bằng ViewModel
    val cartItems = remember { getDemoCartItems() }
    var selectedItems by remember { mutableStateOf(cartItems.map { it.id }.toSet()) }
    
    val priceFormat = NumberFormat.getNumberInstance(Locale("vi", "VN"))
    
    val totalPrice = cartItems
        .filter { it.id in selectedItems }
        .sumOf { it.price * it.quantity }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { 
                    Text(
                        "Giỏ hàng (${cartItems.size})",
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
                    if (cartItems.isNotEmpty()) {
                        TextButton(onClick = { /* TODO: Clear cart */ }) {
                            Text("Xóa tất cả")
                        }
                    }
                }
            )
        },
        bottomBar = {
            if (cartItems.isNotEmpty() && selectedItems.isNotEmpty()) {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(
                                    text = "Tổng cộng:",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                                Text(
                                    text = "${priceFormat.format(totalPrice)}₫",
                                    style = MaterialTheme.typography.headlineSmall,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.primary
                                )
                            }
                            
                            Button(
                                onClick = {
                                    // TODO: Navigate to checkout
                                },
                                modifier = Modifier
                                    .width(160.dp)
                                    .height(48.dp)
                            ) {
                                Icon(Icons.Default.Payment, contentDescription = null)
                                Spacer(Modifier.width(8.dp))
                                Text("Thanh toán")
                            }
                        }
                    }
                }
            }
        }
    ) { paddingValues ->
        if (cartItems.isEmpty()) {
            // Empty cart state
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
                        imageVector = Icons.Default.ShoppingCart,
                        contentDescription = null,
                        modifier = Modifier.size(120.dp),
                        tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.3f)
                    )
                    Text(
                        text = "Giỏ hàng trống",
                        style = MaterialTheme.typography.headlineSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Text(
                        text = "Hãy thêm sản phẩm vào giỏ hàng!",
                        style = MaterialTheme.typography.bodyLarge,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Spacer(Modifier.height(16.dp))
                    Button(
                        onClick = { navController.navigate("store/home") }
                    ) {
                        Icon(Icons.Default.ShoppingBag, contentDescription = null)
                        Spacer(Modifier.width(8.dp))
                        Text("Mua sắm ngay")
                    }
                }
            }
        } else {
            // Cart items list
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(cartItems) { item ->
                    CartItemCard(
                        item = item,
                        isSelected = item.id in selectedItems,
                        onSelectionChange = { checked ->
                            if (checked) {
                                selectedItems += item.id
                            } else {
                                selectedItems -= item.id
                            }
                        },
                        onQuantityChange = { newQuantity ->
                            // TODO: Update quantity in ViewModel
                        },
                        onRemove = {
                            // TODO: Remove item from ViewModel
                        }
                    )
                }
                
                item {
                    Spacer(Modifier.height(80.dp)) // Space for bottom bar
                }
            }
        }
    }
}

@Composable
private fun CartItemCard(
    item: CartItem,
    isSelected: Boolean,
    onSelectionChange: (Boolean) -> Unit,
    onQuantityChange: (Int) -> Unit,
    onRemove: () -> Unit
) {
    val priceFormat = NumberFormat.getNumberInstance(Locale("vi", "VN"))
    
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .padding(12.dp)
                .fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Checkbox
            Checkbox(
                checked = isSelected,
                onCheckedChange = onSelectionChange,
                modifier = Modifier.align(Alignment.Top)
            )
            
            // Product Image
            AsyncImage(
                model = item.imageUrl,
                contentDescription = item.name,
                modifier = Modifier
                    .size(100.dp)
                    .clip(MaterialTheme.shapes.small),
                contentScale = ContentScale.Crop
            )
            
            // Product Info
            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Text(
                    text = item.name,
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.SemiBold,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )
                
                Text(
                    text = "${priceFormat.format(item.price)}₫",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary
                )
                
                // Quantity Selector
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedButton(
                        onClick = {
                            if (item.quantity > 1) {
                                onQuantityChange(item.quantity - 1)
                            }
                        },
                        modifier = Modifier.size(32.dp),
                        contentPadding = PaddingValues(0.dp)
                    ) {
                        Text("-", style = MaterialTheme.typography.titleMedium)
                    }
                    
                    Text(
                        text = "${item.quantity}",
                        style = MaterialTheme.typography.bodyLarge,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.width(32.dp),
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center
                    )
                    
                    OutlinedButton(
                        onClick = {
                            onQuantityChange(item.quantity + 1)
                        },
                        modifier = Modifier.size(32.dp),
                        contentPadding = PaddingValues(0.dp)
                    ) {
                        Text("+", style = MaterialTheme.typography.titleMedium)
                    }
                }
            }
            
            // Remove button
            IconButton(onClick = onRemove) {
                Icon(
                    imageVector = Icons.Default.Delete,
                    contentDescription = "Xóa",
                    tint = MaterialTheme.colorScheme.error
                )
            }
        }
    }
}

data class CartItem(
    val id: String,
    val name: String,
    val price: Double,
    val imageUrl: String,
    var quantity: Int
)

private fun getDemoCartItems() = listOf(
    CartItem(
        id = "1",
        name = "Áo Thun Nam Premium Cotton 100%",
        price = 299000.0,
        imageUrl = "https://via.placeholder.com/200x200",
        quantity = 2
    ),
    CartItem(
        id = "2",
        name = "Quần Jeans Nam Slim Fit",
        price = 450000.0,
        imageUrl = "https://via.placeholder.com/200x200",
        quantity = 1
    ),
    CartItem(
        id = "3",
        name = "Giày Sneaker Unisex",
        price = 890000.0,
        imageUrl = "https://via.placeholder.com/200x200",
        quantity = 1
    )
)
