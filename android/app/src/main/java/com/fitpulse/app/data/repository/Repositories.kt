package com.fitpulse.app.data.repository

import com.fitpulse.app.data.local.dao.ExerciseDao
import com.fitpulse.app.data.local.dao.RoutineDao
import com.fitpulse.app.data.local.dao.WorkoutDao
import com.fitpulse.app.data.local.entity.ExerciseEntity
import com.fitpulse.app.data.local.entity.RoutineEntity
import com.fitpulse.app.data.local.entity.WorkoutEntity
import com.fitpulse.app.data.model.Exercise
import com.fitpulse.app.data.model.Routine
import com.fitpulse.app.data.model.WorkoutRecord
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

class WorkoutRepository(private val workoutDao: WorkoutDao) {
    private val gson = Gson()

    fun getAllWorkouts(): Flow<List<WorkoutRecord>> {
        return workoutDao.getAllWorkouts().map { list ->
            list.map { entity ->
                val type = object : TypeToken<List<Exercise>>() {}.type
                val exercises: List<Exercise> = try {
                    gson.fromJson(entity.exercisesJson, type) ?: emptyList()
                } catch (e: Exception) {
                    emptyList()
                }
                WorkoutRecord(
                    id = entity.id,
                    date = entity.date,
                    name = entity.name,
                    duration = entity.duration,
                    totalVolume = entity.totalVolume,
                    calories = entity.calories,
                    isRunning = entity.isRunning,
                    distance = entity.distance,
                    pace = entity.pace,
                    exercises = exercises
                )
            }
        }
    }

    suspend fun saveWorkout(record: WorkoutRecord) {
        val entity = WorkoutEntity(
            id = record.id,
            date = record.date,
            name = record.name,
            duration = record.duration,
            totalVolume = record.totalVolume,
            calories = record.calories,
            isRunning = record.isRunning,
            distance = record.distance,
            pace = record.pace,
            exercisesJson = gson.toJson(record.exercises)
        )
        workoutDao.insertWorkout(entity)
    }
}

class RoutineRepository(private val routineDao: RoutineDao) {
    private val gson = Gson()

    fun getAllRoutines(): Flow<List<Routine>> {
        return routineDao.getAllRoutines().map { list ->
            list.map { entity ->
                val type = object : TypeToken<List<Exercise>>() {}.type
                val exercises: List<Exercise> = try {
                    gson.fromJson(entity.exercisesJson, type) ?: emptyList()
                } catch (e: Exception) {
                    emptyList()
                }
                Routine(
                    id = entity.id,
                    name = entity.name,
                    exercises = exercises
                )
            }
        }
    }

    suspend fun saveRoutine(routine: Routine) {
        val entity = RoutineEntity(
            id = routine.id,
            name = routine.name,
            exercisesJson = gson.toJson(routine.exercises)
        )
        routineDao.insertRoutine(entity)
    }

    suspend fun deleteRoutine(id: String) {
        routineDao.deleteRoutineById(id)
    }
}

class ExerciseRepository(private val exerciseDao: ExerciseDao) {
    fun getAllExercises(): Flow<List<Exercise>> {
        return exerciseDao.getAllExercises().map { list ->
            list.map {
                Exercise(
                    name = it.name,
                    category = it.category,
                    type = it.type,
                    weightType = it.defaultWeightType
                )
            }
        }
    }

    suspend fun addExercise(exercise: Exercise) {
        exerciseDao.insertExercise(
            ExerciseEntity(
                name = exercise.name,
                category = exercise.category,
                type = exercise.type,
                defaultWeightType = exercise.weightType
            )
        )
    }

    suspend fun initDefaultExercises(exercises: List<Exercise>) {
        exerciseDao.insertAll(
            exercises.map {
                ExerciseEntity(
                    name = it.name,
                    category = it.category,
                    type = it.type,
                    defaultWeightType = it.weightType
                )
            }
        )
    }
}
