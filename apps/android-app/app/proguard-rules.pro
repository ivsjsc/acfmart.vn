# ACFMart Android — Proguard rules
# Firebase + Hilt + Moshi + Kotlin coroutines đều có consumer rules trong AAR.
# Bổ sung khi cần giữ data class custom.

-keepattributes Signature, InnerClasses, EnclosingMethod
-keepattributes RuntimeVisibleAnnotations, RuntimeVisibleParameterAnnotations

# Giữ data class trong package model (Firestore deserialize qua reflection)
-keep class vn.acfmart.mobile.data.model.** { *; }

# Moshi codegen
-keep,allowobfuscation,allowshrinking @com.squareup.moshi.JsonClass class *
