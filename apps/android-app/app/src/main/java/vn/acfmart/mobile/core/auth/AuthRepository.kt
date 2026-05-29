package vn.acfmart.mobile.core.auth

import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseUser
import com.google.firebase.auth.ktx.userProfileChangeRequest
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Lớp truy cập Firebase Authentication THẬT (project `ecommerce-acf`, dùng chung
 * user với web). Không còn giả lập VNeID/delay.
 *
 * Lưu ý: provisioning hồ sơ người dùng (`users/{uid}`, role…) do backend/Cloud
 * Functions của web đảm nhiệm — mobile chỉ tạo tài khoản Auth + cập nhật
 * displayName để tránh đụng validator chặt của Firestore rules.
 */
@Singleton
class AuthRepository @Inject constructor(
    private val auth: FirebaseAuth
) {

    val currentUser: FirebaseUser? get() = auth.currentUser

    val isLoggedIn: Boolean get() = auth.currentUser != null

    /** Phát ra user hiện tại mỗi khi trạng thái đăng nhập thay đổi. */
    val authState: Flow<FirebaseUser?> = callbackFlow {
        val listener = FirebaseAuth.AuthStateListener { trySend(it.currentUser) }
        auth.addAuthStateListener(listener)
        awaitClose { auth.removeAuthStateListener(listener) }
    }

    suspend fun signIn(email: String, password: String) {
        auth.signInWithEmailAndPassword(email.trim(), password).await()
    }

    suspend fun signUp(fullName: String, email: String, password: String) {
        val result = auth.createUserWithEmailAndPassword(email.trim(), password).await()
        val display = fullName.trim()
        if (display.isNotEmpty()) {
            result.user?.updateProfile(
                userProfileChangeRequest { displayName = display }
            )?.await()
        }
    }

    suspend fun sendPasswordReset(email: String) {
        auth.sendPasswordResetEmail(email.trim()).await()
    }

    fun signOut() = auth.signOut()
}
