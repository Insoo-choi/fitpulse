package com.fitpulse.app

import android.app.Application
import com.fitpulse.app.data.local.FitPulseDatabase
import com.fitpulse.app.data.model.Exercise
import com.fitpulse.app.data.model.Routine
import com.fitpulse.app.data.model.SetItem
import com.fitpulse.app.data.repository.ExerciseRepository
import com.fitpulse.app.data.repository.RoutineRepository
import com.fitpulse.app.data.repository.WorkoutRepository
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class FitPulseApplication : Application() {

    val database by lazy { FitPulseDatabase.getDatabase(this) }
    val workoutRepository by lazy { WorkoutRepository(database.workoutDao()) }
    val routineRepository by lazy { RoutineRepository(database.routineDao()) }
    val exerciseRepository by lazy { ExerciseRepository(database.exerciseDao()) }

    override fun onCreate() {
        super.onCreate()
        initDefaultData()
    }

    private fun initDefaultData() {
        CoroutineScope(Dispatchers.IO).launch {
            // Default Exercises
            val defaults = listOf(
                Exercise("플랫 바벨 벤치프레스", "가슴", "upper_compound"),
                Exercise("인클라인 바벨 벤치프레스", "가슴", "upper_compound"),
                Exercise("데드리프트", "등", "large_compound"),
                Exercise("중량 풀업", "등", "upper_compound"),
                Exercise("바벨 스쿼트", "하체", "large_compound"),
                Exercise("오버헤드 프레스", "어깨", "upper_compound"),
                Exercise("사이드 레터럴 레이즈", "어깨", "isolation"),
                Exercise("바벨 컬", "팔", "isolation"),
                Exercise("플랭크", "코어", "isolation"),
                Exercise("행잉 레그 레이즈", "코어", "isolation")
            )
            exerciseRepository.initDefaultExercises(defaults)

            // Default Jeff Routine
            val jeffRoutine = Routine(
                id = "jeff_upper",
                name = "1. Upper (상체 전체)",
                exercises = listOf(
                    Exercise("인클라인 바벨 벤치프레스", "가슴", "upper_compound", sets = mutableListOf(SetItem("60", "8"), SetItem("60", "8"), SetItem("60", "8"))),
                    Exercise("중량 풀업", "등", "upper_compound", sets = mutableListOf(SetItem("10", "8"), SetItem("10", "8"), SetItem("10", "8"))),
                    Exercise("사이드 레터럴 레이즈", "어깨", "isolation", sets = mutableListOf(SetItem("10", "15"), SetItem("10", "15"), SetItem("10", "15")))
                )
            )
            routineRepository.saveRoutine(jeffRoutine)
        }
    }
}
