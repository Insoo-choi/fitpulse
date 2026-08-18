package com.fitpulse.app.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable

@Composable
fun FitPulseTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = FitPulseDarkColorScheme,
        typography = Typography,
        content = content
    )
}
