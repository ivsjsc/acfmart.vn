package vn.acfmart.mobile.features.auth.presentation

import android.util.Patterns
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.google.firebase.auth.FirebaseAuthInvalidCredentialsException
import com.google.firebase.auth.FirebaseAuthInvalidUserException
import com.google.firebase.auth.FirebaseAuthUserCollisionException
import com.google.firebase.auth.FirebaseAuthWeakPasswordException
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import vn.acfmart.mobile.core.auth.AuthRepository
import javax.inject.Inject

/**
 * UI state chung cho các flow auth (login/signup/forgot).
 * - [success] = true khi thao tác thành công (login/signup) để màn điều hướng.
 * - [info]    = thông báo (vd. đã gửi email reset).
 */
data class AuthUiState(
    val isLoading: Boolean = false,
    val error: String? = null,
    val info: String? = null,
    val success: Boolean = false
)

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val repo: AuthRepository
) : ViewModel() {

    private val _state = MutableStateFlow(AuthUiState())
    val state: StateFlow<AuthUiState> = _state.asStateFlow()

    val isLoggedIn: Boolean get() = repo.isLoggedIn
    val displayName: String get() = repo.currentUser?.displayName?.takeIf { it.isNotBlank() } ?: "Khách hàng"
    val email: String get() = repo.currentUser?.email.orEmpty()

    fun clearMessages() = _state.update { it.copy(error = null, info = null) }

    fun login(email: String, password: String) {
        when {
            email.isBlank() -> return setError("Vui lòng nhập email")
            !Patterns.EMAIL_ADDRESS.matcher(email.trim()).matches() -> return setError("Email không hợp lệ")
            password.isBlank() -> return setError("Vui lòng nhập mật khẩu")
        }
        run {
            _state.update { it.copy(isLoading = true, error = null) }
            viewModelScope.launch {
                try {
                    repo.signIn(email, password)
                    _state.update { it.copy(isLoading = false, success = true) }
                } catch (e: Exception) {
                    _state.update { it.copy(isLoading = false, error = mapError(e)) }
                }
            }
        }
    }

    fun signup(fullName: String, email: String, password: String, confirmPassword: String) {
        when {
            fullName.isBlank() -> return setError("Vui lòng nhập họ và tên")
            email.isBlank() || !Patterns.EMAIL_ADDRESS.matcher(email.trim()).matches() ->
                return setError("Email không hợp lệ")
            password.length < 6 -> return setError("Mật khẩu phải có ít nhất 6 ký tự")
            password != confirmPassword -> return setError("Mật khẩu xác nhận không khớp")
        }
        _state.update { it.copy(isLoading = true, error = null) }
        viewModelScope.launch {
            try {
                repo.signUp(fullName, email, password)
                _state.update { it.copy(isLoading = false, success = true) }
            } catch (e: Exception) {
                _state.update { it.copy(isLoading = false, error = mapError(e)) }
            }
        }
    }

    fun forgotPassword(email: String) {
        when {
            email.isBlank() -> return setError("Vui lòng nhập email")
            !Patterns.EMAIL_ADDRESS.matcher(email.trim()).matches() -> return setError("Email không hợp lệ")
        }
        _state.update { it.copy(isLoading = true, error = null, info = null) }
        viewModelScope.launch {
            try {
                repo.sendPasswordReset(email)
                _state.update {
                    it.copy(isLoading = false, info = "Đã gửi liên kết đặt lại mật khẩu đến ${email.trim()}.")
                }
            } catch (e: Exception) {
                _state.update { it.copy(isLoading = false, error = mapError(e)) }
            }
        }
    }

    fun signOut() = repo.signOut()

    private fun setError(message: String) = _state.update { it.copy(error = message) }

    private fun mapError(e: Exception): String = when (e) {
        is FirebaseAuthWeakPasswordException -> "Mật khẩu quá yếu, vui lòng chọn mật khẩu mạnh hơn"
        is FirebaseAuthInvalidCredentialsException -> "Email hoặc mật khẩu không đúng"
        is FirebaseAuthInvalidUserException -> "Tài khoản không tồn tại hoặc đã bị vô hiệu hóa"
        is FirebaseAuthUserCollisionException -> "Email này đã được đăng ký"
        else -> e.localizedMessage ?: "Đã xảy ra lỗi, vui lòng thử lại"
    }
}
