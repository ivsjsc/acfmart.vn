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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import java.text.SimpleDateFormat
import java.util.Date
import vn.acfmart.mobile.core.ui.theme.success
import java.util.Locale

/**
 * Notifications Screen - Màn hình thông báo
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NotificationsScreen(
    navController: NavController
) {
    val notifications = remember { getDemoNotifications() }
    var selectedFilter by remember { mutableStateOf("all") }
    
    val filteredNotifications = when (selectedFilter) {
        "unread" -> notifications.filter { !it.isRead }
        "orders" -> notifications.filter { it.type == NotificationType.ORDER }
        "promo" -> notifications.filter { it.type == NotificationType.PROMOTION }
        "system" -> notifications.filter { it.type == NotificationType.SYSTEM }
        else -> notifications
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { 
                    Text(
                        "Thông báo",
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
                    if (notifications.any { !it.isRead }) {
                        TextButton(onClick = { /* TODO: Mark all as read */ }) {
                            Icon(Icons.Default.DoneAll, contentDescription = null)
                            Spacer(Modifier.width(4.dp))
                            Text("Đánh dấu đã đọc")
                        }
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
                    "unread" -> 1
                    "orders" -> 2
                    "promo" -> 3
                    "system" -> 4
                    else -> 0
                },
                modifier = Modifier.fillMaxWidth(),
                edgePadding = 16.dp
            ) {
                listOf(
                    "all" to "Tất cả",
                    "unread" to "Chưa đọc",
                    "orders" to "Đơn hàng",
                    "promo" to "Khuyến mãi",
                    "system" to "Hệ thống"
                ).forEach { (key, label) ->
                    Tab(
                        selected = selectedFilter == key,
                        onClick = { selectedFilter = key },
                        text = {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(4.dp)
                            ) {
                                Text(label)
                                if (key == "unread") {
                                    val unreadCount = notifications.count { !it.isRead }
                                    if (unreadCount > 0) {
                                        Text(
                                            text = "($unreadCount)",
                                            style = MaterialTheme.typography.labelSmall,
                                            color = MaterialTheme.colorScheme.error
                                        )
                                    }
                                }
                            }
                        }
                    )
                }
            }
            
            HorizontalDivider()
            
            // Notifications List
            if (filteredNotifications.isEmpty()) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.NotificationsOff,
                            contentDescription = null,
                            modifier = Modifier.size(80.dp),
                            tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.3f)
                        )
                        Text(
                            text = "Không có thông báo nào",
                            style = MaterialTheme.typography.headlineSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Text(
                            text = "Các thông báo mới sẽ xuất hiện tại đây",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxSize()
                ) {
                    items(filteredNotifications) { notification ->
                        NotificationItemCard(
                            notification = notification,
                            onClick = {
                                // TODO: Mark as read and handle notification action
                            }
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun NotificationItemCard(
    notification: AppNotification,
    onClick: () -> Unit
) {
    val (icon, iconTint) = when (notification.type) {
        NotificationType.ORDER -> Icons.Default.ShoppingBag to MaterialTheme.colorScheme.primary
        NotificationType.PROMOTION -> Icons.Default.LocalOffer to MaterialTheme.colorScheme.tertiary
        NotificationType.SYSTEM -> Icons.Default.Info to MaterialTheme.colorScheme.onSurfaceVariant
        NotificationType.PAYMENT -> Icons.Default.Payment to MaterialTheme.colorScheme.success
    }
    
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        colors = CardDefaults.cardColors(
            containerColor = if (notification.isRead) {
                MaterialTheme.colorScheme.surface
            } else {
                MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.3f)
            }
        )
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Icon
            Surface(
                modifier = Modifier.size(48.dp),
                shape = MaterialTheme.shapes.medium,
                color = iconTint.copy(alpha = 0.1f)
            ) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = icon,
                        contentDescription = null,
                        modifier = Modifier.size(28.dp),
                        tint = iconTint
                    )
                }
            }
            
            // Content
            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                // Title & Time
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.Top
                ) {
                    Text(
                        text = notification.title,
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = if (notification.isRead) FontWeight.Normal else FontWeight.Bold,
                        modifier = Modifier.weight(1f),
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                    
                    Text(
                        text = formatNotificationTime(notification.timestamp),
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.padding(start = 8.dp)
                    )
                }
                
                // Message
                Text(
                    text = notification.message,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )
                
                // Unread indicator
                if (!notification.isRead) {
                    Box(
                        modifier = Modifier
                            .size(8.dp)
                            .clip(MaterialTheme.shapes.small)
                            .background(MaterialTheme.colorScheme.primary)
                    )
                }
            }
        }
    }
}

private fun formatNotificationTime(timestamp: Date): String {
    val now = Date()
    val diff = now.time - timestamp.time
    
    return when {
        diff < 60000 -> "Vừa xong"
        diff < 3600000 -> "${diff / 60000} phút trước"
        diff < 86400000 -> "${diff / 3600000} giờ trước"
        diff < 604800000 -> "${diff / 86400000} ngày trước"
        else -> SimpleDateFormat("dd/MM/yyyy", Locale.getDefault()).format(timestamp)
    }
}

enum class NotificationType {
    ORDER, PROMOTION, SYSTEM, PAYMENT
}

data class AppNotification(
    val id: String,
    val title: String,
    val message: String,
    val type: NotificationType,
    val timestamp: Date,
    val isRead: Boolean = false,
    val actionUrl: String? = null
)

private fun getDemoNotifications() = listOf(
    AppNotification(
        id = "1",
        title = "Đơn hàng đang giao",
        message = "Đơn hàng #ORD001 của bạn đang được giao dự kiến nhận trong hôm nay",
        type = NotificationType.ORDER,
        timestamp = Date(System.currentTimeMillis() - 1800000),
        isRead = false
    ),
    AppNotification(
        id = "2",
        title = "Khuyến mãi hot! Giảm 50%",
        message = "Flash Sale cuối tuần - Giảm đến 50% cho tất cả sản phẩm thời trang",
        type = NotificationType.PROMOTION,
        timestamp = Date(System.currentTimeMillis() - 3600000),
        isRead = false
    ),
    AppNotification(
        id = "3",
        title = "Đơn hàng đã giao thành công",
        message = "Đơn hàng #ORD002 đã được giao. Hãy đánh giá sản phẩm!",
        type = NotificationType.ORDER,
        timestamp = Date(System.currentTimeMillis() - 172800000),
        isRead = true
    ),
    AppNotification(
        id = "4",
        title = "Cập nhật chính sách mới",
        message = "ACFMart đã cập nhật chính sách bảo mật mới. Vui lòng xem chi tiết.",
        type = NotificationType.SYSTEM,
        timestamp = Date(System.currentTimeMillis() - 259200000),
        isRead = true
    ),
    AppNotification(
        id = "5",
        title = "Thanh toán thành công",
        message = "Đơn hàng #ORD003 đã được thanh toán thành công qua VNPay",
        type = NotificationType.PAYMENT,
        timestamp = Date(System.currentTimeMillis() - 86400000),
        isRead = true
    )
)
