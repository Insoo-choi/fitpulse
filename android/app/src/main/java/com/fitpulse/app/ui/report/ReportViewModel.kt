package com.fitpulse.app.ui.report

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.fitpulse.app.data.model.UserProfile
import com.fitpulse.app.data.model.WorkoutRecord
import com.fitpulse.app.data.repository.WorkoutRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn

class ReportViewModel(private val workoutRepository: WorkoutRepository) : ViewModel() {

    val workouts: StateFlow<List<WorkoutRecord>> = workoutRepository.getAllWorkouts()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    private val _userProfile = MutableStateFlow(UserProfile())
    val userProfile: StateFlow<UserProfile> = _userProfile

    fun updateProfile(height: Float, weight: Float, minInc: Float) {
        _userProfile.value = UserProfile(height, weight, minInc)
    }
}
