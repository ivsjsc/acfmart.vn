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
 * Login Screen — Firebase Auth THẬT (email/mật khẩu). Dùng chung tài khoản
 * với web acfmart.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LoginScreen(
    navController: NavController,
    onLoginSuccess: () -> Unit = {},
    viewModel: AuthViewModel = hiltViewModel()
) {
    val ui by viewModel.state.collectAsStateWithLifecycle()
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }

    val focusManager = LocalFocusManager.current

    LaunchedEffect(ui.success) {
        if (ui.success) onLoginSuccess()
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Spacer(Modifier.height(48.dp))

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

        Card(
            modifier = Modifier.fillMaxWidth(),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
        ) {
            Column(modifier = Modifier.padding(24.dp)) {
                Text(
                    text = "Đăng nhập",
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.SemiBold
                )

                Spacer(Modifier.height(24.dp))

                OutlinedTextField(
                    value = email,
                    onValueChange = { email = it; viewModel.clearMessages() },
                    label = { Text("Email") },
                    leadingIcon = { Icon(Icons.Default.Email, contentDescription = null) },
                    modifier = Modifier.fillMaxWidth(),
                    keyboardOptions = KeyboardOptions(
                        keyboardType = KeyboardType.Email,
                        imeAction = ImeAction.Next
                    ),
                    keyboardActions = KeyboardActions(
                        onNext = { focusManager.moveFocus(FocusDirection.Down) }
                    ),
                    singleLine = true,
                    isError = ui.error != null,
                    enabled = !ui.isLoading
                )

                Spacer(Modifier.height(16.dp))

                OutlinedTextField(
                    value = password,
                    onValueChange = { password = it; viewModel.clearMessages() },
                    label = { Text("Mật khẩu") },
                    leadingIcon = { Icon(Icons.Default.Lock, contentDescription = null) },
                    trailingIcon = {
                        val icon = if (passwordVisible) Icons.Default.Visibility else Icons.Default.VisibilityOff
                        IconButton(onClick = { passwordVisible = !passwordVisible }) {
                            Icon(icon, contentDescription = if (passwordVisible) "Ẩn mật khẩu" else "Hiện mật khẩu")
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
                            viewModel.login(email, password)
                        }
                    ),
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
                        modifier = Modifier.clickable { navController.navigate("auth/forgot") }
                    )
                }

                Spacer(Modifier.height(24.dp))

                Button(
                    onClick = {
                        focusManager.clearFocus()
                        viewModel.login(email, password)
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp),
                    enabled = !ui.isLoading && email.isNotBlank() && password.isNotBlank()
                ) {
                    if (ui.isLoading) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(24.dp),
                            color = MaterialTheme.colorScheme.onPrimary,
                            strokeWidth = 2.dp
                        )
                    } else {
                        Text(text = "Đăng nhập", style = MaterialTheme.typography.titleMedium)
                    }
                }
            }
        }

        Spacer(Modifier.height(32.dp))

        Row(
            horizontalArrangement = Arrangement.Center,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(text = "Chưa có tài khoản? ", style = MaterialTheme.typography.bodyMedium)
            Text(
                text = "Đăng ký",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.primary,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.clickable { navController.navigate("auth/signup") }
            )
        }

        Spacer(Modifier.height(24.dp))
    }
}
