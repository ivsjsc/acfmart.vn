package vn.acfmart.mobile.features.auth.screens

import androidx.compose.foundation.clickable
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
import androidx.compose.ui.focus.FocusDirection
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController

/**
 * Signup Screen - Đăng ký tài khoản mới.
 * 
 * Demo: tạo tài khoản giả lập với Firebase Auth.
 * Production: có thể thêm xác thực email, phone, VNeID integration.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SignupScreen(
    navController: NavController,
    onSignupSuccess: () -> Unit = {}
) {
    var fullName by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var confirmPassword by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }
    var confirmPasswordVisible by remember { mutableStateOf(false) }
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
                text = "Đăng ký",
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold
            )
        }
        
        Spacer(Modifier.height(24.dp))
        
        // Signup Form
        Card(
            modifier = Modifier.fillMaxWidth(),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
        ) {
            Column(
                modifier = Modifier.padding(24.dp)
            ) {
                // Full Name Field
                OutlinedTextField(
                    value = fullName,
                    onValueChange = { fullName = it; errorMessage = null },
                    label = { Text("Họ và tên *") },
                    leadingIcon = {
                        Icon(Icons.Default.Person, contentDescription = null)
                    },
                    modifier = Modifier.fillMaxWidth(),
                    keyboardOptions = KeyboardOptions(
                        keyboardType = KeyboardType.Text,
                        imeAction = ImeAction.Next
                    ),
                    keyboardActions = KeyboardActions(
                        onNext = { focusManager.moveFocus(FocusDirection.Down) }
                    ),
                    singleLine = true,
                    isError = errorMessage != null
                )
                
                Spacer(Modifier.height(16.dp))
                
                // Email Field
                OutlinedTextField(
                    value = email,
                    onValueChange = { email = it; errorMessage = null },
                    label = { Text("Email *") },
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
                
                // Phone Field
                OutlinedTextField(
                    value = phone,
                    onValueChange = { phone = it; errorMessage = null },
                    label = { Text("Số điện thoại") },
                    leadingIcon = {
                        Icon(Icons.Default.Phone, contentDescription = null)
                    },
                    modifier = Modifier.fillMaxWidth(),
                    keyboardOptions = KeyboardOptions(
                        keyboardType = KeyboardType.Phone,
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
                    label = { Text("Mật khẩu *") },
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
                        imeAction = ImeAction.Next
                    ),
                    keyboardActions = KeyboardActions(
                        onNext = { focusManager.moveFocus(FocusDirection.Down) }
                    ),
                    singleLine = true,
                    isError = errorMessage != null
                )
                
                Spacer(Modifier.height(16.dp))
                
                // Confirm Password Field
                OutlinedTextField(
                    value = confirmPassword,
                    onValueChange = { confirmPassword = it; errorMessage = null },
                    label = { Text("Xác nhận mật khẩu *") },
                    leadingIcon = {
                        Icon(Icons.Default.Lock, contentDescription = null)
                    },
                    trailingIcon = {
                        val icon = if (confirmPasswordVisible) Icons.Default.Visibility else Icons.Default.VisibilityOff
                        IconButton(onClick = { confirmPasswordVisible = !confirmPasswordVisible }) {
                            Icon(icon, contentDescription = if (confirmPasswordVisible) "Hide password" else "Show password")
                        }
                    },
                    visualTransformation = if (confirmPasswordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                    modifier = Modifier.fillMaxWidth(),
                    keyboardOptions = KeyboardOptions(
                        keyboardType = KeyboardType.Password,
                        imeAction = ImeAction.Done
                    ),
                    keyboardActions = KeyboardActions(
                        onDone = {
                            focusManager.clearFocus()
                            handleSignup(
                                fullName, email, phone, password, confirmPassword,
                                onSignupSuccess,
                                isLoading = { isLoading = it },
                                onError = { errorMessage = it }
                            )
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
                
                Spacer(Modifier.height(24.dp))
                
                // Signup Button
                Button(
                    onClick = {
                        focusManager.clearFocus()
                        handleSignup(
                            fullName, email, phone, password, confirmPassword,
                            onSignupSuccess,
                            isLoading = { isLoading = it },
                            onError = { errorMessage = it }
                        )
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp),
                    enabled = !isLoading && fullName.isNotBlank() && email.isNotBlank() && 
                             password.isNotBlank() && confirmPassword.isNotBlank()
                ) {
                    if (isLoading) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(24.dp),
                            color = MaterialTheme.colorScheme.onPrimary,
                            strokeWidth = 2.dp
                        )
                    } else {
                        Text(
                            text = "Đăng ký",
                            style = MaterialTheme.typography.titleMedium
                        )
                    }
                }
            }
        }
        
        Spacer(Modifier.height(24.dp))
        
        // Login Link
        Row(
            horizontalArrangement = Arrangement.Center,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Đã có tài khoản? ",
                style = MaterialTheme.typography.bodyMedium
            )
            Text(
                text = "Đăng nhập",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.primary,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.clickable {
                    navController.popBackStack()
                }
            )
        }
        
        Spacer(Modifier.height(24.dp))
    }
}

private fun handleSignup(
    fullName: String,
    email: String,
    phone: String,
    password: String,
    confirmPassword: String,
    onSignupSuccess: () -> Unit,
    isLoading: (Boolean) -> Unit,
    onError: (String) -> Unit
) {
    // Validation
    if (fullName.isBlank()) {
        onError("Vui lòng nhập họ và tên")
        return
    }
    
    if (email.isBlank() || !android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
        onError("Email không hợp lệ")
        return
    }
    
    if (password.length < 6) {
        onError("Mật khẩu phải có ít nhất 6 ký tự")
        return
    }
    
    if (password != confirmPassword) {
        onError("Mật khẩu xác nhận không khớp")
        return
    }
    
    // VNeID Simulation: tạo tài khoản giả lập
    isLoading(true)
    
    // Giả lập độ trễ network
    androidx.compose.runtime.LaunchedEffect(Unit) {
        kotlinx.coroutines.delay(1500)
        
        // Demo: signup thành công
        isLoading(false)
        onSignupSuccess()
        
        // Production code (tạm comment):
        // try {
        //     val result = FirebaseAuth.getInstance()
        //         .createUserWithEmailAndPassword(email, password)
        //         .await()
        //     
        //     // Lưu thêm info vào Firestore
        //     val user = hashMapOf(
        //         "fullName" to fullName,
        //         "phone" to phone,
        //         "email" to email,
        //         "role" to "customer",
        //         "createdAt" to com.google.firebase.Timestamp.now()
        //     )
        //     FirebaseFirestore.getInstance()
        //         .collection("users")
        //         .document(result.user!!.uid)
        //         .set(user)
        //         .await()
        //     
        //     onSignupSuccess()
        // } catch (e: Exception) {
        //     isLoading(false)
        //     onError(e.localizedMessage ?: "Đăng ký thất bại")
        // }
    }
}
