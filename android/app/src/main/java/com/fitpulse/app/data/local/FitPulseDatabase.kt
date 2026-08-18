package com.fitpulse.app.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.fitpulse.app.data.local.dao.ExerciseDao
import com.fitpulse.app.data.local.dao.RoutineDao
import com.fitpulse.app.data.local.dao.WorkoutDao
import com.fitpulse.app.data.local.entity.ExerciseEntity
import com.fitpulse.app.data.local.entity.RoutineEntity
import com.fitpulse.app.data.local.entity.WorkoutEntity

@Database(
    entities = [WorkoutEntity::class, RoutineEntity::class, ExerciseEntity::class],
    version = 1,
    exportSchema = false
)
abstract class FitPulseDatabase : RoomDatabase() {
    abstract fun workoutDao(): WorkoutDao
    abstract fun routineDao(): RoutineDao
    abstract fun exerciseDao(): ExerciseDao

    companion object {
        @Volatile
        private var INSTANCE: FitPulseDatabase? = null

        fun getDatabase(context: Context): FitPulseDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    FitPulseDatabase::class.java,
                    "fitpulse_db"
                ).build()
                INSTANCE = instance
                instance
            }
        }
    }
}
