package com.clearring.app.ui.theme

import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

enum class AppTheme { CRYSTAL_GLASS, MIDNIGHT_TRUST, CLEAN_LIGHT, HIGH_CONTRAST, TRUE_SIGNAL }

// Risk colors (shared across all themes)
val ColorSafe = Color(0xFF22C55E)
val ColorLowRisk = Color(0xFFEAB308)
val ColorCaution = Color(0xFFF97316)
val ColorLikelySpam = Color(0xFFEF4444)
val ColorHighRisk = Color(0xFFDC2626)
val ColorVerified = Color(0xFF3B82F6)
val ColorUnknown = Color(0xFF6B7280)

fun formatPhoneDisplay(e164: String): String {
    if (e164.startsWith("+91") && e164.length == 13)
        return "+91 ${e164.substring(3, 8)} ${e164.substring(8)}"
    return e164
}

fun riskColor(level: String): Color = when (level) {
    "SAFE" -> ColorSafe
    "LOW_RISK" -> ColorLowRisk
    "CAUTION" -> ColorCaution
    "LIKELY_SPAM" -> ColorLikelySpam
    "HIGH_RISK" -> ColorHighRisk
    "UNKNOWN" -> ColorUnknown
    else -> ColorUnknown
}

private val CrystalGlassDark = darkColorScheme(
    primary = Color(0xFF60A5FA),
    secondary = Color(0xFFA78BFA),
    background = Color(0xFF0F172A),
    surface = Color(0xFF1E293B),
    onBackground = Color(0xFFF1F5F9),
    onSurface = Color(0xFFCBD5E1),
    tertiary = ColorSafe,
)

private val MidnightTrustDark = darkColorScheme(
    primary = Color(0xFF60A5FA),
    secondary = Color(0xFF475569),
    background = Color(0xFF020617),
    surface = Color(0xFF0F172A),
    onBackground = Color(0xFFE2E8F0),
    onSurface = Color(0xFF94A3B8),
    tertiary = ColorSafe,
)

private val CleanLightLight = lightColorScheme(
    primary = Color(0xFF2563EB),
    secondary = Color(0xFF64748B),
    background = Color(0xFFF8FAFC),
    surface = Color(0xFFFFFFFF),
    onBackground = Color(0xFF0F172A),
    onSurface = Color(0xFF334155),
    tertiary = ColorSafe,
)

private val HighContrastDark = darkColorScheme(
    primary = Color(0xFFFACC15),
    secondary = Color(0xFFD4D4D4),
    background = Color(0xFF000000),
    surface = Color(0xFF18181B),
    onBackground = Color(0xFFFFFFFF),
    onSurface = Color(0xFFE4E4E7),
    tertiary = ColorSafe,
)

private val TrueSignalDark = darkColorScheme(
    primary = Color(0xFF10B981),
    secondary = Color(0xFF0891B2),
    background = Color(0xFF022C22),
    surface = Color(0xFF064E3B),
    onBackground = Color(0xFFECFDF5),
    onSurface = Color(0xFFA7F3D0),
    tertiary = ColorSafe,
)

@Composable
fun ClearRingTheme(theme: AppTheme = AppTheme.CRYSTAL_GLASS, content: @Composable () -> Unit) {
    val colorScheme = when (theme) {
        AppTheme.CRYSTAL_GLASS -> CrystalGlassDark
        AppTheme.MIDNIGHT_TRUST -> MidnightTrustDark
        AppTheme.CLEAN_LIGHT -> CleanLightLight
        AppTheme.HIGH_CONTRAST -> HighContrastDark
        AppTheme.TRUE_SIGNAL -> TrueSignalDark
    }
    MaterialTheme(colorScheme = colorScheme, content = content)
}
