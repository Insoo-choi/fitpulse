package com.fitpulse.app.domain.usecase

import com.fitpulse.app.data.model.Exercise
import kotlin.math.roundToInt

class CalculateOverloadUseCase {
    data class OverloadResult(
        val updatedExercise: Exercise,
        val coachingMessage: String
    )

    operator fun invoke(
        exercise: Exercise,
        rpeScore: Int, // 1: Easy (적극 증량), 2: Good (표준 증량), 3: Hard (유지)
        minIncrement: Float
    ): OverloadResult {
        var weightInc = 0f
        var repInc = 0
        var message = "💡 AI 코칭: 현재 볼륨 완벽 적응 대기 중"

        when (rpeScore) {
            1 -> { // Easy
                when (exercise.type) {
                    "large_compound" -> weightInc = minIncrement * 2
                    "upper_compound" -> weightInc = minIncrement
                    else -> {
                        weightInc = minIncrement
                        repInc = 2
                    }
                }
            }
            2 -> { // Good
                when (exercise.type) {
                    "large_compound" -> weightInc = minIncrement
                    "upper_compound" -> weightInc = minIncrement
                    else -> repInc = 1
                }
            }
            3 -> { // Hard
                // Maintain
            }
        }

        if (weightInc > 0f || repInc > 0) {
            val weightStr = if (weightInc > 0f) "+${weightInc}kg" else ""
            val repStr = if (repInc > 0) "+${repInc}회" else ""
            message = "💡 AI 코칭: 다음번엔 $weightStr $repStr 추천".trim()

            exercise.sets.forEach { set ->
                val currentW = set.weight.toFloatOrNull() ?: 0f
                val currentR = set.reps.toIntOrNull() ?: 0
                val newW = ((currentW + weightInc) * 10f).roundToInt() / 10f
                set.weight = newW.toString()
                set.reps = (currentR + repInc).toString()
            }
        }

        return OverloadResult(
            updatedExercise = exercise,
            coachingMessage = message
        )
    }
}
