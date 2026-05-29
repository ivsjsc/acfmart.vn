package vn.acfmart.mobile.features.auth.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusDirection
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController

/**
 * Login Screen với mô phỏng VNeID.
 * 
 * Trong demo: nhập email/password bất kỳ -> chuyển tới Home (giả lập).
 * Production: tích hợp VNeID OAuth hoặc Firebase Auth thật.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LoginScreen(
    navController: NavController,
    onLoginSuccess: () -> Unit = {}
) {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }
    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    
    val focusManager = LocalFocusManager.current
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Spacer(Modifier.height(48.dp))
        
        // Logo / Title
        Text(
            text = "ACFMart",
            style = MaterialTheme.typography.displayMedium,
            color = MaterialTheme.colorScheme.primary,
            fontWeight = FontWeight.Bold
        )
        
        Spacer(Modifier.height(8.dp))
        
        Text(
            text = "Sàn TMĐT chống hàng giả",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        
        Spacer(Modifier.height(48.dp))
        
        // Login Form
        Card(
            modifier = Modifier.fillMaxWidth(),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
        ) {
            Column(
                modifier = Modifier.padding(24.dp)
            ) {
                Text(
                    text = "Đăng nhập",
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.SemiBold
                )
                
                Spacer(Modifier.height(24.dp))
                
                // Email Field
                OutlinedTextField(
                    value = email,
                    onValueChange = { email = it; errorMessage = null },
                    label = { Text("Email") },
                    leadingIcon = {
                        Icon(Icons.Default.Email, contentDescription = null)
                    },
                    modifier = Modifier.fillMaxWidth(),
                    keyboardOptions = KeyboardOptions(
                        keyboardType = KeyboardType.Email,
                        imeAction = ImeAction.Next
                    ),
                    keyboardActions = KeyboardActions(
                        onNext = { focusManager.moveFocus(FocusDirection.Down) }
                    ),
                    singleLine = true,
                    isError = errorMessage != null
                )
                
                Spacer(Modifier.height(16.dp))
                
                // Password Field
                OutlinedTextField(
                    value = password,
                    onValueChange = { password = it; errorMessage = null },
                    label = { Text("Mật khẩu") },
                    leadingIcon = {
                        Icon(Icons.Default.Lock, contentDescription = null)
                    },
                    trailingIcon = {
                        val icon = if (passwordVisible) Icons.Default.Visibility else Icons.Default.VisibilityOff
                        IconButton(onClick = { passwordVisible = !passwordVisible }) {
                            Icon(icon, contentDescription = if (passwordVisible) "Hide password" else "Show password")
                        }
                    },
                    visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                    modifier = Modifier.fillMaxWidth(),
                    keyboardOptions = KeyboardOptions(
                        keyboardType = KeyboardType.Password,
                        imeAction = ImeAction.Done
                    ),
                    keyboardActions = KeyboardActions(
                        onDone = {
                            focusManager.clearFocus()
                            handleLogin(email, password, onLoginSuccess, isLoading = { isLoading = it }, onError = { errorMessage = it })
                        }
                    ),
                    singleLine = true,
                    isError = errorMessage != null
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
                
                // Forgot Password Link
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 8.dp),
                    horizontalArrangement = Arrangement.End
                ) {
                    Text(
                        text = "Quên mật khẩu?",
                        color = MaterialTheme.colorScheme.primary,
                        style = MaterialTheme.typography.bodyMedium,
                        modifier = Modifier.clickable {
                            navController.navigate("auth/forgot")
                        }
                    )
                }
                
                Spacer(Modifier.height(24.dp))
                
                // Login Button
                Button(
                    onClick = {
                        focusManager.clearFocus()
                        handleLogin(email, password, onLoginSuccess, isLoading = { isLoading = it }, onError = { errorMessage = it })
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp),
                    enabled = !isLoading && email.isNotBlank() && password.isNotBlank()
                ) {
                    if (isLoading) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(24.dp),
                            color = MaterialTheme.colorScheme.onPrimary,
                            strokeWidth = 2.dp
                        )
                    } else {
                        Text(
                            text = "Đăng nhập",
                            style = MaterialTheme.typography.titleMedium
                        )
                    }
                }
                
                Spacer(Modifier.height(16.dp))
                
                // VNeID Simulation Notice
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.5f)
                    )
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp)
                    ) {
                        Text(
                            text = "🔐 Demo: VNeID Simulation",
                            style = MaterialTheme.typography.labelLarge,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                        Spacer(Modifier.height(4.dp))
                        Text(
                            text = "Nhập email/mật khẩu bất kỳ để đăng nhập demo. Trong production, sẽ tích hợp VNeID OAuth thực tế.",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                    }
                }
            }
        }
        
        Spacer(Modifier.height(32.dp))
        
        // Signup Link
        Row(
            horizontalArrangement = Arrangement.Center,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Chưa có tài khoản? ",
                style = MaterialTheme.typography.bodyMedium
            )
            Text(
                text = "Đăng ký",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.primary,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.clickable {
                    navController.navigate("auth/signup")
                }
            )
        }
        
        Spacer(Modifier.height(24.dp))
    }
}

@Composable
private fun handleLogin(
    email: String,
    password: String,
    onLoginSuccess: () -> Unit,
    isLoading: (Boolean) -> Unit,
    onError: (String) -> Unit
) {
    if (email.isBlank()) {
        onError("Vui lòng nhập email")
        return
    }
    
    if (password.isBlank()) {
        onError("Vui lòng nhập mật khẩu")
        return
    }
    
    // VNeID Simulation: chấp nhận mọi email/password hợp lệ
    isLoading(true)
    
    // Giả lập độ trễ network
    LaunchedEffect(Unit) {
        kotlinx.coroutines.delay(1000)
        
        // Demo: login thành công
        isLoading(false)
        onLoginSuccess()
        
        // Production code (tạm comment):
        // try {
        //     val result = FirebaseAuth.getInstance()
        //         .signInWithEmailAndPassword(email, password)
        //         .await()
        //     onLoginSuccess()
        // } catch (e: Exception) {
        //     isLoading(false)
        //     onError(e.localizedMessage ?: "Đăng nhập thất bại")
        // }
    }
}
