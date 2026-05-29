package vn.acfmart.mobile.features.tools.presentation

import android.Manifest
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import androidx.navigation.NavController
import com.google.mlkit.vision.barcode.BarcodeScannerOptions
import com.google.mlkit.vision.barcode.BarcodeScanning
import com.google.mlkit.vision.barcode.common.Barcode
import com.google.mlkit.vision.common.InputImage

/**
 * QR Verification Screen - Màn hình quét QR xác thực sản phẩm
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun QRVerifyScreen(
    navController: NavController
) {
    var hasCameraPermission by remember { mutableStateOf(false) }
    var scanResult by remember { mutableStateOf<String?>(null) }
    var isScanning by remember { mutableStateOf(true) }
    
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current
    
    LaunchedEffect(Unit) {
        // Request camera permission
        // In production, use Accompanist Permissions library
        hasCameraPermission = true // Demo: assume granted
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { 
                    Text(
                        "Quét QR xác thực",
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
            if (!hasCameraPermission) {
                // Permission denied state
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(400.dp)
                        .background(MaterialTheme.colorScheme.surfaceVariant),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(16.dp),
                        modifier = Modifier.padding(32.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.CameraAlt,
                            contentDescription = null,
                            modifier = Modifier.size(64.dp),
                            tint = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Text(
                            text = "Cần quyền truy cập camera",
                            style = MaterialTheme.typography.headlineSmall,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "Vui lòng cấp quyền camera để quét QR code",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            } else if (isScanning) {
                // Camera Preview
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(400.dp)
                ) {
                    AndroidView(
                        factory = { ctx ->
                            val previewView = PreviewView(ctx)
                            val cameraProviderFuture = ProcessCameraProvider.getInstance(ctx)
                            
                            cameraProviderFuture.addListener({
                                val cameraProvider = cameraProviderFuture.get()
                                
                                val preview = Preview.Builder().build().also {
                                    it.setSurfaceProvider(previewView.surfaceProvider)
                                }
                                
                                val imageAnalyzer = ImageAnalysis.Builder()
                                    .build()
                                    .also {
                                        it.setAnalyzer(
                                            ContextCompat.getMainExecutor(ctx)
                                        ) { imageProxy ->
                                            val mediaImage = imageProxy.image
                                            if (mediaImage != null) {
                                                val image = InputImage.fromMediaImage(
                                                    mediaImage,
                                                    imageProxy.imageInfo.rotationDegrees
                                                )
                                                
                                                // Scan barcode
                                                val options = BarcodeScannerOptions.Builder()
                                                    .setBarcodeFormats(Barcode.FORMAT_QR_CODE)
                                                    .build()
                                                val scanner = BarcodeScanning.getClient(options)
                                                
                                                scanner.process(image)
                                                    .addOnSuccessListener { barcodes ->
                                                        for (barcode in barcodes) {
                                                            val rawValue = barcode.rawValue
                                                            if (rawValue != null) {
                                                                scanResult = rawValue
                                                                isScanning = false
                                                            }
                                                        }
                                                    }
                                                    .addOnCompleteListener {
                                                        imageProxy.close()
                                                    }
                                            }
                                        }
                                    }
                                
                                val cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA
                                
                                try {
                                    cameraProvider.unbindAll()
                                    cameraProvider.bindToLifecycle(
                                        lifecycleOwner,
                                        cameraSelector,
                                        preview,
                                        imageAnalyzer
                                    )
                                } catch (e: Exception) {
                                    e.printStackTrace()
                                }
                            }, ContextCompat.getMainExecutor(ctx))
                            
                            previewView
                        },
                        modifier = Modifier.fillMaxSize()
                    )
                    
                    // Scanning overlay
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .background(androidx.compose.ui.graphics.Color.Black.copy(alpha = 0.3f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Surface(
                            modifier = Modifier.size(250.dp),
                            color = androidx.compose.ui.graphics.Color.Transparent,
                            shape = MaterialTheme.shapes.large
                        ) {
                            Box(
                                modifier = Modifier
                                    .fillMaxSize()
                                    .padding(2.dp)
                            ) {
                                // Scanning frame corners
                                // Top-left
                                Box(
                                    modifier = Modifier
                                        .size(40.dp)
                                        .align(Alignment.TopStart)
                                        .background(
                                            androidx.compose.ui.graphics.Color.Transparent,
                                            shape = MaterialTheme.shapes.small
                                        )
                                ) {
                                    Box(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .height(4.dp)
                                            .background(MaterialTheme.colorScheme.primary)
                                    )
                                    Box(
                                        modifier = Modifier
                                            .width(4.dp)
                                            .fillMaxHeight()
                                            .background(MaterialTheme.colorScheme.primary)
                                    )
                                }
                                // Top-right
                                Box(
                                    modifier = Modifier
                                        .size(40.dp)
                                        .align(Alignment.TopEnd)
                                ) {
                                    Box(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .height(4.dp)
                                            .background(MaterialTheme.colorScheme.primary)
                                    )
                                    Box(
                                        modifier = Modifier
                                            .width(4.dp)
                                            .fillMaxHeight()
                                            .align(Alignment.TopEnd)
                                            .background(MaterialTheme.colorScheme.primary)
                                    )
                                }
                                // Bottom-left
                                Box(
                                    modifier = Modifier
                                        .size(40.dp)
                                        .align(Alignment.BottomStart)
                                ) {
                                    Box(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .height(4.dp)
                                            .background(MaterialTheme.colorScheme.primary)
                                    )
                                    Box(
                                        modifier = Modifier
                                            .width(4.dp)
                                            .fillMaxHeight()
                                            .background(MaterialTheme.colorScheme.primary)
                                    )
                                }
                                // Bottom-right
                                Box(
                                    modifier = Modifier
                                        .size(40.dp)
                                        .align(Alignment.BottomEnd)
                                ) {
                                    Box(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .height(4.dp)
                                            .background(MaterialTheme.colorScheme.primary)
                                    )
                                    Box(
                                        modifier = Modifier
                                            .width(4.dp)
                                            .fillMaxHeight()
                                            .background(MaterialTheme.colorScheme.primary)
                                    )
                                }
                            }
                        }
                    }
                    
                    // Scanning instruction
                    Card(
                        modifier = Modifier
                            .align(Alignment.BottomCenter)
                            .padding(16.dp),
                        colors = CardDefaults.cardColors(
                            containerColor = MaterialTheme.colorScheme.surface.copy(alpha = 0.9f)
                        )
                    ) {
                        Text(
                            text = "Đưa mã QR vào khung hình để quét",
                            style = MaterialTheme.typography.bodyLarge,
                            fontWeight = FontWeight.SemiBold,
                            modifier = Modifier.padding(16.dp)
                        )
                    }
                }
            }
            
            Spacer(Modifier.height(24.dp))
            
            // Scan Result
            if (scanResult != null) {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.primaryContainer
                    )
                ) {
                    Column(
                        modifier = Modifier.padding(24.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Verified,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.primary,
                                modifier = Modifier.size(32.dp)
                            )
                            Text(
                                text = "Đã quét thành công!",
                                style = MaterialTheme.typography.headlineSmall,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onPrimaryContainer
                            )
                        }
                        
                        HorizontalDivider()
                        
                        Text(
                            text = "Mã QR:",
                            style = MaterialTheme.typography.labelLarge,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                        
                        Text(
                            text = scanResult!!,
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                        
                        Spacer(Modifier.height(8.dp))
                        
                        Button(
                            onClick = {
                                // TODO: Verify product with backend
                                // Navigate to product detail
                            },
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Icon(Icons.Default.Search, contentDescription = null)
                            Spacer(Modifier.width(8.dp))
                            Text("Xác thực sản phẩm")
                        }
                        
                        OutlinedButton(
                            onClick = {
                                scanResult = null
                                isScanning = true
                            },
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Icon(Icons.Default.Refresh, contentDescription = null)
                            Spacer(Modifier.width(8.dp))
                            Text("Quét mã khác")
                        }
                    }
                }
            }
            
            Spacer(Modifier.height(24.dp))
            
            // Instructions
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp)
            ) {
                Column(
                    modifier = Modifier.padding(24.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    Text(
                        text = "Hướng dẫn xác thực",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    
                    listOf(
                        "Bước 1: Tìm mã QR trên sản phẩm hoặc bao bì",
                        "Bước 2: Đưa camera vào mã QR để quét",
                        "Bước 3: Hệ thống sẽ tự động xác thực nguồn gốc",
                        "Bước 4: Xem kết quả xác thực và thông tin sản phẩm"
                    ).forEach { step ->
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.CheckCircle,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.primary,
                                modifier = Modifier.size(24.dp)
                            )
                            Text(
                                text = step,
                                style = MaterialTheme.typography.bodyMedium
                            )
                        }
                    }
                }
            }
            
            Spacer(Modifier.height(32.dp))
        }
    }
}
