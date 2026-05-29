package vn.acfmart.mobile.features.account.presentation

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
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavController
import coil.compose.AsyncImage
import vn.acfmart.mobile.core.order.BuyerOrder
import vn.acfmart.mobile.core.order.BuyerOrderStatus
import vn.acfmart.mobile.core.ui.theme.success
import vn.acfmart.mobile.core.ui.theme.warning
import java.text.NumberFormat
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * Orders List Screen — danh sách đơn hàng THẬT của người mua (Firestore `orders`).
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OrdersScreen(
    navController: NavController,
    viewModel: OrdersViewModel = hiltViewModel()
) {
    val ui by viewModel.uiState.collectAsStateWithLifecycle()
    var selectedFilter by remember { mutableStateOf<BuyerOrderStatus?>(null) }
    var pendingCancel by remember { mutableStateOf<BuyerOrder?>(null) }
    val snackbarHostState = remember { SnackbarHostState() }

    val priceFormat = NumberFormat.getNumberInstance(Locale("vi", "VN"))

    LaunchedEffect(ui.actionMessage) {
        ui.actionMessage?.let {
            snackbarHostState.showSnackbar(it)
            viewModel.clearActionMessage()
        }
    }

    val filteredOrders = remember(ui.orders, selectedFilter) {
        if (selectedFilter == null) ui.orders else ui.orders.filter { it.status == selectedFilter }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
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
            val tabs: List<Pair<BuyerOrderStatus?, String>> = listOf(
                null to "Tất cả",
                BuyerOrderStatus.PENDING to "Chờ xác nhận",
                BuyerOrderStatus.PROCESSING to "Đang xử lý",
                BuyerOrderStatus.SHIPPING to "Đang giao",
                BuyerOrderStatus.DELIVERED to "Đã giao",
                BuyerOrderStatus.CANCELLED to "Đã hủy"
            )
            ScrollableTabRow(
                selectedTabIndex = tabs.indexOfFirst { it.first == selectedFilter }.coerceAtLeast(0),
                modifier = Modifier.fillMaxWidth(),
                edgePadding = 16.dp
            ) {
                tabs.forEach { (status, label) ->
                    Tab(
                        selected = selectedFilter == status,
                        onClick = { selectedFilter = status },
                        text = { Text(label) }
                    )
                }
            }

            HorizontalDivider()

            when {
                ui.isLoading -> Box(Modifier.fillMaxSize(), Alignment.Center) { CircularProgressIndicator() }
                ui.errorMessage != null -> OrdersMessage(
                    icon = Icons.Default.ErrorOutline,
                    title = ui.errorMessage!!,
                    actionLabel = null,
                    onAction = {}
                )
                filteredOrders.isEmpty() -> OrdersMessage(
                    icon = Icons.Default.ShoppingBag,
                    title = "Không có đơn hàng nào",
                    actionLabel = "Mua sắm ngay",
                    onAction = { navController.navigate("store/home") }
                )
                else -> LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(filteredOrders, key = { it.id }) { order ->
                        OrderCard(
                            order = order,
                            priceFormat = priceFormat,
                            onCancel = { pendingCancel = order }
                        )
                    }
                }
            }
        }
    }

    pendingCancel?.let { order ->
        AlertDialog(
            onDismissRequest = { pendingCancel = null },
            title = { Text("Huỷ đơn hàng") },
            text = { Text("Bạn chắc chắn muốn huỷ đơn ${order.code}?") },
            confirmButton = {
                TextButton(onClick = {
                    viewModel.cancelOrder(order)
                    pendingCancel = null
                }) { Text("Huỷ đơn", color = MaterialTheme.colorScheme.error) }
            },
            dismissButton = {
                TextButton(onClick = { pendingCancel = null }) { Text("Đóng") }
            }
        )
    }
}

@Composable
private fun OrdersMessage(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    title: String,
    actionLabel: String?,
    onAction: () -> Unit
) {
    Box(Modifier.fillMaxSize(), Alignment.Center) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp),
            modifier = Modifier.padding(24.dp)
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                modifier = Modifier.size(80.dp),
                tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.3f)
            )
            Text(
                text = title,
                style = MaterialTheme.typography.titleMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            if (actionLabel != null) {
                Button(onClick = onAction) {
                    Icon(Icons.Default.ShoppingCart, contentDescription = null)
                    Spacer(Modifier.width(8.dp))
                    Text(actionLabel)
                }
            }
        }
    }
}

@Composable
private fun OrderCard(
    order: BuyerOrder,
    priceFormat: NumberFormat,
    onCancel: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Mã đơn: #${order.code}",
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = SimpleDateFormat("dd/MM/yyyy HH:mm", Locale.getDefault())
                            .format(Date(order.createdAtMillis)),
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                OrderStatusBadge(status = order.status)
            }

            Spacer(Modifier.height(12.dp))
            HorizontalDivider()
            Spacer(Modifier.height(12.dp))

            order.items.take(2).forEach { item ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    AsyncImage(
                        model = item.image,
                        contentDescription = item.title,
                        modifier = Modifier
                            .size(60.dp)
                            .clip(MaterialTheme.shapes.small),
                        contentScale = ContentScale.Crop
                    )
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = item.title,
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

            if (order.cancellable) {
                Spacer(Modifier.height(8.dp))
                OutlinedButton(
                    onClick = onCancel,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text("Huỷ đơn")
                }
            }
        }
    }
}

@Composable
private fun OrderStatusBadge(status: BuyerOrderStatus) {
    val color = when (status) {
        BuyerOrderStatus.PENDING -> MaterialTheme.colorScheme.warning
        BuyerOrderStatus.PROCESSING -> MaterialTheme.colorScheme.primary
        BuyerOrderStatus.SHIPPING -> MaterialTheme.colorScheme.tertiary
        BuyerOrderStatus.DELIVERED -> MaterialTheme.colorScheme.success
        BuyerOrderStatus.CANCELLED -> MaterialTheme.colorScheme.error
    }
    Card(
        colors = CardDefaults.cardColors(containerColor = color.copy(alpha = 0.1f)),
        shape = MaterialTheme.shapes.small
    ) {
        Text(
            text = status.label,
            style = MaterialTheme.typography.labelMedium,
            fontWeight = FontWeight.Bold,
            color = color,
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
        )
    }
}
