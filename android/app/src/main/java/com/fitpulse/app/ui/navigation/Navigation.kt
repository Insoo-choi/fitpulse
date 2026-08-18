package com.fitpulse.app.ui.navigation

sealed class Screen(val route: String) {
    object Home : Screen("home")
    object Workout : Screen("workout")
    object ActiveWorkout : Screen("active_workout")
    object Report : Screen("report")
    object RoutineEdit : Screen("routine_edit/{routineId}") {
        fun createRoute(routineId: String) = "routine_edit/$routineId"
    }
}
