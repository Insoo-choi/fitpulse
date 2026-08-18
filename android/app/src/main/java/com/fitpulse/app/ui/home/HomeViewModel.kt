package com.fitpulse.app.ui.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.fitpulse.app.data.model.WorkoutRecord
import com.fitpulse.app.data.repository.WorkoutRepository
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

class HomeViewModel(private val workoutRepository: WorkoutRepository) : ViewModel() {

    val workouts: StateFlow<List<WorkoutRecord>> = workoutRepository.getAllWorkouts()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    fun addRunningRecord(date: String, distance: Float, durationMin: Int) {
        viewModelScope.launch {
            val paceMin = (durationMin / distance).toInt()
            val paceSec = (((durationMin / distance) - paceMin) * 60).toInt().toString().padStart(2, '0')
            val pace = "$paceMin'$paceSec\""

            val record = WorkoutRecord(
                id = System.currentTimeMillis().toString(),
                date = date,
                name = "러닝",
                duration = durationMin,
                totalVolume = 0,
                isRunning = true,
                distance = distance,
                pace = pace
            )
            workoutRepository.saveWorkout(record)
        }
    }
}
