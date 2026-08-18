package com.fitpulse.app.ui.routine

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.fitpulse.app.data.model.Exercise
import com.fitpulse.app.data.model.Routine
import com.fitpulse.app.data.repository.ExerciseRepository
import com.fitpulse.app.data.repository.RoutineRepository
import com.fitpulse.app.domain.usecase.ParseRoutineTextUseCase
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class RoutineViewModel(
    private val routineRepository: RoutineRepository,
    private val exerciseRepository: ExerciseRepository,
    private val parseRoutineTextUseCase: ParseRoutineTextUseCase = ParseRoutineTextUseCase()
) : ViewModel() {

    val allExercises: StateFlow<List<Exercise>> = exerciseRepository.getAllExercises()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    fun parseAndSaveRoutine(text: String, customName: String?, onComplete: (Routine) -> Unit) {
        val routine = parseRoutineTextUseCase(text, customName, allExercises.value)
        if (routine != null) {
            viewModelScope.launch {
                routineRepository.saveRoutine(routine)
                onComplete(routine)
            }
        }
    }

    fun saveRoutine(routine: Routine) {
        viewModelScope.launch {
            routineRepository.saveRoutine(routine)
        }
    }

    fun deleteRoutine(id: String) {
        viewModelScope.launch {
            routineRepository.deleteRoutine(id)
        }
    }
}
