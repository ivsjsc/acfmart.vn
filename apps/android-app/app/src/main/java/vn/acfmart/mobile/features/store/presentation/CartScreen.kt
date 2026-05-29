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
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavController
import coil.compose.AsyncImage
import kotlinx.coroutines.launch
import vn.acfmart.mobile.core.cart.CartItem
import java.text.NumberFormat
import java.util.Locale

/**
 * Shopping Cart Screen — giỏ hàng THẬT (Firestore `carts/{uid}/items`).
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CartScreen(
    navController: NavController,
    viewModel: CartViewModel = hiltViewModel()
) {
    val ui by viewModel.uiState.collectAsStateWithLifecycle()
    val cartItems = ui.items
    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()

    // Mặc định chọn tất cả; đồng bộ khi danh sách thay đổi.
    var selectedItems by remember { mutableStateOf<Set<String>>(emptySet()) }
    LaunchedEffect(cartItems) {
        selectedItems = cartItems.map { it.productId }.toSet()
    }

    val priceFormat = NumberFormat.getNumberInstance(Locale("vi", "VN"))
    val totalPrice = cartItems.filter { it.productId in selectedItems }.sumOf { it.lineTotal }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
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
                        TextButton(onClick = { viewModel.clear() }) { Text("Xóa tất cả") }
                    }
                }
            )
        },
        bottomBar = {
            if (cartItems.isNotEmpty() && selectedItems.isNotEmpty()) {
                Surface(tonalElevation = 3.dp) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
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
                                scope.launch {
                                    snackbarHostState.showSnackbar("Thanh toán đang được hoàn thiện ở bước kế tiếp.")
                                }
                            },
                            modifier = Modifier
                                .width(170.dp)
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
    ) { paddingValues ->
        when {
            ui.isLoading -> Box(
                Modifier
                    .fillMaxSize()
                    .padding(paddingValues), Alignment.Center
            ) { CircularProgressIndicator() }

            cartItems.isEmpty() -> EmptyCart(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                onShop = { navController.navigate("store/home") }
            )

            else -> LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(cartItems, key = { it.productId }) { item ->
                    CartItemCard(
                        item = item,
                        isSelected = item.productId in selectedItems,
                        onSelectionChange = { checked ->
                            selectedItems = if (checked) selectedItems + item.productId
                            else selectedItems - item.productId
                        },
                        onQuantityChange = { newQty -> viewModel.updateQuantity(item.productId, newQty) },
                        onRemove = { viewModel.remove(item.productId) }
                    )
                }
                item { Spacer(Modifier.height(80.dp)) }
            }
        }
    }
}

@Composable
private fun EmptyCart(modifier: Modifier, onShop: () -> Unit) {
    Box(modifier = modifier, contentAlignment = Alignment.Center) {
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
            Button(onClick = onShop) {
                Icon(Icons.Default.ShoppingBag, contentDescription = null)
                Spacer(Modifier.width(8.dp))
                Text("Mua sắm ngay")
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
            Checkbox(
                checked = isSelected,
                onCheckedChange = onSelectionChange,
                modifier = Modifier.align(Alignment.Top)
            )

            AsyncImage(
                model = item.image,
                contentDescription = item.title,
                modifier = Modifier
                    .size(100.dp)
                    .clip(MaterialTheme.shapes.small),
                contentScale = ContentScale.Crop
            )

            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Text(
                    text = item.title,
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

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedButton(
                        onClick = { onQuantityChange(item.quantity - 1) },
                        modifier = Modifier.size(32.dp),
                        contentPadding = PaddingValues(0.dp),
                        enabled = item.quantity > 1
                    ) { Text("-", style = MaterialTheme.typography.titleMedium) }

                    Text(
                        text = "${item.quantity}",
                        style = MaterialTheme.typography.bodyLarge,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.width(32.dp),
                        textAlign = TextAlign.Center
                    )

                    OutlinedButton(
                        onClick = { onQuantityChange(item.quantity + 1) },
                        modifier = Modifier.size(32.dp),
                        contentPadding = PaddingValues(0.dp),
                        enabled = item.quantity < 99
                    ) { Text("+", style = MaterialTheme.typography.titleMedium) }
                }
            }

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
