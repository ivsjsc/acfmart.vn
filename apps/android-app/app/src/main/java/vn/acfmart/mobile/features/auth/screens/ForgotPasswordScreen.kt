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
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavController
import vn.acfmart.mobile.features.auth.presentation.AuthViewModel

/**
 * Forgot Password Screen — gửi email đặt lại mật khẩu qua Firebase Auth THẬT.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ForgotPasswordScreen(
    navController: NavController,
    viewModel: AuthViewModel = hiltViewModel()
) {
    val ui by viewModel.state.collectAsStateWithLifecycle()
    var email by remember { mutableStateOf("") }
    val focusManager = LocalFocusManager.current

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
                text = "Quên mật khẩu",
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold
            )
        }

        Spacer(Modifier.height(32.dp))

        Icon(
            imageVector = Icons.Default.LockReset,
            contentDescription = null,
            modifier = Modifier.size(80.dp),
            tint = MaterialTheme.colorScheme.primary
        )

        Spacer(Modifier.height(24.dp))

        Text(
            text = "Nhập email đã đăng ký để nhận liên kết đặt lại mật khẩu",
            style = MaterialTheme.typography.bodyLarge,
            textAlign = TextAlign.Center,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )

        Spacer(Modifier.height(32.dp))

        Card(
            modifier = Modifier.fillMaxWidth(),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
        ) {
            Column(modifier = Modifier.padding(24.dp)) {
                OutlinedTextField(
                    value = email,
                    onValueChange = { email = it; viewModel.clearMessages() },
                    label = { Text("Email") },
                    leadingIcon = { Icon(Icons.Default.Email, contentDescription = null) },
                    modifier = Modifier.fillMaxWidth(),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email, imeAction = ImeAction.Done),
                    keyboardActions = KeyboardActions(
                        onDone = {
                            focusManager.clearFocus()
                            viewModel.forgotPassword(email)
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

                if (ui.info != null) {
                    Spacer(Modifier.height(8.dp))
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(
                            containerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.5f)
                        )
                    ) {
                        Text(
                            text = ui.info!!,
                            color = MaterialTheme.colorScheme.onPrimaryContainer,
                            style = MaterialTheme.typography.bodyMedium,
                            modifier = Modifier.padding(12.dp)
                        )
                    }
                }

                Spacer(Modifier.height(24.dp))

                Button(
                    onClick = {
                        focusManager.clearFocus()
                        viewModel.forgotPassword(email)
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp),
                    enabled = !ui.isLoading && email.isNotBlank()
                ) {
                    if (ui.isLoading) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(24.dp),
                            color = MaterialTheme.colorScheme.onPrimary,
                            strokeWidth = 2.dp
                        )
                    } else {
                        Icon(Icons.Default.Send, contentDescription = null)
                        Spacer(Modifier.width(8.dp))
                        Text(text = "Gửi liên kết đặt lại", style = MaterialTheme.typography.titleMedium)
                    }
                }
            }
        }

        Spacer(Modifier.height(24.dp))

        OutlinedButton(
            onClick = { navController.popBackStack() },
            modifier = Modifier.fillMaxWidth()
        ) {
            Icon(Icons.Default.ArrowBack, contentDescription = null)
            Spacer(Modifier.width(8.dp))
            Text("Quay lại đăng nhập")
        }

        Spacer(Modifier.height(16.dp))

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
