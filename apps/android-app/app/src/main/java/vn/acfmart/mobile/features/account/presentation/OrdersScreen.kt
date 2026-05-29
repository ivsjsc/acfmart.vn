package vn.acfmart.mobile.features.account.presentation

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import vn.acfmart.mobile.core.ui.theme.success
import vn.acfmart.mobile.core.ui.theme.warning

/**
 * Orders List Screen - Màn hình danh sách đơn hàng
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OrdersScreen(
    navController: NavController
) {
    val orders = remember { getDemoOrders() }
    var selectedFilter by remember { mutableStateOf("all") }
    
    val priceFormat = NumberFormat.getNumberInstance(Locale("vi", "VN"))
    
    val filteredOrders = when (selectedFilter) {
        "pending" -> orders.filter { it.status == OrderStatus.PENDING }
        "processing" -> orders.filter { it.status == OrderStatus.PROCESSING }
        "shipping" -> orders.filter { it.status == OrderStatus.SHIPPING }
        "delivered" -> orders.filter { it.status == OrderStatus.DELIVERED }
        "cancelled" -> orders.filter { it.status == OrderStatus.CANCELLED }
        else -> orders
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { 
                    Text(
                        "Đơn hàng của tôi",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold
                    ) 
                },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Quay lại")
                    }
                }
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            // Filter Tabs
            ScrollableTabRow(
                selectedTabIndex = when (selectedFilter) {
                    "all" -> 0
                    "pending" -> 1
                    "processing" -> 2
                    "shipping" -> 3
                    "delivered" -> 4
                    "cancelled" -> 5
                    else -> 0
                },
                modifier = Modifier.fillMaxWidth(),
                edgePadding = 16.dp
            ) {
                listOf(
                    "all" to "Tất cả",
                    "pending" to "Chờ xác nhận",
                    "processing" to "Đang xử lý",
                    "shipping" to "Đang giao",
                    "delivered" to "Đã giao",
                    "cancelled" to "Đã hủy"
                ).forEach { (key, label) ->
                    Tab(
                        selected = selectedFilter == key,
                        onClick = { selectedFilter = key },
                        text = { Text(label) }
                    )
                }
            }
            
            HorizontalDivider()
            
            // Orders List
            if (filteredOrders.isEmpty()) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.ShoppingBag,
                            contentDescription = null,
                            modifier = Modifier.size(80.dp),
                            tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.3f)
                        )
                        Text(
                            text = "Không có đơn hàng nào",
                            style = MaterialTheme.typography.headlineSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Button(
                            onClick = { navController.navigate("store/home") }
                        ) {
                            Icon(Icons.Default.ShoppingCart, contentDescription = null)
                            Spacer(Modifier.width(8.dp))
                            Text("Mua sắm ngay")
                        }
                    }
                }
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(filteredOrders) { order ->
                        OrderCard(
                            order = order,
                            priceFormat = priceFormat,
                            onClick = {
                                // TODO: Navigate to order detail
                            }
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun OrderCard(
    order: Order,
    priceFormat: NumberFormat,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            // Order Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Mã đơn: #${order.id}",
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = SimpleDateFormat("dd/MM/yyyy HH:mm", Locale.getDefault()).format(order.date),
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                
                // Status Badge
                OrderStatusBadge(status = order.status)
            }
            
            Spacer(Modifier.height(12.dp))
            
            HorizontalDivider()
            
            Spacer(Modifier.height(12.dp))
            
            // Order Items Preview
            order.items.take(2).forEach { item ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    AsyncImage(
                        model = item.imageUrl,
                        contentDescription = item.name,
                        modifier = Modifier
                            .size(60.dp)
                            .clip(MaterialTheme.shapes.small),
                        contentScale = ContentScale.Crop
                    )
                    
                    Column(
                        modifier = Modifier.weight(1f)
                    ) {
                        Text(
                            text = item.name,
                            style = MaterialTheme.typography.bodyMedium,
                            fontWeight = FontWeight.SemiBold,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                        Text(
                            text = "x${item.quantity}",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }
            
            if (order.items.size > 2) {
                Text(
                    text = "+${order.items.size - 2} sản phẩm khác",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.padding(top = 4.dp)
                )
            }
            
            Spacer(Modifier.height(12.dp))
            
            HorizontalDivider()
            
            Spacer(Modifier.height(12.dp))
            
            // Order Total
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Tổng cộng:",
                    style = MaterialTheme.typography.bodyLarge,
                    fontWeight = FontWeight.SemiBold
                )
                Text(
                    text = "${priceFormat.format(order.total)}₫",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary
                )
            }
            
            Spacer(Modifier.height(8.dp))
            
            // Action Buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                when (order.status) {
                    OrderStatus.PENDING -> {
                        OutlinedButton(
                            onClick = { /* TODO: Cancel order */ },
                            modifier = Modifier.weight(1f)
                        ) {
                            Text("Hủy đơn")
                        }
                    }
                    OrderStatus.DELIVERED -> {
                        OutlinedButton(
                            onClick = { /* TODO: Rate order */ },
                            modifier = Modifier.weight(1f)
                        ) {
                            Icon(Icons.Default.Star, contentDescription = null)
                            Spacer(Modifier.width(4.dp))
                            Text("Đánh giá")
                        }
                    }
                    else -> {}
                }
                
                Button(
                    onClick = { /* TODO: View order detail */ },
                    modifier = Modifier.weight(1f)
                ) {
                    Text("Xem chi tiết")
                }
            }
        }
    }
}

@Composable
private fun OrderStatusBadge(status: OrderStatus) {
    val (color, label) = when (status) {
        OrderStatus.PENDING -> MaterialTheme.colorScheme.warning to "Chờ xác nhận"
        OrderStatus.PROCESSING -> MaterialTheme.colorScheme.primary to "Đang xử lý"
        OrderStatus.SHIPPING -> MaterialTheme.colorScheme.tertiary to "Đang giao"
        OrderStatus.DELIVERED -> MaterialTheme.colorScheme.success to "Đã giao"
        OrderStatus.CANCELLED -> MaterialTheme.colorScheme.error to "Đã hủy"
    }
    
    Card(
        colors = CardDefaults.cardColors(containerColor = color.copy(alpha = 0.1f)),
        shape = MaterialTheme.shapes.small
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.labelMedium,
            fontWeight = FontWeight.Bold,
            color = color,
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
        )
    }
}

enum class OrderStatus {
    PENDING, PROCESSING, SHIPPING, DELIVERED, CANCELLED
}

data class OrderItem(
    val id: String,
    val name: String,
    val price: Double,
    val imageUrl: String,
    val quantity: Int
)

data class Order(
    val id: String,
    val date: Date,
    val items: List<OrderItem>,
    val total: Double,
    val status: OrderStatus
)

private fun getDemoOrders() = listOf(
    Order(
        id = "ORD001",
        date = Date(System.currentTimeMillis() - 86400000),
        items = listOf(
            OrderItem("1", "Áo Thun Nam Premium", 299000.0, "https://via.placeholder.com/100x100", 2),
            OrderItem("2", "Quần Jeans Slim Fit", 450000.0, "https://via.placeholder.com/100x100", 1)
        ),
        total = 1048000.0,
        status = OrderStatus.SHIPPING
    ),
    Order(
        id = "ORD002",
        date = Date(System.currentTimeMillis() - 172800000),
        items = listOf(
            OrderItem("3", "Giày Sneaker Unisex", 890000.0, "https://via.placeholder.com/100x100", 1)
        ),
        total = 890000.0,
        status = OrderStatus.DELIVERED
    ),
    Order(
        id = "ORD003",
        date = Date(System.currentTimeMillis() - 3600000),
        items = listOf(
            OrderItem("4", "Mũ Lưỡi Trai", 150000.0, "https://via.placeholder.com/100x100", 1)
        ),
        total = 150000.0,
        status = OrderStatus.PENDING
    )
)
