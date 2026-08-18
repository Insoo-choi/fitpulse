package com.fitpulse.app.ui.theme

import androidx.compose.material3.darkColorScheme
import androidx.compose.ui.graphics.Color

val Slate900 = Color(0xFF0F172A)
val Slate800 = Color(0xFF1E293B)
val Slate700 = Color(0xFF334155)
val Slate600 = Color(0xFF475569)
val Slate500 = Color(0xFF64748B)
val Slate400 = Color(0xFF94A3B8)
val Slate300 = Color(0xFFCBD5E1)
val Slate100 = Color(0xFFF1F5F9)

val Brand300 = Color(0xFF93C5FD)
val Brand500 = Color(0xFF3B82F6)
val Brand600 = Color(0xFF2563EB)
val Brand700 = Color(0xFF1D4ED8)
val Brand900 = Color(0xFF1E3A8A)

val Emerald400 = Color(0xFF34D399)
val Emerald500 = Color(0xFF10B981)
val Emerald600 = Color(0xFF059669)

val Rose400 = Color(0xFFFB7185)
val Rose500 = Color(0xFFF43F5E)
val Rose600 = Color(0xFFE11D48)

val FitPulseDarkColorScheme = darkColorScheme(
    primary = Brand500,
    onPrimary = Color.White,
    primaryContainer = Brand900,
    onPrimaryContainer = Brand300,
    secondary = Emerald500,
    onSecondary = Color.White,
    background = Slate900,
    onBackground = Slate100,
    surface = Slate800,
    onSurface = Slate100,
    surfaceVariant = Slate700,
    onSurfaceVariant = Slate300
)
