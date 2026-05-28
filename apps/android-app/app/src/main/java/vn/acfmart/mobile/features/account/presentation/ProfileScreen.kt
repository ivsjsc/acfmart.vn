package vn.acfmart.mobile.features.account.presentation

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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import vn.acfmart.mobile.navigation.Routes

/**
 * Profile/Account Screen - Màn hình tài khoản
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileScreen(
    navController: NavController
) {
    // Demo user data - sẽ thay bằng ViewModel
    val user = remember { getDemoUser() }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { 
                    Text(
                        "Tài khoản",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold
                    ) 
                },
                actions = {
                    // Settings button
                    IconButton(onClick = { navController.navigate("account/settings") }) {
                        Icon(Icons.Default.Settings, contentDescription = "Cài đặt")
                    }
                }
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .verticalScroll(rememberScrollState())
        ) {
            // User Profile Header
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer
                )
            ) {
                Column(
                    modifier = Modifier.padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    // Avatar
                    Surface(
                        modifier = Modifier.size(80.dp),
                        shape = MaterialTheme.shapes.large,
                        color = MaterialTheme.colorScheme.primary
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Icon(
                                imageVector = Icons.Default.Person,
                                contentDescription = null,
                                modifier = Modifier.size(48.dp),
                                tint = MaterialTheme.colorScheme.onPrimary
                            )
                        }
                    }
                    
                    Spacer(Modifier.height(12.dp))
                    
                    // User Name
                    Text(
                        text = user.fullName,
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onPrimaryContainer
                    )
                    
                    Spacer(Modifier.height(4.dp))
                    
                    // User Email
                    Text(
                        text = user.email,
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.7f)
                    )
                    
                    Spacer(Modifier.height(8.dp))
                    
                    // Role Badge
                    AssistChip(
                        onClick = { /* TODO: Show role info */ },
                        label = { 
                            Text(
                                text = user.role.uppercase(),
                                style = MaterialTheme.typography.labelMedium,
                                fontWeight = FontWeight.Bold
                            ) 
                        },
                        leadingIcon = {
                            Icon(
                                imageVector = Icons.Default.Verified,
                                contentDescription = null,
                                modifier = Modifier.size(16.dp)
                            )
                        }
                    )
                }
            }
            
            Spacer(Modifier.height(8.dp))
            
            // Quick Actions
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp)
            ) {
                Column {
                    ProfileMenuItem(
                        icon = Icons.Default.ShoppingBag,
                        title = "Đơn hàng của tôi",
                        subtitle = "Xem lịch sử đơn hàng",
                        onClick = { navController.navigate(Routes.OrderList) }
                    )
                    HorizontalDivider()
                    ProfileMenuItem(
                        icon = Icons.Default.Favorite,
                        title = "Sản phẩm yêu thích",
                        subtitle = "Xem danh sách yêu thích",
                        onClick = { navController.navigate("account/wishlist") }
                    )
                    HorizontalDivider()
                    ProfileMenuItem(
                        icon = Icons.Default.LocationOn,
                        title = "Địa chỉ giao hàng",
                        subtitle = "Quản lý địa chỉ",
                        onClick = { navController.navigate("account/addresses") }
                    )
                    HorizontalDivider()
                    ProfileMenuItem(
                        icon = Icons.Default.Payment,
                        title = "Phương thức thanh toán",
                        subtitle = "Quản lý thẻ & ví",
                        onClick = { navController.navigate("account/payments") }
                    )
                }
            }
            
            Spacer(Modifier.height(16.dp))
            
            // Support & Info
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp)
            ) {
                Column {
                    ProfileMenuItem(
                        icon = Icons.Default.ChatBubble,
                        title = "Hỗ trợ",
                        subtitle = "Liên hệ với chúng tôi",
                        onClick = { navController.navigate("account/support") }
                    )
                    HorizontalDivider()
                    ProfileMenuItem(
                        icon = Icons.Default.Help,
                        title = "Trợ giúp & FAQ",
                        subtitle = "Câu hỏi thường gặp",
                        onClick = { navController.navigate("account/faq") }
                    )
                    HorizontalDivider()
                    ProfileMenuItem(
                        icon = Icons.Default.Info,
                        title = "Về ACFMart",
                        subtitle = "Thông tin nền tảng",
                        onClick = { navController.navigate("account/about") }
                    )
                }
            }
            
            Spacer(Modifier.height(24.dp))
            
            // Logout Button
            Button(
                onClick = {
                    // TODO: Handle logout
                    navController.navigate("auth/login") {
                        popUpTo(0) { inclusive = true }
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp)
                    .height(50.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.error
                )
            ) {
                Icon(Icons.Default.Logout, contentDescription = null)
                Spacer(Modifier.width(8.dp))
                Text(
                    text = "Đăng xuất",
                    style = MaterialTheme.typography.titleMedium
                )
            }
            
            Spacer(Modifier.height(16.dp))
            
            // App Version
            Text(
                text = "ACFMart v1.0.0",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 16.dp),
                textAlign = androidx.compose.ui.text.style.TextAlign.Center
            )
        }
    }
}

@Composable
private fun ProfileMenuItem(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    title: String,
    subtitle: String,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            modifier = Modifier.size(24.dp),
            tint = MaterialTheme.colorScheme.primary
        )
        
        Column(
            modifier = Modifier.weight(1f)
        ) {
            Text(
                text = title,
                style = MaterialTheme.typography.bodyLarge,
                fontWeight = FontWeight.SemiBold
            )
            Text(
                text = subtitle,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
        
        Icon(
            imageVector = Icons.Default.ChevronRight,
            contentDescription = null,
            modifier = Modifier.size(20.dp),
            tint = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}

data class UserProfile(
    val fullName: String,
    val email: String,
    val phone: String,
    val role: String
)

private fun getDemoUser() = UserProfile(
    fullName = "Nguyễn Văn A",
    email = "nguyenvana@example.com",
    phone = "0901234567",
    role = "customer"
)
