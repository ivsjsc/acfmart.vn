package vn.acfmart.mobile.core.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val LightColors = lightColorScheme(
    primary = BrandRed500,
    onPrimary = Color.White,
    primaryContainer = BrandRed50,
    onPrimaryContainer = BrandRed700,
    secondary = BrandGold500,
    onSecondary = Color.White,
    secondaryContainer = BrandGold50,
    onSecondaryContainer = BrandGold700,
    tertiary = BrandGold600,
    background = Color.White,
    onBackground = Neutral900,
    surface = Color.White,
    onSurface = Neutral900,
    surfaceVariant = Neutral100,
    onSurfaceVariant = Neutral700,
    outline = Neutral200,
    error = ErrorRed,
    onError = Color.White,
)

// Extension properties for custom colors
val androidx.compose.material3.ColorScheme.success: Color
    get() = SuccessGreen

val androidx.compose.material3.ColorScheme.warning: Color
    get() = WarningOrange

private val DarkColors = darkColorScheme(
    primary = BrandRed400,
    onPrimary = Color.White,
    primaryContainer = BrandRed800,
    onPrimaryContainer = BrandRed100,
    secondary = BrandGold400,
    onSecondary = Neutral900,
    background = Neutral900,
    onBackground = Neutral50,
    surface = Color(0xFF1F1F1F),
    onSurface = Neutral50,
    surfaceVariant = Neutral700,
    onSurfaceVariant = Neutral200,
    error = BrandRed400,
)

@Composable
fun ACFMartTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = if (darkTheme) DarkColors else LightColors,
        typography = AppTypography,
        content = content
    )
}
