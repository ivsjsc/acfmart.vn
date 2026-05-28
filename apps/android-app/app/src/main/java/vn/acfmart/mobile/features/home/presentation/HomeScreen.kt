package vn.acfmart.mobile.features.home.presentation

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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import vn.acfmart.mobile.features.home.presentation.components.CategoryNavigation
import vn.acfmart.mobile.features.home.presentation.components.ProductCard

/**
 * Home Screen - Màn hình chính của app
 * 
 * Features:
 * - Search bar với real-time search
 * - Category navigation (horizontal scroll)
 * - Product grid listing
 * - Pull to refresh (có thể thêm sau)
 * - Loading & error states
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    navController: NavController,
    viewModel: HomeViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    var searchQuery by remember { mutableStateOf("") }
    var isSearchActive by remember { mutableStateOf(false) }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Text(
                            text = "ACFMart",
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.primary
                        )
                        Icon(
                            imageVector = Icons.Default.Verified,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.size(24.dp)
                        )
                    }
                },
                actions = {
                    // Cart button
                    IconButton(onClick = { 
                        // TODO: Navigate to cart
                    }) {
                        Icon(
                            imageVector = Icons.Default.ShoppingCart,
                            contentDescription = "Giỏ hàng"
                        )
                    }
                    
                    // QR Verify button
                    IconButton(onClick = {
                        navController.navigate("tools/qr-verify")
                    }) {
                        Icon(
                            imageVector = Icons.Default.QrCodeScanner,
                            contentDescription = "Quét QR"
                        )
                    }
                    
                    // Account button
                    IconButton(onClick = {
                        navController.navigate("account/profile")
                    }) {
                        Icon(
                            imageVector = Icons.Default.Person,
                            contentDescription = "Tài khoản"
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            // Search Bar
            SearchBar(
                query = searchQuery,
                onQueryChange = { query ->
                    searchQuery = query
                    if (query.isBlank()) {
                        viewModel.searchProducts("")
                    }
                },
                onSearch = { query ->
                    viewModel.searchProducts(query)
                },
                active = isSearchActive,
                onActiveChange = { isActive ->
                    isSearchActive = isActive
                    if (!isActive && searchQuery.isBlank()) {
                        viewModel.searchProducts("")
                    }
                },
                placeholder = {
                    Text("Tìm kiếm sản phẩm chính hãng...")
                },
                leadingIcon = {
                    Icon(
                        imageVector = Icons.Default.Search,
                        contentDescription = null
                    )
                },
                trailingIcon = {
                    if (isSearchActive) {
                        IconButton(onClick = {
                            searchQuery = ""
                            isSearchActive = false
                            viewModel.searchProducts("")
                        }) {
                            Icon(Icons.Default.Close, contentDescription = "Clear search")
                        }
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp)
            ) {
                // Search suggestions có thể thêm ở đây
            }
            
            // Category Navigation
            if (uiState.categories.isNotEmpty()) {
                CategoryNavigation(
                    categories = uiState.categories,
                    selectedCategoryId = uiState.selectedCategoryId,
                    onCategorySelected = { categoryId ->
                        viewModel.selectCategory(categoryId)
                    },
                    modifier = Modifier.padding(vertical = 8.dp)
                )
            }
            
            // Content
            when {
                uiState.isLoading -> {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        CircularProgressIndicator()
                    }
                }
                
                uiState.errorMessage != null -> {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(16.dp),
                            modifier = Modifier.padding(32.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Error,
                                contentDescription = null,
                                modifier = Modifier.size(64.dp),
                                tint = MaterialTheme.colorScheme.error
                            )
                            Text(
                                text = uiState.errorMessage!!,
                                color = MaterialTheme.colorScheme.error,
                                style = MaterialTheme.typography.bodyLarge
                            )
                            Button(onClick = { viewModel.clearError() }) {
                                Text("Thử lại")
                            }
                        }
                    }
                }
                
                uiState.products.isEmpty() -> {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.SearchOff,
                                contentDescription = null,
                                modifier = Modifier.size(64.dp),
                                tint = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                            Text(
                                text = "Không tìm thấy sản phẩm nào",
                                style = MaterialTheme.typography.bodyLarge,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                            if (uiState.isSearching) {
                                Text(
                                    text = "Thử tìm kiếm với từ khóa khác",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }
                    }
                }
                
                else -> {
                    // Product Grid
                    LazyVerticalGrid(
                        columns = GridCells.Adaptive(minSize = 180.dp),
                        contentPadding = PaddingValues(16.dp),
                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                        verticalArrangement = Arrangement.spacedBy(16.dp),
                        modifier = Modifier.fillMaxSize()
                    ) {
                        items(uiState.products) { product ->
                            ProductCard(
                                product = product,
                                onProductClick = { selectedProduct ->
                                    // TODO: Navigate to ProductDetail
                                    // navController.navigate("store/product/${selectedProduct.id}")
                                }
                            )
                        }
                    }
                }
            }
        }
    }
}
