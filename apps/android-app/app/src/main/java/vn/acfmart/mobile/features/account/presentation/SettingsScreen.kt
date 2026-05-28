package vn.acfmart.mobile.features.account.presentation

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController

/**
 * Settings Screen - Màn hình cài đặt
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    navController: NavController
) {
    var darkMode by remember { mutableStateOf(false) }
    var notificationsEnabled by remember { mutableStateOf(true) }
    var emailNotifications by remember { mutableStateOf(true) }
    var pushNotifications by remember { mutableStateOf(true) }
    var biometricAuth by remember { mutableStateOf(false) }
    var language by remember { mutableStateOf("Vietnamese") }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { 
                    Text(
                        "Cài đặt",
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
                .verticalScroll(rememberScrollState())
        ) {
            // Appearance Section
            SettingsSection(title = "Giao diện") {
                SettingItem(
                    icon = Icons.Default.DarkMode,
                    title = "Chế độ tối",
                    subtitle = "Sử dụng giao diện tối"
                ) {
                    Switch(
                        checked = darkMode,
                        onCheckedChange = { darkMode = it }
                    )
                }
                
                HorizontalDivider()
                
                SettingItem(
                    icon = Icons.Default.Language,
                    title = "Ngôn ngữ",
                    subtitle = language
                ) {
                    TextButton(onClick = { /* TODO: Show language picker */ }) {
                        Text("Thay đổi")
                    }
                }
            }
            
            Spacer(Modifier.height(16.dp))
            
            // Notifications Section
            SettingsSection(title = "Thông báo") {
                SettingItem(
                    icon = Icons.Default.Notifications,
                    title = "Bật thông báo",
                    subtitle = "Nhận thông báo từ ứng dụng"
                ) {
                    Switch(
                        checked = notificationsEnabled,
                        onCheckedChange = { notificationsEnabled = it }
                    )
                }
                
                HorizontalDivider()
                
                if (notificationsEnabled) {
                    SettingItem(
                        icon = Icons.Default.Email,
                        title = "Thông báo email",
                        subtitle = "Nhận thông báo qua email"
                    ) {
                        Switch(
                            checked = emailNotifications,
                            onCheckedChange = { emailNotifications = it }
                        )
                    }
                    
                    HorizontalDivider()
                    
                    SettingItem(
                        icon = Icons.Default.Phone,
                        title = "Thông báo đẩy",
                        subtitle = "Nhận thông báo đẩy trên điện thoại"
                    ) {
                        Switch(
                            checked = pushNotifications,
                            onCheckedChange = { pushNotifications = it }
                        )
                    }
                }
            }
            
            Spacer(Modifier.height(16.dp))
            
            // Security Section
            SettingsSection(title = "Bảo mật") {
                SettingItem(
                    icon = Icons.Default.Lock,
                    title = "Đổi mật khẩu",
                    subtitle = "Cập nhật mật khẩu mới"
                ) {
                    TextButton(onClick = { /* TODO: Navigate to change password */ }) {
                        Text("Đổi")
                    }
                }
                
                HorizontalDivider()
                
                SettingItem(
                    icon = Icons.Default.Fingerprint,
                    title = "Xác thực sinh trắc học",
                    subtitle = "Sử dụng vân tay hoặc Face ID"
                ) {
                    Switch(
                        checked = biometricAuth,
                        onCheckedChange = { biometricAuth = it }
                    )
                }
                
                HorizontalDivider()
                
                SettingItem(
                    icon = Icons.Default.Phone,
                    title = "Số điện thoại",
                    subtitle = "0901234567"
                ) {
                    TextButton(onClick = { /* TODO: Navigate to change phone */ }) {
                        Text("Thay đổi")
                    }
                }
            }
            
            Spacer(Modifier.height(16.dp))
            
            // Privacy Section
            SettingsSection(title = "Quyền riêng tư") {
                SettingItem(
                    icon = Icons.Default.Policy,
                    title = "Chính sách bảo mật",
                    subtitle = "Xem chính sách bảo mật"
                ) {
                    TextButton(onClick = { /* TODO: Show privacy policy */ }) {
                        Text("Xem")
                    }
                }
                
                HorizontalDivider()
                
                SettingItem(
                    icon = Icons.Default.Description,
                    title = "Điều khoản sử dụng",
                    subtitle = "Xem điều khoản dịch vụ"
                ) {
                    TextButton(onClick = { /* TODO: Show terms */ }) {
                        Text("Xem")
                    }
                }
                
                HorizontalDivider()
                
                SettingItem(
                    icon = Icons.Default.Delete,
                    title = "Xóa tài khoản",
                    subtitle = "Xóa vĩnh viễn tài khoản và dữ liệu"
                ) {
                    TextButton(
                        onClick = { /* TODO: Show confirmation dialog */ },
                        colors = TextButtonDefaults.textButtonColors(
                            contentColor = MaterialTheme.colorScheme.error
                        )
                    ) {
                        Text("Xóa")
                    }
                }
            }
            
            Spacer(Modifier.height(16.dp))
            
            // Cache & Storage
            SettingsSection(title = "Bộ nhớ & Dữ liệu") {
                SettingItem(
                    icon = Icons.Default.Storage,
                    title = "Xóa bộ nhớ đệm",
                    subtitle = "Giải phóng 45.2 MB"
                ) {
                    TextButton(onClick = { /* TODO: Clear cache */ }) {
                        Text("Xóa")
                    }
                }
                
                HorizontalDivider()
                
                SettingItem(
                    icon = Icons.Default.Download,
                    title = "Tải dữ liệu của tôi",
                    subtitle = "Xuất tất cả dữ liệu cá nhân"
                ) {
                    TextButton(onClick = { /* TODO: Export data */ }) {
                        Text("Tải")
                    }
                }
            }
            
            Spacer(Modifier.height(16.dp))
            
            // About Section
            SettingsSection(title = "Về ứng dụng") {
                SettingItem(
                    icon = Icons.Default.Info,
                    title = "Phiên bản ứng dụng",
                    subtitle = "1.0.0 (Build 20260528)"
                )
                
                HorizontalDivider()
                
                SettingItem(
                    icon = Icons.Default.Update,
                    title = "Kiểm tra cập nhật",
                    subtitle = "Phiên bản mới nhất"
                ) {
                    TextButton(onClick = { /* TODO: Check for updates */ }) {
                        Text("Kiểm tra")
                    }
                }
            }
            
            Spacer(Modifier.height(32.dp))
        }
    }
}

@Composable
private fun SettingsSection(
    title: String,
    content: @Composable () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Text(
                text = title,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.primary,
                modifier = Modifier.padding(bottom = 12.dp)
            )
            content()
        }
    }
}

@Composable
private fun SettingItem(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    title: String,
    subtitle: String? = null,
    action: @Composable (() -> Unit)? = null
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
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
            if (subtitle != null) {
                Text(
                    text = subtitle,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
        
        if (action != null) {
            action()
        }
    }
}
