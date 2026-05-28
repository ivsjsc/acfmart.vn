package vn.acfmart.mobile.navigation

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import vn.acfmart.mobile.features.auth.screens.ForgotPasswordScreen
import vn.acfmart.mobile.features.auth.screens.LoginScreen
import vn.acfmart.mobile.features.auth.screens.SignupScreen
import vn.acfmart.mobile.features.home.presentation.HomeScreen

/**
 * Route hằng — sẽ mở rộng theo từng phase (auth, storefront, seller, …).
 */
object Routes {
    const val Splash = "splash"

    // Auth (Phase 1)
    const val Login = "auth/login"
    const val Signup = "auth/signup"
    const val ForgotPassword = "auth/forgot"

    // Storefront (Phase 2-3)
    const val Home = "store/home"
    const val ProductDetail = "store/product/{id}"
    const val Cart = "store/cart"
    const val Checkout = "store/checkout"
    const val OrderList = "account/orders"
    const val Account = "account/profile"
    const val QrVerify = "tools/qr-verify"

    // Seller (Phase 5)
    const val SellerDashboard = "seller/dashboard"
}

@Composable
fun AppNavGraph() {
    val nav = rememberNavController()
    NavHost(navController = nav, startDestination = Routes.Splash) {
        composable(Routes.Splash) {
            SplashScreen(navController = nav)
        }
        
        // Auth Graph (Phase 1)
        composable(Routes.Login) {
            LoginScreen(
                navController = nav,
                onLoginSuccess = {
                    // After login success, navigate to Home
                    nav.navigate(Routes.Home) {
                        popUpTo(Routes.Login) { inclusive = true }
                    }
                }
            )
        }
        
        composable(Routes.Signup) {
            SignupScreen(
                navController = nav,
                onSignupSuccess = {
                    // After signup success, navigate to Home
                    nav.navigate(Routes.Home) {
                        popUpTo(Routes.Signup) { inclusive = true }
                    }
                }
            )
        }
        
        composable(Routes.ForgotPassword) {
            ForgotPasswordScreen(navController = nav)
        }
        
        // Storefront Graph (Phase 2)
        composable(Routes.Home) {
            HomeScreen(navController = nav)
        }
        
        // TODO Phase 3+: product detail, cart, checkout, order screens
        // composable(Routes.ProductDetail) { ProductDetailScreen(navController = nav) }
        // composable(Routes.Cart) { CartScreen(navController = nav) }
    }
}

@Composable
private fun SplashScreen(navController: androidx.navigation.NavController) {
    // Auto navigate to Login after splash delay
    LaunchedEffect(Unit) {
        kotlinx.coroutines.delay(2000) // 2 seconds splash
        navController.navigate(Routes.Login) {
            popUpTo(Routes.Splash) { inclusive = true }
        }
    }
    
    SplashPlaceholder()
}

@Composable
private fun SplashPlaceholder() {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .padding(32.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(
                text = "ACFMart",
                style = MaterialTheme.typography.displayLarge,
                color = MaterialTheme.colorScheme.primary
            )
            Spacer(Modifier.height(8.dp))
            Text(
                text = "Sàn TMĐT chống hàng giả",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Spacer(Modifier.height(24.dp))
            Text(
                text = "Phase 0 — Foundation sẵn sàng.\nFirebase + Hilt + Compose + Material3.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                textAlign = TextAlign.Center
            )
        }
    }
}
