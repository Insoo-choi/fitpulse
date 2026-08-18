package com.fitpulse.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.TrendingUp
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.fitpulse.app.ui.home.HomeScreen
import com.fitpulse.app.ui.home.HomeViewModel
import com.fitpulse.app.ui.navigation.Screen
import com.fitpulse.app.ui.report.ReportScreen
import com.fitpulse.app.ui.report.ReportViewModel
import com.fitpulse.app.ui.routine.RoutinePasteDialog
import com.fitpulse.app.ui.routine.RoutineViewModel
import com.fitpulse.app.ui.theme.*
import com.fitpulse.app.ui.workout.ActiveWorkoutScreen
import com.fitpulse.app.ui.workout.WorkoutStartScreen
import com.fitpulse.app.ui.workout.WorkoutViewModel
import com.fitpulse.app.ui.workout.dialogs.RpeDialog
import com.fitpulse.app.ui.workout.dialogs.RoutineDiffDialog

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val app = application as FitPulseApplication

        setContent {
            FitPulseTheme {
                val navController = rememberNavController()
                val homeViewModel = remember { HomeViewModel(app.workoutRepository) }
                val workoutViewModel = remember { WorkoutViewModel(app.workoutRepository, app.routineRepository) }
                val reportViewModel = remember { ReportViewModel(app.workoutRepository) }
                val routineViewModel = remember { RoutineViewModel(app.routineRepository, app.exerciseRepository) }

                val workoutHistory by homeViewModel.workouts.collectAsState()
                val routines by workoutViewModel.routines.collectAsState()
                val activeWorkout by workoutViewModel.activeWorkout.collectAsState()
                val userProfile by reportViewModel.userProfile.collectAsState()

                var showPasteDialog by remember { mutableStateOf(false) }
                var showRpeDialog by remember { mutableStateOf(false) }
                var rpeExerciseIndex by remember { mutableStateOf(-1) }
                var showRoutineDiffDialog by remember { mutableStateOf(false) }
                var currentDiffs by remember { mutableStateOf<List<String>>(emptyList()) }

                val navBackStackEntry by navController.currentBackStackEntryAsState()
                val currentRoute = navBackStackEntry?.destination?.route

                Scaffold(
                    bottomBar = {
                        if (currentRoute != Screen.ActiveWorkout.route) {
                            NavigationBar(
                                containerColor = Slate900,
                                contentColor = Color.White
                            ) {
                                NavigationBarItem(
                                    selected = currentRoute == Screen.Home.route,
                                    onClick = { navController.navigate(Screen.Home.route) },
                                    icon = { Icon(Icons.Default.Home, contentDescription = "홈") },
                                    label = { Text("홈") }
                                )
                                NavigationBarItem(
                                    selected = currentRoute == Screen.Workout.route,
                                    onClick = { navController.navigate(Screen.Workout.route) },
                                    icon = { Icon(Icons.Default.PlayArrow, contentDescription = "운동 시작") },
                                    label = { Text("운동 시작") }
                                )
                                NavigationBarItem(
                                    selected = currentRoute == Screen.Report.route,
                                    onClick = { navController.navigate(Screen.Report.route) },
                                    icon = { Icon(Icons.Default.TrendingUp, contentDescription = "리포트") },
                                    label = { Text("리포트") }
                                )
                            }
                        }
                    }
                ) { innerPadding ->
                    NavHost(
                        navController = navController,
                        startDestination = Screen.Home.route,
                        modifier = Modifier.padding(innerPadding)
                    ) {
                        composable(Screen.Home.route) {
                            HomeScreen(
                                workoutHistory = workoutHistory,
                                onStartWorkout = { navController.navigate(Screen.Workout.route) },
                                onOpenRoutinePaste = { showPasteDialog = true }
                            )
                        }

                        composable(Screen.Workout.route) {
                            WorkoutStartScreen(
                                routines = routines,
                                onStartEmpty = {
                                    workoutViewModel.startWorkout(null)
                                    navController.navigate(Screen.ActiveWorkout.route)
                                },
                                onStartRoutine = { routine ->
                                    workoutViewModel.startWorkout(routine)
                                    navController.navigate(Screen.ActiveWorkout.route)
                                },
                                onCreateRoutine = { /* Open Routine Editor */ },
                                onEditRoutine = { routineId -> /* Edit Routine */ }
                            )
                        }

                        composable(Screen.ActiveWorkout.route) {
                            activeWorkout?.let { workout ->
                                ActiveWorkoutScreen(
                                    workout = workout,
                                    timerSeconds = 0L,
                                    onToggleComplete = { exIdx, setIdx ->
                                        workoutViewModel.toggleSetComplete(exIdx, setIdx)
                                    },
                                    onCompleteAll = { exIdx ->
                                        workoutViewModel.completeAllSets(exIdx)
                                    },
                                    onAddSet = { exIdx -> workoutViewModel.addSet(exIdx) },
                                    onRemoveExercise = { exIdx -> workoutViewModel.removeExercise(exIdx) },
                                    onFinish = {
                                        val diffs = workoutViewModel.checkRoutineDiff()
                                        if (diffs.isNotEmpty()) {
                                            currentDiffs = diffs
                                            showRoutineDiffDialog = true
                                        } else {
                                            workoutViewModel.finishWorkout(
                                                durationMin = 45,
                                                userWeight = userProfile.bodyWeight,
                                                updateRoutine = false
                                            )
                                            navController.popBackStack()
                                        }
                                    },
                                    onCancel = {
                                        workoutViewModel.cancelWorkout()
                                        navController.popBackStack()
                                    }
                                )
                            }
                        }

                        composable(Screen.Report.route) {
                            ReportScreen(
                                workouts = workoutHistory,
                                profile = userProfile,
                                onSaveProfile = { h, w, inc ->
                                    reportViewModel.updateProfile(h, w, inc)
                                }
                            )
                        }
                    }
                }

                // Dialogs
                if (showPasteDialog) {
                    RoutinePasteDialog(
                        onParse = { text, name, startNow ->
                            routineViewModel.parseAndSaveRoutine(text, name) { savedRoutine ->
                                showPasteDialog = false
                                if (startNow) {
                                    workoutViewModel.startWorkout(savedRoutine)
                                    navController.navigate(Screen.ActiveWorkout.route)
                                }
                            }
                        },
                        onDismiss = { showPasteDialog = false }
                    )
                }

                if (showRoutineDiffDialog) {
                    RoutineDiffDialog(
                        diffs = currentDiffs,
                        onConfirm = { updateRoutine ->
                            workoutViewModel.finishWorkout(
                                durationMin = 45,
                                userWeight = userProfile.bodyWeight,
                                updateRoutine = updateRoutine
                            )
                            showRoutineDiffDialog = false
                            navController.popBackStack()
                        }
                    )
                }
            }
        }
    }
}
