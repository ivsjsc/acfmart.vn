package vn.acfmart.mobile.features.home.presentation.components

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import androidx.navigation.NavController
import androidx.navigation.compose.currentBackStackEntryAsState
import vn.acfmart.mobile.R

/**
 * Bottom Navigation Bar với 4 tabs chính
 */
@Composable
fun ACFMartBottomNavigation(
    navController: NavController
) {
    val currentBackStackEntry = navController.currentBackStackEntryAsState()
    val currentRoute = currentBackStackEntry.value?.destination?.route
    
    NavigationBar(
        containerColor = MaterialTheme.colorScheme.surface,
        tonalElevation = 8.dp
    ) {
        val items = listOf(
            BottomNavItem(
                route = "home",
                icon = Icons.Default.Home,
                selectedIcon = Icons.Filled.Home,
                label = "Trang chủ"
            ),
            BottomNavItem(
                route = "tools/qr-verify",
                icon = Icons.Outlined.QrCodeScanner,
                selectedIcon = Icons.Default.QrCodeScanner,
                label = "Quét QR"
            ),
            BottomNavItem(
                route = "store/cart",
                icon = Icons.Outlined.ShoppingCart,
                selectedIcon = Icons.Default.ShoppingCart,
                label = "Giỏ hàng"
            ),
            BottomNavItem(
                route = "account/profile",
                icon = Icons.Outlined.Person,
                selectedIcon = Icons.Default.Person,
                label = "Tài khoản"
            )
        )
        
        items.forEach { item ->
            val selected = currentRoute?.startsWith(item.route.split("/").first()) == true
            
            NavigationBarItem(
                icon = {
                    Icon(
                        imageVector = if (selected) item.selectedIcon else item.icon,
                        contentDescription = item.label
                    )
                },
                label = { Text(item.label) },
                selected = selected,
                onClick = {
                    if (currentRoute != item.route) {
                        navController.navigate(item.route) {
                            // Pop up to the start destination to avoid building up a large stack
                            popUpTo("home") {
                                saveState = true
                            }
                            // Avoid multiple copies of the same destination
                            launchSingleTop = true
                            // Restore state when reselecting a previously selected item
                            restoreState = true
                        }
                    }
                }
            )
        }
    }
}

data class BottomNavItem(
    val route: String,
    val icon: ImageVector,
    val selectedIcon: ImageVector,
    val label: String
)
