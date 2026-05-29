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
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavController
import vn.acfmart.mobile.features.auth.presentation.AuthViewModel

/**
 * Signup Screen — tạo tài khoản bằng Firebase Auth THẬT (email/mật khẩu).
 * Số điện thoại được thu thập cho bước hoàn thiện hồ sơ; hồ sơ người dùng
 * (`users/{uid}`, role) do backend provision.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SignupScreen(
    navController: NavController,
    onSignupSuccess: () -> Unit = {},
    viewModel: AuthViewModel = hiltViewModel()
) {
    val ui by viewModel.state.collectAsStateWithLifecycle()
    var fullName by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var confirmPassword by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }
    var confirmPasswordVisible by remember { mutableStateOf(false) }

    val focusManager = LocalFocusManager.current

    LaunchedEffect(ui.success) {
        if (ui.success) onSignupSuccess()
    }

    fun submit() {
        focusManager.clearFocus()
        viewModel.signup(fullName, email, password, confirmPassword)
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Spacer(Modifier.height(32.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = { navController.popBackStack() }) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Quay lại")
            }
            Text(
                text = "Đăng ký",
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold
            )
        }

        Spacer(Modifier.height(24.dp))

        Card(
            modifier = Modifier.fillMaxWidth(),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
        ) {
            Column(modifier = Modifier.padding(24.dp)) {
                OutlinedTextField(
                    value = fullName,
                    onValueChange = { fullName = it; viewModel.clearMessages() },
                    label = { Text("Họ và tên *") },
                    leadingIcon = { Icon(Icons.Default.Person, contentDescription = null) },
                    modifier = Modifier.fillMaxWidth(),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Text, imeAction = ImeAction.Next),
                    keyboardActions = KeyboardActions(onNext = { focusManager.moveFocus(FocusDirection.Down) }),
                    singleLine = true,
                    isError = ui.error != null,
                    enabled = !ui.isLoading
                )

                Spacer(Modifier.height(16.dp))

                OutlinedTextField(
                    value = email,
                    onValueChange = { email = it; viewModel.clearMessages() },
                    label = { Text("Email *") },
                    leadingIcon = { Icon(Icons.Default.Email, contentDescription = null) },
                    modifier = Modifier.fillMaxWidth(),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email, imeAction = ImeAction.Next),
                    keyboardActions = KeyboardActions(onNext = { focusManager.moveFocus(FocusDirection.Down) }),
                    singleLine = true,
                    isError = ui.error != null,
                    enabled = !ui.isLoading
                )

                Spacer(Modifier.height(16.dp))

                OutlinedTextField(
                    value = phone,
                    onValueChange = { phone = it; viewModel.clearMessages() },
                    label = { Text("Số điện thoại") },
                    leadingIcon = { Icon(Icons.Default.Phone, contentDescription = null) },
                    modifier = Modifier.fillMaxWidth(),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone, imeAction = ImeAction.Next),
                    keyboardActions = KeyboardActions(onNext = { focusManager.moveFocus(FocusDirection.Down) }),
                    singleLine = true,
                    enabled = !ui.isLoading
                )

                Spacer(Modifier.height(16.dp))

                OutlinedTextField(
                    value = password,
                    onValueChange = { password = it; viewModel.clearMessages() },
                    label = { Text("Mật khẩu *") },
                    leadingIcon = { Icon(Icons.Default.Lock, contentDescription = null) },
                    trailingIcon = {
                        val icon = if (passwordVisible) Icons.Default.Visibility else Icons.Default.VisibilityOff
                        IconButton(onClick = { passwordVisible = !passwordVisible }) {
                            Icon(icon, contentDescription = if (passwordVisible) "Ẩn mật khẩu" else "Hiện mật khẩu")
                        }
                    },
                    visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                    modifier = Modifier.fillMaxWidth(),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password, imeAction = ImeAction.Next),
                    keyboardActions = KeyboardActions(onNext = { focusManager.moveFocus(FocusDirection.Down) }),
                    singleLine = true,
                    isError = ui.error != null,
                    enabled = !ui.isLoading
                )

                Spacer(Modifier.height(16.dp))

                OutlinedTextField(
                    value = confirmPassword,
                    onValueChange = { confirmPassword = it; viewModel.clearMessages() },
                    label = { Text("Xác nhận mật khẩu *") },
                    leadingIcon = { Icon(Icons.Default.Lock, contentDescription = null) },
                    trailingIcon = {
                        val icon = if (confirmPasswordVisible) Icons.Default.Visibility else Icons.Default.VisibilityOff
                        IconButton(onClick = { confirmPasswordVisible = !confirmPasswordVisible }) {
                            Icon(icon, contentDescription = if (confirmPasswordVisible) "Ẩn mật khẩu" else "Hiện mật khẩu")
                        }
                    },
                    visualTransformation = if (confirmPasswordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                    modifier = Modifier.fillMaxWidth(),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password, imeAction = ImeAction.Done),
                    keyboardActions = KeyboardActions(onDone = { submit() }),
                    singleLine = true,
                    isError = ui.error != null,
                    enabled = !ui.isLoading
                )

                if (ui.error != null) {
                    Spacer(Modifier.height(8.dp))
                    Text(
                        text = ui.error!!,
                        color = MaterialTheme.colorScheme.error,
                        style = MaterialTheme.typography.bodySmall
                    )
                }

                Spacer(Modifier.height(24.dp))

                Button(
                    onClick = { submit() },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp),
                    enabled = !ui.isLoading && fullName.isNotBlank() && email.isNotBlank() &&
                        password.isNotBlank() && confirmPassword.isNotBlank()
                ) {
                    if (ui.isLoading) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(24.dp),
                            color = MaterialTheme.colorScheme.onPrimary,
                            strokeWidth = 2.dp
                        )
                    } else {
                        Text(text = "Đăng ký", style = MaterialTheme.typography.titleMedium)
                    }
                }
            }
        }

        Spacer(Modifier.height(24.dp))

        Row(
            horizontalArrangement = Arrangement.Center,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(text = "Đã có tài khoản? ", style = MaterialTheme.typography.bodyMedium)
            Text(
                text = "Đăng nhập",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.primary,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.clickable { navController.popBackStack() }
            )
        }

        Spacer(Modifier.height(24.dp))
    }
}
