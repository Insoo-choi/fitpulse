package com.fitpulse.app.domain.usecase

import kotlin.math.max
import kotlin.math.min
import kotlin.math.roundToInt

class CalculateCaloriesUseCase {
    operator fun invoke(
        durationMinutes: Int,
        totalVolume: Int,
        userBodyWeightKg: Float
    ): Int {
        val safeMinutes = max(durationMinutes, 1)
        val volPerMin = totalVolume.toFloat() / safeMinutes

        // Dynamic MET calculation (3.5 to 8.0 based on volume density)
        val dynamicMET = min(max(3.5f, 3.5f + (volPerMin / 150f) * 2.5f), 8.0f)
        val hours = safeMinutes / 60f

        return (dynamicMET * userBodyWeightKg * hours).roundToInt()
    }
}
