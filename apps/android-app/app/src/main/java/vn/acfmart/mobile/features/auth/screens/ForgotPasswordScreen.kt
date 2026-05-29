package vn.acfmart.mobile.features.auth.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController

/**
 * Forgot Password Screen - Quên mật khẩu.
 * 
 * Demo: gửi email reset password giả lập.
 * Production: tích hợp Firebase Auth sendPasswordResetEmail.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ForgotPasswordScreen(
    navController: NavController
) {
    var email by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var successMessage by remember { mutableStateOf<String?>(null) }
    
    val focusManager = LocalFocusManager.current
    val coroutineScope = rememberCoroutineScope()
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Spacer(Modifier.height(32.dp))
        
        // Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = { navController.popBackStack() }) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Back")
            }
            Text(
                text = "Quên mật khẩu",
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold
            )
        }
        
        Spacer(Modifier.height(32.dp))
        
        // Icon
        Icon(
            imageVector = Icons.Default.LockReset,
            contentDescription = null,
            modifier = Modifier.size(80.dp),
            tint = MaterialTheme.colorScheme.primary
        )
        
        Spacer(Modifier.height(24.dp))
        
        // Description
        Text(
            text = "Nhập email đã đăng ký để nhận liên kết đặt lại mật khẩu",
            style = MaterialTheme.typography.bodyLarge,
            textAlign = TextAlign.Center,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        
        Spacer(Modifier.height(32.dp))
        
        // Form
        Card(
            modifier = Modifier.fillMaxWidth(),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
        ) {
            Column(
                modifier = Modifier.padding(24.dp)
            ) {
                // Email Field
                OutlinedTextField(
                    value = email,
                    onValueChange = { 
                        email = it
                        errorMessage = null
                        successMessage = null
                    },
                    label = { Text("Email") },
                    leadingIcon = {
                        Icon(Icons.Default.Email, contentDescription = null)
                    },
                    modifier = Modifier.fillMaxWidth(),
                    keyboardOptions = KeyboardOptions(
                        keyboardType = KeyboardType.Email,
                        imeAction = ImeAction.Done
                    ),
                    keyboardActions = KeyboardActions(
                        onDone = {
                            focusManager.clearFocus()
                            handleForgotPassword(
                                email,
                                coroutineScope,
                                isLoading = { isLoading = it },
                                onError = { errorMessage = it },
                                onSuccess = { successMessage = it }
                            )
                        }
                    ),
                    singleLine = true,
                    isError = errorMessage != null,
                    enabled = !isLoading
                )
                
                // Error Message
                if (errorMessage != null) {
                    Spacer(Modifier.height(8.dp))
                    Text(
                        text = errorMessage!!,
                        color = MaterialTheme.colorScheme.error,
                        style = MaterialTheme.typography.bodySmall
                    )
                }
                
                // Success Message
                if (successMessage != null) {
                    Spacer(Modifier.height(8.dp))
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(
                            containerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.5f)
                        )
                    ) {
                        Text(
                            text = successMessage!!,
                            color = MaterialTheme.colorScheme.onPrimaryContainer,
                            style = MaterialTheme.typography.bodyMedium,
                            modifier = Modifier.padding(12.dp)
                        )
                    }
                }
                
                Spacer(Modifier.height(24.dp))
                
                // Submit Button
                Button(
                    onClick = {
                        focusManager.clearFocus()
                        handleForgotPassword(
                            email,
                            coroutineScope,
                            isLoading = { isLoading = it },
                            onError = { errorMessage = it },
                            onSuccess = { successMessage = it }
                        )
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp),
                    enabled = !isLoading && email.isNotBlank()
                ) {
                    if (isLoading) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(24.dp),
                            color = MaterialTheme.colorScheme.onPrimary,
                            strokeWidth = 2.dp
                        )
                    } else {
                        Icon(Icons.Default.Send, contentDescription = null)
                        Spacer(Modifier.width(8.dp))
                        Text(
                            text = "Gửi liên kết đặt lại",
                            style = MaterialTheme.typography.titleMedium
                        )
                    }
                }
            }
        }
        
        Spacer(Modifier.height(24.dp))
        
        // Back to Login
        OutlinedButton(
            onClick = { navController.popBackStack() },
            modifier = Modifier.fillMaxWidth()
        ) {
            Icon(Icons.Default.ArrowBack, contentDescription = null)
            Spacer(Modifier.width(8.dp))
            Text("Quay lại đăng nhập")
        }
        
        Spacer(Modifier.height(16.dp))
        
        // Help Text
        Text(
            text = "Không nhận được email?",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            textAlign = TextAlign.Center
        )
        
        Spacer(Modifier.height(8.dp))
        
        Text(
            text = "Kiểm tra thư mục Spam hoặc liên hệ hỗ trợ",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f),
            textAlign = TextAlign.Center
        )
    }
}

private fun handleForgotPassword(
    email: String,
    scope: kotlinx.coroutines.CoroutineScope,
    isLoading: (Boolean) -> Unit,
    onError: (String) -> Unit,
    onSuccess: (String) -> Unit
) {
    // Validation
    if (email.isBlank()) {
        onError("Vui lòng nhập email")
        return
    }
    
    if (!android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
        onError("Email không hợp lệ")
        return
    }
    
    // VNeID Simulation: giả lập gửi email reset
    isLoading(true)
    
    // Giả lập độ trễ network using coroutine scope
    scope.launch {
        kotlinx.coroutines.delay(1500)
        
        // Demo: giả lập gửi email thành công
        isLoading(false)
        onSuccess("Đã gửi liên kết đặt lại mật khẩu đến $email.\n\n(Demo: Trong production, email thực sẽ được gửi)")
        
        // Production code (tạm comment):
        // try {
        //     FirebaseAuth.getInstance()
        //         .sendPasswordResetEmail(email)
        //         .await()
        //     isLoading(false)
        //     onSuccess("Đã gửi liên kết đặt lại mật khẩu đến $email")
        // } catch (e: Exception) {
        //     isLoading(false)
        //     onError(e.localizedMessage ?: "Không thể gửi email đặt lại mật khẩu")
        // }
    }
}
