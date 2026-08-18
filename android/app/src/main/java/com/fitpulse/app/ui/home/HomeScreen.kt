package com.fitpulse.app.ui.home

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ContentPaste
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.fitpulse.app.data.model.WorkoutRecord
import com.fitpulse.app.ui.theme.*

@Composable
fun HomeScreen(
    workoutHistory: List<WorkoutRecord>,
    onStartWorkout: () -> Unit,
    onOpenRoutinePaste: () -> Unit
) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(Slate900)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Text(
                text = "안녕하세요!\n오늘도 득근해볼까요? 💪",
                color = Color.White,
                fontSize = 24.sp,
                fontWeight = FontWeight.Black,
                lineHeight = 32.sp
            )
        }

        item {
            // 이번 달 기록 요약 카드
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Slate800),
                shape = RoundedCornerShape(24.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("최근 운동 기록", color = Color.White, fontWeight = FontWeight.Bold)
                        Text(
                            text = "${workoutHistory.size}회 완료",
                            color = Brand300,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    if (workoutHistory.isEmpty()) {
                        Text(
                            text = "아직 기록된 운동이 없습니다.\n첫 운동을 시작해보세요!",
                            color = Slate400,
                            fontSize = 13.sp,
                            modifier = Modifier.padding(vertical = 16.dp)
                        )
                    } else {
                        workoutHistory.take(5).forEach { record ->
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 6.dp)
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(Slate900.copy(alpha = 0.5f))
                                    .padding(12.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column {
                                    Text(record.name, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                    Text("${record.date} • ${record.duration}분", color = Slate400, fontSize = 11.sp)
                                }
                                Text(
                                    if (record.isRunning) "${record.distance}km" else "${record.totalVolume}kg",
                                    color = if (record.isRunning) Brand300 else Emerald400,
                                    fontWeight = FontWeight.Black,
                                    fontSize = 14.sp
                                )
                            }
                        }
                    }
                }
            }
        }

        item {
            // 빠른 액션 버튼 2개
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .clip(RoundedCornerShape(24.dp))
                        .background(
                            Brush.linearGradient(listOf(Brand600, Brand700))
                        )
                        .clickable { onStartWorkout() }
                        .padding(16.dp)
                ) {
                    Column {
                        Box(
                            modifier = Modifier
                                .size(40.dp)
                                .clip(RoundedCornerShape(12.dp))
                                .background(Color.White.copy(alpha = 0.2f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.PlayArrow, contentDescription = null, tint = Color.White)
                        }
                        Spacer(modifier = Modifier.height(12.dp))
                        Text("운동 시작", color = Color.White, fontWeight = FontWeight.Black, fontSize = 16.sp)
                        Text("루틴 또는 자율운동", color = Brand300, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                }

                Box(
                    modifier = Modifier
                        .weight(1f)
                        .clip(RoundedCornerShape(24.dp))
                        .background(Slate800)
                        .clickable { onOpenRoutinePaste() }
                        .padding(16.dp)
                ) {
                    Column {
                        Box(
                            modifier = Modifier
                                .size(40.dp)
                                .clip(RoundedCornerShape(12.dp))
                                .background(Slate700),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.ContentPaste, contentDescription = null, tint = Slate300)
                        }
                        Spacer(modifier = Modifier.height(12.dp))
                        Text("루틴 붙여넣기", color = Color.White, fontWeight = FontWeight.Black, fontSize = 16.sp)
                        Text("텍스트로 시작", color = Slate400, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}
