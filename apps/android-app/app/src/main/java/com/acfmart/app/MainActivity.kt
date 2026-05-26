@file:OptIn(
    ExperimentalMaterial3Api::class,
    ExperimentalFoundationApi::class
)
package com.acfmart.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.pager.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import coil.compose.AsyncImage
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.GET

// --- Models & API ---

data class MedusaProduct(
    val id: String,
    val title: String,
    val description: String?,
    val thumbnail: String?,
    val variants: List<MedusaVariant>?
)

data class MedusaVariant(
    val id: String,
    val title: String,
    val prices: List<MedusaPrice>?
)

data class MedusaPrice(
    val amount: Long,
    val currency_code: String
)

data class MedusaResponse(
    val products: List<MedusaProduct>
)

data class MedusaCategoryResponse(
    val product_categories: List<MedusaCategory>
)

data class MedusaCategory(
    val id: String,
    val name: String,
    val handle: String
)

interface MedusaApiService {
    @GET("store/products")
    suspend fun getProducts(): MedusaResponse

    @GET("store/product-categories")
    suspend fun getCategories(): MedusaCategoryResponse
}

object RetrofitClient {
    private const val BASE_URL = "http://10.0.2.2:9000/" // Android Emulator address for localhost

    val instance: MedusaApiService by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(MedusaApiService::class.java)
    }
}

enum class UserRole {
    CUSTOMER, SHOP, MODERATOR, CARRIER, ADMIN
}

data class Product(
    val id: String,
    val name: String,
    val price: Long,
    val description: String,
    val category: String,
    val thumbnail: String? = null,
    val isVerified: Boolean = false,
    val rating: Float = 4.5f
)

data class CartItem(
    val product: Product,
    var quantity: Int
)

// --- ViewModel ---

class AppViewModel : ViewModel() {
    var products by mutableStateOf(listOf<Product>())
    var categories by mutableStateOf(listOf("Tất cả"))
    var isLoadingProducts by mutableStateOf(false)
    var errorMessage by mutableStateOf<String?>(null)
    var cartItems = mutableStateListOf<CartItem>()
    
    init {
        fetchData()
    }

    fun fetchData() {
        viewModelScope.launch {
            isLoadingProducts = true
            errorMessage = null
            try {
                // Fetch Products
                val prodResponse = RetrofitClient.instance.getProducts()
                products = prodResponse.products.map { medusaProd ->
                    val firstPrice = medusaProd.variants?.firstOrNull()?.prices?.firstOrNull()?.amount ?: 0L
                    Product(
                        id = medusaProd.id,
                        name = medusaProd.title,
                        price = firstPrice,
                        description = medusaProd.description ?: "",
                        category = "Sản phẩm", // Simplified for now
                        thumbnail = medusaProd.thumbnail,
                        isVerified = medusaProd.title.contains("ACF") || (1..10).random() > 7
                    )
                }

                // Fetch Categories
                try {
                    val catResponse = RetrofitClient.instance.getCategories()
                    categories = listOf("Tất cả") + catResponse.product_categories.map { it.name }
                } catch (e: Exception) {
                    // Fail silently for categories, use defaults
                    categories = listOf("Tất cả", "Cà phê", "Gia vị", "Thời trang", "Thủ công")
                }

            } catch (e: Exception) {
                errorMessage = "Không thể kết nối với server Medusa. Kiểm tra server tại http://localhost:9000"
                // Fallback for demo
                products = listOf(
                    Product("1", "Cà Phê Arabica Cầu Đất (Mock)", 250000, "Cà phê sạch từ Lâm Đồng", "Cà phê", isVerified = true),
                    Product("2", "Mật Ong Hoa Nhãn (Mock)", 180000, "Mật ong tự nhiên nguyên chất", "Thực phẩm"),
                    Product("3", "Trà Sen Đồng Tháp (Mock)", 120000, "Trà thơm đặc sản", "Cà phê")
                )
                categories = listOf("Tất cả", "Cà phê", "Gia vị", "Thực phẩm")
            } finally {
                isLoadingProducts = false
            }
        }
    }

    fun addToCart(product: Product) {
        val existing = cartItems.find { it.product.id == product.id }
        if (existing != null) {
            existing.quantity++
        } else {
            cartItems.add(CartItem(product, 1))
        }
    }

    fun removeFromCart(productId: String) {
        cartItems.removeIf { it.product.id == productId }
    }

    val cartTotal: Long get() = cartItems.sumOf { it.product.price * it.quantity }

    fun clearCart() {
        cartItems.clear()
    }
}

// --- UI Components ---

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                AppNavigation()
            }
        }
    }
}

@Composable
fun AppNavigation() {
    val navController = rememberNavController()
    val viewModel: AppViewModel = viewModel()
    var userRole by remember { mutableStateOf<UserRole?>(null) }

    NavHost(navController = navController, startDestination = if (userRole == null) "login" else "role_selection") {
        composable("login") {
            LoginScreen(onLogin = {
                userRole = UserRole.CUSTOMER // Default for demo
                navController.navigate("role_selection")
            })
        }
        composable("role_selection") {
            RoleSelectionScreen(
                onRoleSelect = { role ->
                    userRole = role
                    navController.navigate("dashboard")
                },
                onLogout = {
                    userRole = null
                    navController.navigate("login")
                }
            )
        }
        composable("dashboard") {
            userRole?.let { role ->
                MainDashboard(
                    role = role,
                    onLogout = {
                        userRole = null
                        navController.navigate("login")
                    },
                    navController = navController,
                    cartCount = viewModel.cartItems.sumOf { it.quantity }
                )
            }
        }
        composable("product_list") {
            ProductListScreen(navController)
        }
        composable("product_detail/{productId}") { backStackEntry ->
            val productId = backStackEntry.arguments?.getString("productId") ?: ""
            ProductDetailScreen(productId, navController, viewModel)
        }
        composable("cart") {
            CartScreen(navController, viewModel)
        }
        composable("verify_product/{productId}") { backStackEntry ->
            val productId = backStackEntry.arguments?.getString("productId") ?: "unknown"
            ProductVerificationScreen(productId, navController)
        }
        composable("checkout") {
            CheckoutScreen(navController, viewModel)
        }
        composable("social_feed") {
            SocialFeedScreen(navController)
        }
        composable("aivy") {
            AivyScreen(navController)
        }
    }
}

@Composable
fun LoginScreen(onLogin: () -> Unit) {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Icon(
            Icons.Default.VerifiedUser,
            contentDescription = null,
            modifier = Modifier.size(80.dp),
            tint = MaterialTheme.colorScheme.primary
        )
        Spacer(modifier = Modifier.height(16.dp))
        Text("ACF Mart", fontSize = 32.sp, fontWeight = FontWeight.Bold)
        Text("Mua sắm chính hãng & chống giả", color = Color.Gray)
        
        Spacer(modifier = Modifier.height(48.dp))
        
        OutlinedTextField(
            value = email,
            onValueChange = { email = it },
            label = { Text("Email/Số điện thoại") },
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(modifier = Modifier.height(16.dp))
        OutlinedTextField(
            value = password,
            onValueChange = { password = it },
            label = { Text("Mật khẩu") },
            modifier = Modifier.fillMaxWidth()
        )
        
        Spacer(modifier = Modifier.height(32.dp))
        
        Button(
            onClick = onLogin,
            modifier = Modifier.fillMaxWidth().height(56.dp),
            shape = RoundedCornerShape(8.dp)
        ) {
            Text("Đăng Nhập")
        }
        
        TextButton(onClick = { }) {
            Text("Chưa có tài khoản? Đăng ký ngay")
        }
    }
}

@Composable
fun RoleSelectionScreen(onRoleSelect: (UserRole) -> Unit, onLogout: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) {
            IconButton(onClick = onLogout) {
                Icon(Icons.Default.Logout, contentDescription = "Logout")
            }
        }
        
        Text("Chọn Chế Độ Truy Cập", fontSize = 24.sp, fontWeight = FontWeight.Bold)
        Spacer(modifier = Modifier.height(8.dp))
        Text("Hệ sinh thái ACF hỗ trợ nhiều vai trò", color = Color.Gray)
        
        Spacer(modifier = Modifier.height(32.dp))
        
        RoleCard("Người Mua Hàng", "Mua sắm, xác thực hàng thật", Color(0xFF2196F3), Icons.Default.ShoppingCart) {
            onRoleSelect(UserRole.CUSTOMER)
        }
        RoleCard("Chủ Cửa Hàng", "Quản lý sản phẩm, đơn hàng", Color(0xFF4CAF50), Icons.Default.Storefront) {
            onRoleSelect(UserRole.SHOP)
        }
        RoleCard("Đơn Vị Vận Chuyển", "Giao hàng, cập nhật lộ trình", Color(0xFFFF9800), Icons.Default.LocalShipping) {
            onRoleSelect(UserRole.CARRIER)
        }
        RoleCard("Kiểm Duyệt Viên", "Xác minh chất lượng sản phẩm", Color(0xFF9C27B0), Icons.Default.FactCheck) {
            onRoleSelect(UserRole.MODERATOR)
        }
    }
}

@Composable
fun RoleCard(label: String, desc: String, color: Color, icon: ImageVector, onClick: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp)
            .clickable(onClick = onClick),
        colors = CardDefaults.cardColors(containerColor = color.copy(alpha = 0.1f)),
        border = androidx.compose.foundation.BorderStroke(1.dp, color.copy(alpha = 0.3f))
    ) {
        Row(
            modifier = Modifier.padding(20.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Surface(color = color, shape = CircleShape, modifier = Modifier.size(48.dp)) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(icon, contentDescription = null, tint = Color.White)
                }
            }
            Spacer(modifier = Modifier.width(16.dp))
            Column {
                Text(label, fontWeight = FontWeight.Bold, fontSize = 18.sp, color = color)
                Text(desc, fontSize = 14.sp, color = Color.DarkGray)
            }
        }
    }
}

@Composable
fun MainDashboard(role: UserRole, onLogout: () -> Unit, navController: NavController, cartCount: Int) {
    var selectedTab by remember { mutableIntStateOf(0) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { 
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Surface(
                            modifier = Modifier.size(40.dp),
                            color = Color.Red,
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Icon(
                                Icons.Default.VerifiedUser, 
                                contentDescription = null, 
                                tint = Color.White,
                                modifier = Modifier.padding(4.dp)
                            )
                        }
                        
                        OutlinedTextField(
                            value = "",
                            onValueChange = {},
                            placeholder = { Text("Tìm sản phẩm chính hãng...", fontSize = 14.sp) },
                            modifier = Modifier.weight(1f).height(48.dp),
                            shape = RoundedCornerShape(24.dp),
                            leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = Color.Gray) },
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedContainerColor = Color(0xFFF5F5F5),
                                unfocusedContainerColor = Color(0xFFF5F5F5),
                                focusedBorderColor = Color.Transparent,
                                unfocusedBorderColor = Color.Transparent
                            ),
                            singleLine = true
                        )
                    }
                },
                actions = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        IconButton(onClick = { }) {
                            Icon(Icons.Default.NotificationsNone, contentDescription = null)
                        }
                        BadgedBox(
                            badge = { 
                                if (cartCount > 0) {
                                    Badge { Text(cartCount.toString()) }
                                }
                            },
                            modifier = Modifier.padding(end = 8.dp)
                        ) {
                            IconButton(onClick = { navController.navigate("cart") }) {
                                Icon(Icons.Default.ShoppingCart, contentDescription = "Cart")
                            }
                        }
                    }
                }
            )
        },
        bottomBar = {
            NavigationBar(containerColor = Color.White) {
                NavigationBarItem(
                    selected = selectedTab == 0,
                    onClick = { selectedTab = 0 },
                    icon = { Icon(Icons.Default.Home, contentDescription = null) },
                    label = { Text("Khám Phá") }
                )
                NavigationBarItem(
                    selected = selectedTab == 1,
                    onClick = { selectedTab = 1 },
                    icon = { Icon(Icons.Default.RssFeed, contentDescription = null) },
                    label = { Text("Cộng Đồng") }
                )
                NavigationBarItem(
                    selected = selectedTab == 2,
                    onClick = { selectedTab = 2 },
                    icon = { Icon(Icons.Default.ReceiptLong, contentDescription = null) },
                    label = { Text("Đơn Hàng") }
                )
                NavigationBarItem(
                    selected = selectedTab == 3,
                    onClick = { selectedTab = 3 },
                    icon = { Icon(Icons.Default.Person, contentDescription = null) },
                    label = { Text("Cá Nhân") }
                )
            }
        },
        floatingActionButton = {
            AivyBubble { navController.navigate("aivy") }
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            when(selectedTab) {
                0 -> RoleSpecificContent(role, navController)
                1 -> SocialFeedScreen(navController)
                2 -> Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { Text("Danh sách đơn hàng") }
                3 -> ProfileScreen(navController, onLogout)
            }
        }
    }
}

@Composable
fun AivyBubble(onClick: () -> Unit) {
    Box(
        modifier = Modifier
            .size(70.dp)
            .padding(bottom = 12.dp)
            .background(
                brush = androidx.compose.ui.graphics.Brush.linearGradient(
                    colors = listOf(Color(0xFFE64A19), Color(0xFFFF9800))
                ),
                shape = RoundedCornerShape(24.dp)
            )
            .clickable { onClick() },
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text("A", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 24.sp)
            Text("Aivy", color = Color.White, fontSize = 10.sp)
        }
        Surface(
            modifier = Modifier.align(Alignment.TopEnd).size(20.dp),
            color = Color(0xFF00C853),
            shape = CircleShape,
            border = androidx.compose.foundation.BorderStroke(2.dp, Color.White)
        ) {
            Box(contentAlignment = Alignment.Center) {
                Text("2", color = Color.White, fontSize = 10.sp, fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
fun ProductListScreenContent(navController: NavController) {
    val viewModel: AppViewModel = viewModel()
    var selectedCategory by remember { mutableStateOf("Tất cả") }
    var searchQuery by remember { mutableStateOf("") }
    
    val filteredProducts = viewModel.products.filter { product ->
        val matchesCategory = selectedCategory == "Tất cả" || product.category == selectedCategory
        val matchesSearch = product.name.contains(searchQuery, ignoreCase = true)
        matchesCategory && matchesSearch
    }

    Column(modifier = Modifier.fillMaxSize()) {
        if (viewModel.isLoadingProducts) {
            LinearProgressIndicator(modifier = Modifier.fillMaxWidth())
        }
        
        // --- Search Bar ---
        OutlinedTextField(
            value = searchQuery,
            onValueChange = { searchQuery = it },
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 8.dp),
            placeholder = { Text("Tìm kiếm sản phẩm...") },
            leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
            singleLine = true,
            shape = RoundedCornerShape(12.dp)
        )

        viewModel.errorMessage?.let { msg ->
            Card(
                modifier = Modifier.padding(16.dp).fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color(0xFFFFEBEE))
            ) {
                Row(modifier = Modifier.padding(8.dp), verticalAlignment = Alignment.CenterVertically) {
                    Text(msg, color = Color(0xFFC62828), fontSize = 11.sp, modifier = Modifier.weight(1f))
                    TextButton(onClick = { viewModel.fetchData() }) {
                        Text("Thử lại", fontSize = 11.sp)
                    }
                }
            }
        }

        LazyRow(
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(viewModel.categories) { cat ->
                FilterChip(
                    selected = selectedCategory == cat,
                    onClick = { selectedCategory = cat },
                    label = { Text(cat) }
                )
            }
        }
        
        if (viewModel.isLoadingProducts) {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(5) { SkeletonCard() }
            }
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(filteredProducts) { product ->
                    ProductItemEnhanced(product) {
                        navController.navigate("product_detail/${product.id}")
                    }
                }
            }
        }
    }
}

@Composable
fun SocialFeedScreen(navController: NavController) {
    var selectedSubTab by remember { mutableIntStateOf(0) }
    
    Column(
        modifier = Modifier.fillMaxSize()
    ) {
        TabRow(selectedTabIndex = selectedSubTab, containerColor = Color.White) {
            Tab(selected = selectedSubTab == 0, onClick = { selectedSubTab = 0 }, text = { Text("Thịnh hành") })
            Tab(selected = selectedSubTab == 1, onClick = { selectedSubTab = 1 }, text = { Text("Theo dõi") })
        }
        
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            items(5) { index ->
                FeedItem(index)
            }
        }
    }
}

@Composable
fun FeedItem(index: Int) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(modifier = Modifier.size(40.dp).background(Color.LightGray, CircleShape))
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                    Text("Người dùng ACF $index", fontWeight = FontWeight.Bold)
                    Text("2 giờ trước", fontSize = 12.sp, color = Color.Gray)
                }
                Spacer(modifier = Modifier.weight(1f))
                Icon(Icons.Default.MoreVert, contentDescription = null)
            }
            Spacer(modifier = Modifier.height(12.dp))
            Text("Sản phẩm này tuyệt vời quá! Tôi vừa quét mã xác thực và hoàn toàn yên tâm về chất lượng. #ACF #ChinhHang")
            Spacer(modifier = Modifier.height(12.dp))
            Box(modifier = Modifier.fillMaxWidth().height(200.dp).background(Color(0xFFF0F0F0), RoundedCornerShape(8.dp)), contentAlignment = Alignment.Center) {
                Icon(Icons.Default.Image, contentDescription = null, tint = Color.LightGray, modifier = Modifier.size(48.dp))
            }
            Spacer(modifier = Modifier.height(12.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(24.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.FavoriteBorder, contentDescription = null, modifier = Modifier.size(20.dp))
                    Text(" 24", fontSize = 14.sp)
                }
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.ChatBubbleOutline, contentDescription = null, modifier = Modifier.size(20.dp))
                    Text(" 12", fontSize = 14.sp)
                }
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Share, contentDescription = null, modifier = Modifier.size(20.dp))
                }
            }
        }
    }
}

@Composable
fun ProfileScreen(navController: NavController, onLogout: () -> Unit) {
    Column(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Box(
            modifier = Modifier.size(100.dp).background(Color(0xFFE0E0E0), CircleShape),
            contentAlignment = Alignment.Center
        ) {
            Icon(Icons.Default.Person, contentDescription = null, modifier = Modifier.size(60.dp), tint = Color.Gray)
        }
        Spacer(modifier = Modifier.height(16.dp))
        Text("Nguyễn Văn A", fontSize = 20.sp, fontWeight = FontWeight.Bold)
        Text("Khách hàng Thân thiết (Gold)", color = Color(0xFFFFA000))
        
        Spacer(modifier = Modifier.height(32.dp))
        
        ProfileMenuItem(Icons.Default.Wallet, "Ví ACF", "2,500,000 VND")
        ProfileMenuItem(Icons.Default.Redeem, "Ưu đãi của tôi", "12 Voucher")
        ProfileMenuItem(Icons.Default.LocationOn, "Địa chỉ nhận hàng")
        ProfileMenuItem(Icons.Default.Settings, "Cài đặt tài khoản")
        ProfileMenuItem(Icons.Default.HelpOutline, "Trung tâm trợ giúp")
        
        Spacer(modifier = Modifier.weight(1f))
        
        Button(
            onClick = onLogout,
            modifier = Modifier.fillMaxWidth(),
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFFEBEE), contentColor = Color.Red),
            elevation = null
        ) {
            Icon(Icons.Default.Logout, contentDescription = null)
            Spacer(modifier = Modifier.width(8.dp))
            Text("Đăng Xuất")
        }
    }
}

@Composable
fun ProfileMenuItem(icon: ImageVector, label: String, value: String? = null, hasBadge: Boolean = false) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(icon, contentDescription = null, tint = Color.Gray)
        Spacer(modifier = Modifier.width(16.dp))
        Text(label, modifier = Modifier.weight(1f))
        if (value != null) {
            Text(value, color = Color.Gray, fontSize = 14.sp)
        }
        Icon(Icons.Default.ChevronRight, contentDescription = null, tint = Color.LightGray)
    }
}

@Composable
fun RoleSpecificContent(role: UserRole, navController: NavController) {
    when (role) {
        UserRole.CUSTOMER -> CustomerDashboard(navController)
        UserRole.SHOP -> ShopDashboard()
        UserRole.CARRIER -> CarrierDashboard()
        UserRole.MODERATOR -> ModeratorDashboard()
        UserRole.ADMIN -> AdminDashboard()
    }
}

@Composable
fun CustomerDashboard(navController: NavController) {
    LazyColumn(
        modifier = Modifier.fillMaxSize()
    ) {
        item {
            BannerCarousel()
        }
        
        item {
            Row(
                modifier = Modifier.fillMaxWidth().padding(16.dp),
                horizontalArrangement = Arrangement.SpaceAround
            ) {
                QuickActionItem(Icons.Default.QrCodeScanner, "Xác Thực") { navController.navigate("verify_product/unknown") }
                QuickActionItem(Icons.Default.LocalMall, "Cửa Hàng") { }
                QuickActionItem(Icons.Default.Favorite, "Yêu Thích") { }
                QuickActionItem(Icons.Default.SupportAgent, "Hỗ Trợ") { navController.navigate("aivy") }
            }
        }
        
        item {
            Row(
                modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("Gợi Ý Cho Bạn", fontSize = 18.sp, fontWeight = FontWeight.Bold)
                TextButton(onClick = { }) { Text("Xem tất cả") }
            }
        }
        
        item {
            ProductListScreenContent(navController)
        }
    }
}

@Composable
fun BannerCarousel() {
    val pagerState = rememberPagerState(pageCount = { 3 })
    
    HorizontalPager(
        state = pagerState,
        modifier = Modifier
            .fillMaxWidth()
            .height(180.dp)
            .padding(16.dp)
    ) { page ->
        Card(
            modifier = Modifier.fillMaxSize(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = when(page) {
                0 -> Color(0xFFE3F2FD)
                1 -> Color(0xFFF3E5F5)
                else -> Color(0xFFE8F5E9)
            })
        ) {
            Box(contentAlignment = Alignment.Center, modifier = Modifier.fillMaxSize()) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("Khuyến mãi đặc biệt $page", fontWeight = FontWeight.Bold, fontSize = 20.sp)
                    Text("Giảm giá tới 50% cho các sản phẩm OCOP", fontSize = 14.sp)
                    Spacer(modifier = Modifier.height(12.dp))
                    Button(onClick = { }) { Text("Mua Ngay") }
                }
            }
        }
    }
}

@Composable
fun QuickActionItem(icon: ImageVector, label: String, onClick: () -> Unit) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier.clickable(onClick = onClick)
    ) {
        Surface(
            color = Color(0xFFF5F5F5),
            shape = CircleShape,
            modifier = Modifier.size(56.dp)
        ) {
            Box(contentAlignment = Alignment.Center) {
                Icon(icon, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
            }
        }
        Spacer(modifier = Modifier.height(8.dp))
        Text(label, fontSize = 12.sp, fontWeight = FontWeight.Medium)
    }
}

@Composable
fun SkeletonCard() {
    Card(
        modifier = Modifier.fillMaxWidth().height(100.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFFF5F5F5)),
        shape = RoundedCornerShape(12.dp)
    ) { }
}

@Composable
fun ShopDashboard() {
    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("Tổng Quan Cửa Hàng", fontSize = 22.sp, fontWeight = FontWeight.Bold)
        Spacer(modifier = Modifier.height(16.dp))
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            StatCard("Doanh thu", "12.5M", Color.Blue, Modifier.weight(1f))
            StatCard("Đơn hàng", "48", Color.Green, Modifier.weight(1f))
        }
        Spacer(modifier = Modifier.height(24.dp))
        Text("Sản Phẩm Đang Bán", fontWeight = FontWeight.Bold)
        // ... list of shop products
    }
}

@Composable
fun StatCard(label: String, value: String, color: Color, modifier: Modifier) {
    Card(modifier = modifier) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(label, fontSize = 12.sp, color = Color.Gray)
            Text(value, fontSize = 24.sp, fontWeight = FontWeight.Bold, color = color)
        }
    }
}

@Composable
fun CarrierDashboard() {
    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("Đơn Hàng Cần Giao", fontSize = 22.sp, fontWeight = FontWeight.Bold)
        Spacer(modifier = Modifier.height(16.dp))
        Card(modifier = Modifier.fillMaxWidth()) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("Đơn hàng #ACF12345", fontWeight = FontWeight.Bold)
                Text("Từ: Cửa hàng Cafe Arabica")
                Text("Đến: 123 Đường Lê Lợi, TP. Đà Lạt")
                Spacer(modifier = Modifier.height(12.dp))
                Button(onClick = { }, modifier = Modifier.fillMaxWidth()) {
                    Text("Nhận Đơn")
                }
            }
        }
    }
}

@Composable
fun ModeratorDashboard() {
    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("Sản Phẩm Chờ Duyệt", fontSize = 22.sp, fontWeight = FontWeight.Bold)
        // ... list of products to verify
    }
}

@Composable
fun AdminDashboard() {
    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("Quản Trị Hệ Thống", fontSize = 22.sp, fontWeight = FontWeight.Bold)
    }
}

@Composable
fun ProductListScreen(navController: NavController) {
    val viewModel: AppViewModel = viewModel()
    val categories = listOf("Tất cả", "Cà phê", "Gia vị", "Thời trang", "Thủ công")
    var selectedCategory by remember { mutableStateOf("Tất cả") }
    
    val filteredProducts = if (selectedCategory == "Tất cả") viewModel.products else viewModel.products.filter { it.category == selectedCategory }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Danh Sách Sản Phẩm") },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { padding ->
        val viewModel: AppViewModel = viewModel()
        Column(modifier = Modifier.padding(padding)) {
            if (viewModel.isLoadingProducts) {
                LinearProgressIndicator(modifier = Modifier.fillMaxWidth())
            }
            
            viewModel.errorMessage?.let { msg ->
                Card(
                    modifier = Modifier.padding(16.dp).fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFFFFEBEE))
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text(msg, color = Color(0xFFC62828), fontSize = 12.sp)
                        TextButton(onClick = { viewModel.fetchProducts() }) {
                            Text("Thử lại")
                        }
                    }
                }
            }

            LazyRow(
                items(categories) { cat ->
                    FilterChip(
                        selected = selectedCategory == cat,
                        onClick = { selectedCategory = cat },
                        label = { Text(cat) }
                    )
                }
            }
            
            if (viewModel.isLoadingProducts) {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(5) { SkeletonCard() }
                }
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(filteredProducts) { product ->
                        ProductItemEnhanced(product) {
                            navController.navigate("product_detail/${product.id}")
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun ProductItemEnhanced(product: Product, onClick: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(12.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Row(modifier = Modifier.padding(12.dp)) {
            Box(
                modifier = Modifier.size(80.dp).background(Color.LightGray, RoundedCornerShape(8.dp)),
                contentAlignment = Alignment.Center
            ) {
                if (product.thumbnail != null) {
                    AsyncImage(
                        model = product.thumbnail,
                        contentDescription = product.name,
                        modifier = Modifier.fillMaxSize().clip(RoundedCornerShape(8.dp))
                    )
                } else {
                    Icon(Icons.Default.Image, contentDescription = null, tint = Color.Gray)
                }
            }
            Spacer(modifier = Modifier.width(16.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(text = product.name, fontWeight = FontWeight.Bold, fontSize = 16.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
                Text(text = formatPrice(product.price), color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(4.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Star, contentDescription = null, tint = Color(0xFFFFB300), modifier = Modifier.size(14.dp))
                    Text(text = " ${product.rating}", fontSize = 12.sp, color = Color.Gray)
                    if (product.isVerified) {
                        Spacer(modifier = Modifier.width(8.dp))
                        Surface(color = Color(0xFFE8F5E9), shape = RoundedCornerShape(4.dp)) {
                            Text("Đã Xác Thực", color = Color(0xFF2E7D32), fontSize = 10.sp, modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp), fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun ProductDetailScreen(productId: String, navController: NavController, viewModel: AppViewModel) {
    // Mock fetch
    val product = Product(productId, "Cà Phê Arabica Cầu Đất", 250000, "Cà phê sạch từ Lâm Đồng, được trồng ở độ cao 1500m. Sản phẩm đạt chứng nhận OCOP 4 sao và được bảo vệ bởi hệ thống chống hàng giả ACF.", "Cà phê", true)

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Chi Tiết Sản Phẩm") },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        },
        bottomBar = {
            BottomAppBar(containerColor = Color.White) {
                Row(modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    OutlinedButton(
                        onClick = { navController.navigate("verify_product/${product.id}") },
                        modifier = Modifier.weight(1f).height(48.dp),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Icon(Icons.Default.QrCodeScanner, contentDescription = null)
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Xác Thực")
                    }
                    Button(
                        onClick = { 
                            viewModel.addToCart(product)
                            navController.navigate("cart") 
                        },
                        modifier = Modifier.weight(1f).height(48.dp),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text("Mua Ngay")
                    }
                }
            }
        }
    ) { padding ->
        LazyColumn(modifier = Modifier.padding(padding).fillMaxSize()) {
            item {
                Box(modifier = Modifier.fillMaxWidth().height(300.dp).background(Color(0xFFF0F0F0)), contentAlignment = Alignment.Center) {
                    Icon(Icons.Default.Image, contentDescription = null, modifier = Modifier.size(100.dp), tint = Color.LightGray)
                }
            }
            item {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(text = product.name, fontSize = 24.sp, fontWeight = FontWeight.Bold)
                    Text(text = formatPrice(product.price), fontSize = 22.sp, color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(text = "Mô Tả Sản Phẩm", fontWeight = FontWeight.Bold, fontSize = 18.sp)
                    Text(text = product.description, color = Color.Gray, lineHeight = 22.sp)
                    
                    if (product.isVerified) {
                        Spacer(modifier = Modifier.height(24.dp))
                        Card(colors = CardDefaults.cardColors(containerColor = Color(0xFFE8F5E9)), shape = RoundedCornerShape(12.dp)) {
                            Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.Verified, contentDescription = null, tint = Color(0xFF4CAF50))
                                Spacer(modifier = Modifier.width(12.dp))
                                Text("Sản phẩm này được bảo hộ bởi ACF. Cam kết 100% hàng thật.", fontWeight = FontWeight.Medium, color = Color(0xFF2E7D32))
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun CartScreen(navController: NavController, viewModel: AppViewModel) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Giỏ Hàng") },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        },
        bottomBar = {
            if (viewModel.cartItems.isNotEmpty()) {
                Surface(shadowElevation = 8.dp) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("Tổng cộng:", fontSize = 18.sp)
                            Text(formatPrice(viewModel.cartTotal), fontSize = 18.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                        }
                        Spacer(modifier = Modifier.height(16.dp))
                        Button(onClick = { navController.navigate("checkout") }, modifier = Modifier.fillMaxWidth().height(56.dp)) {
                            Text("Thanh Toán")
                        }
                    }
                }
            }
        }
    ) { padding ->
        if (viewModel.cartItems.isEmpty()) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("Giỏ hàng trống", color = Color.Gray)
            }
        } else {
            LazyColumn(modifier = Modifier.padding(padding).fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                items(viewModel.cartItems) { item ->
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(modifier = Modifier.size(60.dp).background(Color.LightGray, RoundedCornerShape(8.dp)))
                        Spacer(modifier = Modifier.width(12.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(item.product.name, fontWeight = FontWeight.Bold)
                            Text(formatPrice(item.product.price), color = Color.Gray)
                        }
                        IconButton(onClick = { viewModel.removeFromCart(item.product.id) }) {
                            Icon(Icons.Default.Delete, contentDescription = null, tint = Color.Red)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun ProductVerificationScreen(productId: String, navController: NavController) {
    var isVerifying by remember { mutableStateOf(false) }
    var result by remember { mutableStateOf<VerificationResult?>(null) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Xác Thực Chống Giả") },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier.padding(padding).padding(16.dp).fillMaxSize(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text("Vui lòng đưa mã QR vào khung hình", fontSize = 16.sp, textAlign = TextAlign.Center)
            if (productId != "unknown") {
                Text("Sản phẩm ID: $productId", fontSize = 12.sp, color = Color.Gray)
            }
            Spacer(modifier = Modifier.height(32.dp))
            
            Box(modifier = Modifier.size(280.dp).background(Color.Black, RoundedCornerShape(24.dp)), contentAlignment = Alignment.Center) {
                if (isVerifying) {
                    CircularProgressIndicator(color = Color.White)
                } else {
                    Icon(Icons.Default.QrCodeScanner, contentDescription = null, modifier = Modifier.size(120.dp), tint = Color.White)
                }
                // Scan line animation simulation (simplified)
                if (isVerifying) {
                    Box(modifier = Modifier.fillMaxWidth().height(2.dp).background(Color.Green).align(Alignment.TopCenter))
                }
            }
            
            Spacer(modifier = Modifier.height(32.dp))
            
            if (result == null) {
                Button(onClick = { isVerifying = true }, enabled = !isVerifying, modifier = Modifier.fillMaxWidth().height(56.dp)) {
                    Text(if (isVerifying) "Đang phân tích..." else "Quét Mã")
                }
            }
            
            LaunchedEffect(isVerifying) {
                if (isVerifying) {
                    delay(2500)
                    result = VerificationResult(
                        isValid = true,
                        authenticity = "Xác Thực Thành Công",
                        details = "Sản phẩm: Cà Phê Arabica Cầu Đất\nNSX: 15/05/2024\nSố lô: ACF-VN-00124\nĐơn vị kiểm chứng: Ban Quản lý OCOP Lâm Đồng"
                    )
                    isVerifying = false
                }
            }
            
            result?.let { res ->
                Spacer(modifier = Modifier.height(16.dp))
                VerificationResultCard(res)
                Spacer(modifier = Modifier.height(24.dp))
                Button(onClick = { navController.popBackStack() }, modifier = Modifier.fillMaxWidth()) {
                    Text("Hoàn Tất")
                }
            }
        }
    }
}

@Composable
fun CheckoutScreen(navController: NavController, viewModel: AppViewModel) {
    Scaffold(
        topBar = {
            TopAppBar(title = { Text("Thanh Toán") })
        }
    ) { padding ->
        Column(modifier = Modifier.padding(padding).padding(16.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            Icon(Icons.Default.CheckCircle, contentDescription = null, modifier = Modifier.size(100.dp), tint = Color(0xFF4CAF50))
            Spacer(modifier = Modifier.height(24.dp))
            Text("Đặt hàng thành công!", fontSize = 24.sp, fontWeight = FontWeight.Bold)
            Text("Số tiền: ${formatPrice(viewModel.cartTotal)}", fontSize = 18.sp, color = Color.Gray)
            Spacer(modifier = Modifier.height(32.dp))
            Text("Tiền của bạn sẽ được giữ bởi ACF Escrow cho đến khi bạn nhận được hàng và xác nhận hài lòng.", textAlign = TextAlign.Center, color = Color.Gray)
            Spacer(modifier = Modifier.weight(1f))
            Button(onClick = { 
                viewModel.clearCart()
                navController.navigate("dashboard") { popUpTo("dashboard") { inclusive = true } } 
            }, modifier = Modifier.fillMaxWidth()) {
                Text("Về Trang Chủ")
            }
        }
    }
}

data class VerificationResult(val isValid: Boolean, val authenticity: String, val details: String)

@Composable
fun VerificationResultCard(result: VerificationResult) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = if (result.isValid) Color(0xFFE8F5E9) else Color(0xFFFFEBEE)),
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(modifier = Modifier.padding(20.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(if (result.isValid) Icons.Default.CheckCircle else Icons.Default.Warning, contentDescription = null, tint = if (result.isValid) Color(0xFF4CAF50) else Color(0xFFF44336))
                Spacer(modifier = Modifier.width(12.dp))
                Text(text = result.authenticity, fontWeight = FontWeight.Bold, fontSize = 20.sp, color = if (result.isValid) Color(0xFF2E7D32) else Color(0xFFC62828))
            }
            Spacer(modifier = Modifier.height(12.dp))
            Text(text = result.details, lineHeight = 20.sp)
        }
    }
}

// --- Utils ---

fun formatPrice(amount: Long): String {
    return String.format("%,d VND", amount)
}

fun getRoleName(role: UserRole): String {
    return when (role) {
        UserRole.CUSTOMER -> "Khách Hàng"
        UserRole.SHOP -> "Chủ Cửa Hàng"
        UserRole.MODERATOR -> "Kiểm Duyệt Viên"
        UserRole.CARRIER -> "Người Giao Hàng"
        UserRole.ADMIN -> "Quản Trị Viên"
    }
}

@Preview(showBackground = true)
@Composable
fun LoginPreview() {
    MaterialTheme { LoginScreen(onLogin = {}) }
}

@Preview(showBackground = true)
@Composable
fun SocialFeedPreview() {
    MaterialTheme {
        SocialFeedScreen(navController = rememberNavController())
    }
}

@Composable
fun AivyScreen(navController: NavController) {
    val scrollState = rememberScrollState()
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Trợ lý Aivy") },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(Color(0xFFF8F9FA))
                .verticalScroll(scrollState)
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Aivy Intro Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                shape = RoundedCornerShape(16.dp),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(60.dp)
                            .background(
                                brush = androidx.compose.ui.graphics.Brush.linearGradient(
                                    colors = listOf(Color(0xFFE64A19), Color(0xFFFF9800))
                                ),
                                shape = CircleShape
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("A", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 24.sp)
                    }
                    Spacer(modifier = Modifier.width(16.dp))
                    Column {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text("Aivy", fontWeight = FontWeight.Bold, fontSize = 20.sp)
                            Spacer(modifier = Modifier.width(4.dp))
                            Icon(Icons.Default.AutoAwesome, contentDescription = null, tint = Color(0xFFFFA000), modifier = Modifier.size(16.dp))
                        }
                        Text("Trợ lý AI (nữ) · Phát triển bởi IVS JSC", fontSize = 12.sp, color = Color.Gray)
                    }
                }
                Text(
                    text = "Aivy là trợ lý AI thông minh, lịch sự và thân thiện. Em chỉ truy cập dữ liệu tài khoản hoặc hệ thống khi bạn yêu cầu rõ ràng – không tự ý tìm kiếm hay hành động ngoài phạm vi.",
                    fontSize = 14.sp,
                    color = Color.DarkGray,
                    lineHeight = 20.sp,
                    modifier = Modifier.padding(start = 16.dp, end = 16.dp, bottom = 16.dp)
                )
            }
            
            Spacer(modifier = Modifier.height(24.dp))
            
            Text("Aivy có thể giúp gì?", fontWeight = FontWeight.Bold, fontSize = 16.sp, modifier = Modifier.align(Alignment.Start))
            Spacer(modifier = Modifier.height(12.dp))
            
            val capabilities = listOf(
                Triple(Icons.Default.ManageSearch, "Tra cứu tài khoản & đơn hàng", "Khi bạn yêu cầu – kiểm tra đơn, ví, điểm"),
                Triple(Icons.Default.VerifiedUser, "Hướng dẫn xác thực QR", "Từng bước quét và đọc kết quả"),
                Triple(Icons.Default.ContactSupport, "Giải đáp chính sách", "Đổi trả, vận chuyển, thanh toán"),
                Triple(Icons.Default.EmojiObjects, "Tư vấn Seller & Affiliate", "Khi bạn muốn tham gia kinh doanh")
            )
            
            capabilities.forEach { item ->
                Card(
                    modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                        Surface(color = Color(0xFFFFF3E0), shape = CircleShape, modifier = Modifier.size(40.dp)) {
                            Box(contentAlignment = Alignment.Center) {
                                Icon(item.first, contentDescription = null, tint = Color(0xFFE64A19), modifier = Modifier.size(20.dp))
                            }
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text(item.second, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                            Text(item.third, fontSize = 12.sp, color = Color.Gray)
                        }
                    }
                }
            }
            
            Spacer(modifier = Modifier.height(24.dp))
            
            // AI Chat Section Simulation
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color(0xFFE64A19)),
                shape = RoundedCornerShape(topStart = 16.dp, topEnd = 16.dp)
            ) {
                Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                    Box(modifier = Modifier.size(32.dp).background(Color.White.copy(alpha = 0.2f), CircleShape), contentAlignment = Alignment.Center) {
                        Text("A", color = Color.White, fontWeight = FontWeight.Bold)
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Text("Aivy · Trợ lý AI (nữ) · Đang trực tuyến", color = Color.White, fontSize = 14.sp)
                    Spacer(modifier = Modifier.weight(1f))
                    Icon(Icons.Default.Refresh, contentDescription = null, tint = Color.White)
                }
            }
            
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                shape = RoundedCornerShape(bottomStart = 16.dp, bottomEnd = 16.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(verticalAlignment = Alignment.Top) {
                        Box(
                            modifier = Modifier.size(32.dp).background(Color(0xFFE64A19), CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Text("A", color = Color.White, fontSize = 12.sp)
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Surface(color = Color(0xFFF5F5F5), shape = RoundedCornerShape(12.dp)) {
                            Text(
                                "Xin chào! Aivy là trợ lý AI phát triển bởi IVS. Aivy có thể giúp bạn tìm sản phẩm chính hãng, tra cứu đơn hàng, hướng dẫn quét QR xác thực... Bạn cần Aivy hỗ trợ gì hôm nay?",
                                fontSize = 14.sp,
                                modifier = Modifier.padding(12.dp)
                            )
                        }
                    }
                    Spacer(modifier = Modifier.height(16.dp))
                    OutlinedTextField(
                        value = "",
                        onValueChange = {},
                        placeholder = { Text("Hỏi Aivy bất cứ điều gì...", fontSize = 14.sp) },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(24.dp),
                        trailingIcon = { Icon(Icons.Default.Send, contentDescription = null, tint = Color(0xFFE64A19)) }
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(32.dp))
        }
    }
}
@Preview(showBackground = true)
@Composable
fun DashboardPreview() {
    MaterialTheme {
        MainDashboard(
            role = UserRole.CUSTOMER,
            onLogout = {},
            navController = rememberNavController(),
            cartCount = 3
        )
    }
}

@Preview(showBackground = true)
@Composable
fun RoleSelectionPreview() {
    MaterialTheme { RoleSelectionScreen(onRoleSelect = {}, onLogout = {}) }
}
