package com.fitpulse.app.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "workouts")
data class WorkoutEntity(
    @PrimaryKey val id: String,
    val date: String,
    val name: String,
    val duration: Int,
    val totalVolume: Int,
    val calories: Int,
    val isRunning: Boolean,
    val distance: Float,
    val pace: String,
    val exercisesJson: String
)

@Entity(tableName = "routines")
data class RoutineEntity(
    @PrimaryKey val id: String,
    val name: String,
    val exercisesJson: String
)

@Entity(tableName = "exercises")
data class ExerciseEntity(
    @PrimaryKey val name: String,
    val category: String,
    val type: String,
    val defaultWeightType: String = "total"
)
