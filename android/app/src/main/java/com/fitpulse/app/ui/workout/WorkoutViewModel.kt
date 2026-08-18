package com.fitpulse.app.ui.workout

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.fitpulse.app.data.model.*
import com.fitpulse.app.data.repository.RoutineRepository
import com.fitpulse.app.data.repository.WorkoutRepository
import com.fitpulse.app.domain.usecase.CalculateCaloriesUseCase
import com.fitpulse.app.domain.usecase.CalculateOverloadUseCase
import com.fitpulse.app.domain.usecase.DetectRoutineDiffUseCase
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

class WorkoutViewModel(
    private val workoutRepository: WorkoutRepository,
    private val routineRepository: RoutineRepository,
    private val calculateOverloadUseCase: CalculateOverloadUseCase = CalculateOverloadUseCase(),
    private val calculateCaloriesUseCase: CalculateCaloriesUseCase = CalculateCaloriesUseCase(),
    private val detectRoutineDiffUseCase: DetectRoutineDiffUseCase = DetectRoutineDiffUseCase()
) : ViewModel() {

    val routines: StateFlow<List<Routine>> = routineRepository.getAllRoutines()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    private val _activeWorkout = MutableStateFlow<WorkoutRecord?>(null)
    val activeWorkout: StateFlow<WorkoutRecord?> = _activeWorkout

    private val _currentRoutine = MutableStateFlow<Routine?>(null)

    fun startWorkout(routine: Routine?) {
        _currentRoutine.value = routine
        val initialExercises = routine?.exercises?.map { ex ->
            ex.copy(sets = ex.sets.map { it.copy(completed = false) }.toMutableList())
        } ?: emptyList()

        _activeWorkout.value = WorkoutRecord(
            id = System.currentTimeMillis().toString(),
            date = SimpleDateFormat("yyyy-MM-dd", Locale.KOREA).format(Date()),
            name = routine?.name ?: "자율 운동",
            duration = 0,
            totalVolume = 0,
            exercises = initialExercises
        )
    }

    fun toggleSetComplete(exerciseIndex: Int, setIndex: Int) {
        val current = _activeWorkout.value ?: return
        val list = current.exercises.toMutableList()
        val ex = list[exerciseIndex]
        val set = ex.sets[setIndex]
        set.completed = !set.completed
        _activeWorkout.value = current.copy(exercises = list)
    }

    fun completeAllSets(exerciseIndex: Int) {
        val current = _activeWorkout.value ?: return
        val list = current.exercises.toMutableList()
        list[exerciseIndex].sets.forEach { it.completed = true }
        _activeWorkout.value = current.copy(exercises = list)
    }

    fun addSet(exerciseIndex: Int) {
        val current = _activeWorkout.value ?: return
        val list = current.exercises.toMutableList()
        val ex = list[exerciseIndex]
        val last = ex.sets.lastOrNull() ?: SetItem("0", "10")
        ex.sets.add(SetItem(last.weight, last.reps, false))
        _activeWorkout.value = current.copy(exercises = list)
    }

    fun removeExercise(exerciseIndex: Int) {
        val current = _activeWorkout.value ?: return
        val list = current.exercises.toMutableList()
        list.removeAt(exerciseIndex)
        _activeWorkout.value = current.copy(exercises = list)
    }

    fun submitRpe(exerciseIndex: Int, rpeScore: Int, minIncrement: Float) {
        val current = _activeWorkout.value ?: return
        val list = current.exercises.toMutableList()
        val ex = list[exerciseIndex]
        val result = calculateOverloadUseCase(ex, rpeScore, minIncrement)
        result.updatedExercise.rpeRated = true
        result.updatedExercise.aiMessage = result.coachingMessage
        list[exerciseIndex] = result.updatedExercise
        _activeWorkout.value = current.copy(exercises = list)
    }

    fun checkRoutineDiff(): List<String> {
        val routine = _currentRoutine.value ?: return emptyList()
        val current = _activeWorkout.value ?: return emptyList()
        return detectRoutineDiffUseCase(routine, current.exercises)
    }

    fun finishWorkout(durationMin: Int, userWeight: Float, updateRoutine: Boolean) {
        val current = _activeWorkout.value ?: return
        var tVol = 0

        current.exercises.forEach { ex ->
            ex.sets.filter { it.completed }.forEach { s ->
                val w = s.weight.toFloatOrNull() ?: 0f
                val r = s.reps.toIntOrNull() ?: 0
                tVol += (w * r).toInt()
            }
        }

        val kcal = calculateCaloriesUseCase(durationMin, tVol, userWeight)

        val finalRecord = current.copy(
            duration = durationMin,
            totalVolume = tVol,
            calories = kcal
        )

        viewModelScope.launch {
            workoutRepository.saveWorkout(finalRecord)
            if (updateRoutine && _currentRoutine.value != null) {
                val orig = _currentRoutine.value!!
                orig.exercises = current.exercises.map { e ->
                    e.copy(sets = e.sets.map { SetItem(it.weight, it.reps, false) }.toMutableList())
                }
                routineRepository.saveRoutine(orig)
            }
            _activeWorkout.value = null
            _currentRoutine.value = null
        }
    }

    fun cancelWorkout() {
        _activeWorkout.value = null
        _currentRoutine.value = null
    }
}
