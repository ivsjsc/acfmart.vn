class AuthService {
  const AuthService();

  Future<void> bootstrapSession() async {
    // TODO: Restore auth state and exchange tokens with the backend.
  }

  Future<void> signInWithEmail({
    required String email,
    required String password,
  }) async {
    // TODO: Wire Firebase Auth + backend token exchange.
  }

  Future<void> signOut() async {
    // TODO: Clear session, cached tokens, and local user state.
  }
}
