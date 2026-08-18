package com.fitpulse.app.ui.workout

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.fitpulse.app.data.model.Routine
import com.fitpulse.app.data.model.WorkoutRecord
import com.fitpulse.app.ui.components.ExerciseCardItem
import com.fitpulse.app.ui.theme.*

@Composable
fun WorkoutStartScreen(
    routines: List<Routine>,
    onStartEmpty: () -> Unit,
    onStartRoutine: (Routine) -> Unit,
    onCreateRoutine: () -> Unit,
    onEditRoutine: (String) -> Unit
) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(Slate900)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Text("운동 시작", color = Color.White, fontSize = 24.sp, fontWeight = FontWeight.Black)
        }

        item {
            Button(
                onClick = onStartEmpty,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(60.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Brand600),
                shape = RoundedCornerShape(20.dp)
            ) {
                Icon(Icons.Default.Add, contentDescription = null, tint = Color.White)
                Spacer(modifier = Modifier.width(8.dp))
                Text("자율 운동 (빈 화면)", fontSize = 16.sp, fontWeight = FontWeight.Black)
            }
        }

        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("내 루틴 목록", color = Slate300, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                Button(
                    onClick = onCreateRoutine,
                    colors = ButtonDefaults.buttonColors(containerColor = Brand900.copy(alpha = 0.5f)),
                    shape = RoundedCornerShape(12.dp),
                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Text("+ 새 루틴", color = Brand300, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }
            }
        }

        items(routines.size) { idx ->
            val r = routines[idx]
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(20.dp))
                    .clickable { onStartRoutine(r) },
                colors = CardDefaults.cardColors(containerColor = Slate800)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(r.name, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                        Text(
                            r.exercises.joinToString(", ") { it.name },
                            color = Slate400,
                            fontSize = 12.sp,
                            maxLines = 1
                        )
                    }
                    IconButton(onClick = { onEditRoutine(r.id) }) {
                        Icon(Icons.Default.Edit, contentDescription = "편집", tint = Slate400)
                    }
                }
            }
        }
    }
}

@Composable
fun ActiveWorkoutScreen(
    workout: WorkoutRecord,
    timerSeconds: Long,
    onToggleComplete: (exIdx: Int, setIdx: Int) -> Unit,
    onCompleteAll: (exIdx: Int) -> Unit,
    onAddSet: (exIdx: Int) -> Unit,
    onRemoveExercise: (exIdx: Int) -> Unit,
    onFinish: () -> Unit,
    onCancel: () -> Unit
) {
    val h = (timerSeconds / 3600).toString().padStart(2, '0')
    val m = ((timerSeconds % 3600) / 60).toString().padStart(2, '0')
    val s = (timerSeconds % 60).toString().padStart(2, '0')

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Slate900)
    ) {
        // Workout Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(Slate900)
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(workout.name, color = Color.White, fontSize = 20.sp, fontWeight = FontWeight.Black)
                Text("$h:$m:$s", color = Brand300, fontSize = 16.sp, fontWeight = FontWeight.Black)
            }

            Button(
                onClick = onFinish,
                colors = ButtonDefaults.buttonColors(containerColor = Emerald600),
                shape = RoundedCornerShape(16.dp)
            ) {
                Icon(Icons.Default.CheckCircle, contentDescription = null, tint = Color.White)
                Spacer(modifier = Modifier.width(6.dp))
                Text("운동 완료", fontWeight = FontWeight.Bold)
            }
        }

        LazyColumn(
            modifier = Modifier
                .weight(1f)
                .padding(horizontal = 16.dp)
        ) {
            itemsIndexed(workout.exercises) { exIdx, exercise ->
                ExerciseCardItem(
                    exercise = exercise,
                    index = exIdx,
                    onSetClick = { /* open set edit */ },
                    onToggleComplete = { setIdx -> onToggleComplete(exIdx, setIdx) },
                    onCompleteAll = { onCompleteAll(exIdx) },
                    onAddSet = { onAddSet(exIdx) },
                    onRemoveExercise = { onRemoveExercise(exIdx) }
                )
            }
        }
    }
}
