package com.fitpulse.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.fitpulse.app.data.model.Exercise
import com.fitpulse.app.data.model.SetItem
import com.fitpulse.app.ui.theme.*

@Composable
fun RestTimerBar(
    remainingSeconds: Long,
    onAddSeconds: (Int) -> Unit,
    onSkip: () -> Unit,
    modifier: Modifier = Modifier
) {
    val isOvertime = remainingSeconds < 0
    val absSec = kotlin.math.abs(remainingSeconds)
    val m = (absSec / 60).toString().padStart(2, '0')
    val s = (absSec % 60).toString().padStart(2, '0')
    val timeText = if (isOvertime) "+$m:$s" else "$m:$s"

    Card(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp),
        colors = CardDefaults.cardColors(containerColor = Slate800),
        shape = RoundedCornerShape(16.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(40.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .background(if (isOvertime) Rose500.copy(alpha = 0.2f) else Slate700),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Timer,
                        contentDescription = "휴식",
                        tint = if (isOvertime) Rose400 else Brand300
                    )
                }
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                    Text(
                        text = if (isOvertime) "휴식 초과" else "휴식 타이머",
                        color = Slate400,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = timeText,
                        color = if (isOvertime) Rose400 else Color.White,
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Black
                    )
                }
            }

            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                Button(
                    onClick = { onAddSeconds(-30) },
                    colors = ButtonDefaults.buttonColors(containerColor = Slate700),
                    shape = RoundedCornerShape(8.dp),
                    contentPadding = PaddingValues(horizontal = 10.dp, vertical = 6.dp)
                ) {
                    Text("-30초", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Slate300)
                }
                Button(
                    onClick = { onAddSeconds(30) },
                    colors = ButtonDefaults.buttonColors(containerColor = Slate700),
                    shape = RoundedCornerShape(8.dp),
                    contentPadding = PaddingValues(horizontal = 10.dp, vertical = 6.dp)
                ) {
                    Text("+30초", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Slate300)
                }
                Button(
                    onClick = onSkip,
                    colors = ButtonDefaults.buttonColors(containerColor = Rose900.copy(alpha = 0.6f)),
                    shape = RoundedCornerShape(8.dp),
                    contentPadding = PaddingValues(horizontal = 10.dp, vertical = 6.dp)
                ) {
                    Text("스킵", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Rose400)
                }
            }
        }
    }
}

val Rose900 = Color(0xFF4C0519)

@Composable
fun ExerciseCardItem(
    exercise: Exercise,
    index: Int,
    onSetClick: (setIndex: Int) -> Unit,
    onToggleComplete: (setIndex: Int) -> Unit,
    onCompleteAll: () -> Unit,
    onAddSet: () -> Unit,
    onRemoveExercise: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 6.dp),
        colors = CardDefaults.cardColors(containerColor = Slate800),
        shape = RoundedCornerShape(20.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = exercise.name,
                        color = Color.White,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Black
                    )
                    exercise.aiMessage?.let {
                        Text(
                            text = it,
                            color = Emerald400,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier
                                .padding(top = 4.dp)
                                .clip(RoundedCornerShape(6.dp))
                                .background(Emerald600.copy(alpha = 0.2f))
                                .padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                    }
                }
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    TextButton(onClick = onCompleteAll) {
                        Text("전체 완료", color = Emerald400, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                    TextButton(onClick = onRemoveExercise) {
                        Text("삭제", color = Slate500, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            exercise.sets.forEachIndexed { sIdx, set ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text(
                        text = "${sIdx + 1}",
                        color = Slate500,
                        fontWeight = FontWeight.Bold,
                        fontSize = 12.sp,
                        modifier = Modifier.width(20.dp)
                    )

                    Row(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(12.dp))
                            .background(Slate900.copy(alpha = 0.6f))
                            .clickable { onSetClick(sIdx) }
                            .padding(vertical = 8.dp, horizontal = 12.dp),
                        horizontalArrangement = Arrangement.SpaceAround
                    ) {
                        Text("${set.weight} kg", color = if (set.completed) Slate400 else Color.White, fontWeight = FontWeight.Bold)
                        Text("${set.reps} 회", color = if (set.completed) Slate400 else Color.White, fontWeight = FontWeight.Bold)
                    }

                    IconButton(
                        onClick = { onToggleComplete(sIdx) },
                        modifier = Modifier
                            .size(40.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(if (set.completed) Emerald500.copy(alpha = 0.2f) else Slate700)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Check,
                            contentDescription = "완료",
                            tint = if (set.completed) Emerald400 else Slate400
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            OutlinedButton(
                onClick = onAddSet,
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text("+ 세트 추가", color = Slate400, fontSize = 13.sp, fontWeight = FontWeight.Bold)
            }
        }
    }
}
