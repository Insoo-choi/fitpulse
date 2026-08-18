package com.fitpulse.app.domain.usecase

import com.fitpulse.app.data.model.Exercise
import com.fitpulse.app.data.model.Routine

class DetectRoutineDiffUseCase {
    operator fun invoke(originalRoutine: Routine, currentExercises: List<Exercise>): List<String> {
        val diffs = mutableListOf<String>()
        val origNames = originalRoutine.exercises.map { it.name }
        val currNames = currentExercises.map { it.name }

        // Added exercises
        currNames.forEach { name ->
            if (!origNames.contains(name)) {
                diffs.add("➕ $name 종목 추가됨")
            }
        }

        // Removed exercises
        origNames.forEach { name ->
            if (!currNames.contains(name)) {
                diffs.add("➖ $name 종목 제외됨")
            }
        }

        // Set counts
        currentExercises.forEach { currEx ->
            val origEx = originalRoutine.exercises.find { it.name == currEx.name }
            if (origEx != null && origEx.sets.size != currEx.sets.size) {
                diffs.add("🔄 ${currEx.name}: 세트 수 변경 (${origEx.sets.size}세트 → ${currEx.sets.size}세트)")
            }
        }

        return diffs
    }
}
