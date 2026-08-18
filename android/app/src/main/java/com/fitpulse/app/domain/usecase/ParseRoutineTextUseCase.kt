package com.fitpulse.app.domain.usecase

import com.fitpulse.app.data.model.Exercise
import com.fitpulse.app.data.model.Routine
import com.fitpulse.app.data.model.SetItem
import java.text.SimpleDateFormat
import java.util.*
import kotlin.math.max
import kotlin.math.min

class ParseRoutineTextUseCase {
    operator fun invoke(
        text: String,
        customName: String?,
        knownExercises: List<Exercise>
    ): Routine? {
        val lines = text.lines().map { it.trim() }.filter { it.isNotEmpty() }
        if (lines.isEmpty()) return null

        var routineTitle = customName?.trim().orEmpty()
        val parsedExercises = mutableListOf<Exercise>()

        for (line in lines) {
            // Header detection
            val titleRegex = Regex("^\\[(.*?)\\]|^#+\\s*(.*?)$|^===(.*?)===")
            val match = titleRegex.find(line)
            if (match != null && routineTitle.isEmpty()) {
                routineTitle = (match.groups[1]?.value ?: match.groups[2]?.value ?: match.groups[3]?.value ?: "").trim()
                continue
            }

            var clean = line.replace(Regex("^[\\d\\.\\)\\-\\*•\\s]+"), "").trim()

            // Extract weight: 60kg, 60.5kg
            val weightMatch = Regex("(\\d+(?:\\.\\d+)?)\\s*(?:kg|k|키로)", RegexOption.IGNORE_CASE).find(clean)
            val weight = weightMatch?.groups?.get(1)?.value ?: "0"

            // Extract reps: 8회, 8reps, 8r
            val repMatch = Regex("(\\d+)\\s*(?:회|reps?|r)\\b", RegexOption.IGNORE_CASE).find(clean)
                ?: Regex("(?:x|X|\\*)\\s*(\\d+)").find(clean)
            var reps = repMatch?.groups?.get(1)?.value ?: "10"

            // Extract sets: 3세트, 3sets, 3s
            val setMatch = Regex("(\\d+)\\s*(?:세트|sets?|s)\\b", RegexOption.IGNORE_CASE).find(clean)
            var setCount = setMatch?.groups?.get(1)?.value?.toIntOrNull() ?: 3

            // Check 3x8 format
            val setRepMatch = Regex("(\\d+)\\s*(?:x|X|\\*)\\s*(\\d+)").find(clean)
            if (setMatch == null && setRepMatch != null) {
                setCount = setRepMatch.groups[1]?.value?.toIntOrNull() ?: 3
                reps = setRepMatch.groups[2]?.value ?: "10"
            }

            // Exercise name isolation
            val exName = clean
                .replace(Regex("(\\d+(?:\\.\\d+)?)\\s*(?:kg|k|키로)", RegexOption.IGNORE_CASE), "")
                .replace(Regex("(\\d+)\\s*(?:세트|sets?|s)", RegexOption.IGNORE_CASE), "")
                .replace(Regex("(\\d+)\\s*(?:회|reps?|r)", RegexOption.IGNORE_CASE), "")
                .replace(Regex("(?:x|X|\\*)\\s*\\d+"), "")
                .replace(Regex("[:\\-,\\/]"), "")
                .trim()

            if (exName.isEmpty()) continue

            // Match known exercise
            val matched = knownExercises.find {
                it.name.equals(exName, ignoreCase = true) || it.name.contains(exName) || exName.contains(it.name)
            }

            val finalName = matched?.name ?: exName
            val category = matched?.category ?: "가슴"
            val type = matched?.type ?: "upper_compound"

            val sets = (1..min(max(setCount, 1), 10)).map {
                SetItem(weight = weight, reps = reps, completed = false)
            }.toMutableList()

            parsedExercises.add(
                Exercise(
                    name = finalName,
                    category = category,
                    type = type,
                    sets = sets
                )
            )
        }

        if (parsedExercises.isEmpty()) return null

        if (routineTitle.isEmpty()) {
            val dateStr = SimpleDateFormat("M/d", Locale.KOREA).format(Date())
            routineTitle = "붙여넣은 루틴 $dateStr"
        }

        return Routine(
            id = "routine_${System.currentTimeMillis()}",
            name = routineTitle,
            exercises = parsedExercises
        )
    }
}
