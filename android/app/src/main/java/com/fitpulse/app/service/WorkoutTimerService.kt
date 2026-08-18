package com.fitpulse.app.service

import android.app.Service
import android.content.Intent
import android.os.Binder
import android.os.IBinder
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

class WorkoutTimerService : Service() {

    private val binder = LocalBinder()
    private val serviceScope = CoroutineScope(Dispatchers.Default + Job())
    private lateinit var notificationHelper: NotificationHelper

    private val _workoutSeconds = MutableStateFlow(0L)
    val workoutSeconds: StateFlow<Long> = _workoutSeconds

    private val _restSeconds = MutableStateFlow(0L)
    val restSeconds: StateFlow<Long> = _restSeconds

    private val _isResting = MutableStateFlow(false)
    val isResting: StateFlow<Boolean> = _isResting

    private var workoutStartTime: Long = 0L
    private var restTargetTime: Long = 0L
    private var timerJob: Job? = null

    inner class LocalBinder : Binder() {
        fun getService(): WorkoutTimerService = this@WorkoutTimerService
    }

    override fun onCreate() {
        super.onCreate()
        notificationHelper = NotificationHelper(this)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        startForeground(
            NotificationHelper.NOTIFICATION_ID,
            notificationHelper.buildTimerNotification("FitPulse Pro", "운동 진행 중...")
        )
        startTimerLoop()
        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder = binder

    fun startWorkoutSession(startTime: Long) {
        workoutStartTime = startTime
        startTimerLoop()
    }

    fun startRestCountdown(seconds: Int) {
        restTargetTime = System.currentTimeMillis() + (seconds * 1000L)
        _isResting.value = true
    }

    fun adjustRestTime(deltaSeconds: Int) {
        restTargetTime += deltaSeconds * 1000L
    }

    fun skipRest() {
        _isResting.value = false
        _restSeconds.value = 0L
    }

    private fun startTimerLoop() {
        if (timerJob?.isActive == true) return
        timerJob = serviceScope.launch {
            while (isActive) {
                if (workoutStartTime > 0) {
                    val diff = (System.currentTimeMillis() - workoutStartTime) / 1000
                    _workoutSeconds.value = diff
                }

                if (_isResting.value) {
                    val remaining = (restTargetTime - System.currentTimeMillis()) / 1000
                    _restSeconds.value = remaining
                }

                delay(500)
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        serviceScope.cancel()
    }
}
