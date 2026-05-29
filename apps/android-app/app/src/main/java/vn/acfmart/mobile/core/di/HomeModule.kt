package vn.acfmart.mobile.core.di

/**
 * `ProductRepository` đã dùng `@Inject constructor(FirebaseFirestore)` nên Hilt
 * tự dựng được — không cần `@Provides` thủ công nữa. FirebaseFirestore được
 * cung cấp bởi [FirebaseModule].
 *
 * Giữ file để ghi chú chủ đích; thêm binding cho feature home tại đây nếu cần.
 */
