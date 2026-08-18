package com.fitpulse.app.data.model

data class SetItem(
    var weight: String = "0",
    var reps: String = "10",
    var completed: Boolean = false
)

data class Exercise(
    val name: String,
    val category: String = "가슴",
    val type: String = "upper_compound", // large_compound, upper_compound, isolation
    var weightType: String = "total",    // total, single, machine
    var sets: MutableList<SetItem> = mutableListOf(),
    var aiMessage: String? = null,
    var rpeRated: Boolean = false
)

data class Routine(
    val id: String,
    var name: String,
    var exercises: List<Exercise>
)

data class WorkoutRecord(
    val id: String,
    val date: String,
    val name: String,
    val duration: Int,
    val totalVolume: Int,
    val calories: Int = 0,
    val isRunning: Boolean = false,
    val distance: Float = 0f,
    val pace: String = "",
    val exercises: List<Exercise> = emptyList()
)

data class UserProfile(
    var height: Float = 175f,
    var bodyWeight: Float = 70f,
    var minIncrement: Float = 2.5f,
    var defaultRestTime: Int = 60
)
